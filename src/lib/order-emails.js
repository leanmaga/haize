'use server';
import { sendEmailWithRetry } from './email-config';
import { orderEmailTemplate } from './email-design';

async function sendOrderEmail(order, user, options) {
  try {
    const title = options.paid ? (options.admin ? 'Pago recibido' : 'Pago confirmado') : (options.admin ? 'Nuevo pedido' : 'Pedido recibido');
    return await sendEmailWithRetry({
      to: options.admin ? process.env.ADMIN_EMAIL || process.env.EMAIL_USER : user.email,
      subject: `${title} - Pedido #${String(order._id).slice(0, 8)}`,
      html: orderEmailTemplate(order, user, options),
    });
  } catch (error) { return { success: false, error: error.message }; }
}
const isPaid = order => ['pagado', 'enviado', 'entregado'].includes(order.status);
export async function sendOrderConfirmationToCustomer(order, user) {
  return sendOrderEmail(order, user, { paid: isPaid(order), admin: false });
}
export async function sendNewOrderNotificationToAdmin(order, user) {
  return sendOrderEmail(order, user, { paid: isPaid(order), admin: true });
}
export async function sendPaymentConfirmationToCustomer(order, user, paymentDetails = null) {
  return sendOrderEmail(order, user, { paid: true, admin: false, payment: paymentDetails });
}
export async function sendPaymentNotificationToAdmin(order, user, paymentDetails = null) {
  return sendOrderEmail(order, user, { paid: true, admin: true, payment: paymentDetails });
}
export async function resendEmails(order, user, emailTypes = ['customer', 'admin']) {
  const results = [];
  for (const type of emailTypes.filter(type => ['customer', 'admin'].includes(type))) {
    const result = await sendOrderEmail(order, user, { paid: isPaid(order), admin: type === 'admin' });
    results.push({ type: `${type}_order`, ...result, to: type === 'admin' ? process.env.ADMIN_EMAIL || process.env.EMAIL_USER : user.email });
  }
  return { success: results.every(result => result.success), results, orderData: { orderId: order._id, userEmail: user.email, status: order.status, emailTypes } };
}
export async function sendPaymentConfirmedEmails(order, user, paymentDetails) {
  const customerResult = await sendPaymentConfirmationToCustomer(order, user, paymentDetails);
  const adminResult = await sendPaymentNotificationToAdmin(order, user, paymentDetails);
  return { success: customerResult.success && adminResult.success, customerResult, adminResult, orderId: order._id };
}
