import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { getPaymentById } from '@/lib/mercadopago';
import { reduceStockForOrder } from '@/lib/stock-utils';
import { sendPaymentConfirmationToCustomer, sendPaymentNotificationToAdmin } from '@/lib/order-emails';

export async function confirmMercadoPagoPayment(paymentId, expectedOrderId) {
  const payment = await getPaymentById(paymentId);
  const reference = String(payment.external_reference || '');
  if (!/^[a-f\d]{24}$/i.test(reference) ||
      (expectedOrderId && reference !== String(expectedOrderId))) {
    throw new Error('El pago no corresponde al pedido');
  }
  await connectDB();
  let order = await Order.findById(reference);
  if (!order || order.paymentMethod !== 'mercadopago') throw new Error('Pedido no encontrado');
  if (payment.status !== 'approved') return { paid: false, status: payment.status };
  if (payment.currency_id !== 'ARS' || !Number.isFinite(payment.transaction_amount) ||
      Math.round(payment.transaction_amount * 100) !== Math.round(order.totalAmount * 100)) {
    throw new Error('El importe o la moneda del pago no coincide con el pedido');
  }
  if (order.paymentId && String(order.paymentId) !== String(payment.id)) {
    throw new Error('El pedido ya tiene otro pago asociado');
  }
  // Persist before SMTP/stock, and never regress shipped orders.
  const updated = await Order.findOneAndUpdate({
    _id: order._id, status: { $in: ['pendiente', 'cancelado'] },
  }, { $set: {
    status: 'pagado', paymentId: String(payment.id),
    'paymentDetails.status': 'approved',
    'paymentDetails.method': payment.payment_method_id,
    'paymentDetails.type': payment.payment_type_id,
    'paymentDetails.lastUpdated': new Date(),
  } }, { new: true });
  order = updated || await Order.findById(reference);
  if (order.paymentId && String(order.paymentId) !== String(payment.id)) {
    throw new Error('El pedido fue confirmado con otro pago');
  }
  if (!['pagado', 'enviado', 'entregado'].includes(order.status)) throw new Error('Estado incompatible');
  if (!updated && String(order.paymentId || '') !== String(payment.id)) {
    return { paid: true, status: order.status };
  }
  // Durable stock claim prevents duplicate deductions on concurrent requests.
  const stockClaim = await Order.findOneAndUpdate({
    _id: order._id,
    'paymentDetails.stockReduction': { $exists: false },
    'paymentDetails.stockClaimedAt': { $exists: false },
  }, { $set: { 'paymentDetails.stockClaimedAt': new Date() } });
  if (stockClaim) {
    let result;
    try { result = await reduceStockForOrder(order); }
    catch (error) { result = { success: false, error: error.message }; }
    await Order.updateOne({ _id: order._id }, { $set: {
      'paymentDetails.stockReduction': { ...result, timestamp: new Date() },
    } });
  }
  const user = await User.findById(order.user);
  if (!user) throw new Error('Destinatario no encontrado');
  // Retry failed recipients without resending successful deliveries.
  for (const [recipient, send] of [
    ['customer', sendPaymentConfirmationToCustomer],
    ['admin', sendPaymentNotificationToAdmin],
  ]) {
    const field = `paymentDetails.emailsSent.${recipient}Result`;
    const lock = `paymentDetails.${recipient}EmailLock`;
    const claimed = await Order.findOneAndUpdate({
      _id: order._id, [`${field}.success`]: { $ne: true },
      $or: [{ [lock]: { $exists: false } }, { [lock]: { $lt: new Date(Date.now() - 120000) } }],
    }, { $set: { [lock]: new Date() } });
    if (!claimed) {
      const current = await Order.findById(reference);
      if (!current.paymentDetails?.emailsSent?.[`${recipient}Result`]?.success) {
        throw new Error('Confirmación de correo en curso');
      }
      continue;
    }
    let result;
    try { result = await send(order, user, payment); }
    catch (error) { result = { success: false, error: error.message }; }
    await Order.updateOne({ _id: order._id }, {
      $set: { [field]: { ...result, timestamp: new Date() } }, $unset: { [lock]: '' },
    });
    if (!result.success) throw new Error(`Error enviando confirmación: ${recipient}`);
  }
  return { paid: true, status: order.status };
}
