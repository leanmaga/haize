jest.mock('@/lib/db', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/models/Order', () => ({ __esModule: true, default: { findById: jest.fn(), findOneAndUpdate: jest.fn(), updateOne: jest.fn() } }));
jest.mock('@/models/User', () => ({ __esModule: true, default: { findById: jest.fn() } }));
jest.mock('@/lib/mercadopago', () => ({ getPaymentById: jest.fn() }));
jest.mock('@/lib/stock-utils', () => ({ reduceStockForOrder: jest.fn() }));
jest.mock('@/lib/order-emails', () => ({ sendPaymentConfirmationToCustomer: jest.fn(), sendPaymentNotificationToAdmin: jest.fn() }));
import Order from '@/models/Order';
import User from '@/models/User';
import { getPaymentById } from '@/lib/mercadopago';
import { reduceStockForOrder } from '@/lib/stock-utils';
import { sendPaymentConfirmationToCustomer as customer, sendPaymentNotificationToAdmin as admin } from '@/lib/order-emails';
import { confirmMercadoPagoPayment as confirm } from './mercadopago-confirmation';
const id = '6acd04eea2267e6c656c658f';
let order;
let payment;
beforeEach(() => {
  jest.resetAllMocks();
  order = { _id: id, status: 'pendiente', paymentMethod: 'mercadopago', totalAmount: 20000, user: 'buyer', paymentDetails: {} };
  payment = { id: 123, external_reference: id, status: 'approved', transaction_amount: 20000, currency_id: 'ARS' };
  getPaymentById.mockImplementation(async () => payment);
  Order.findById.mockImplementation(async () => order);
  Order.findOneAndUpdate.mockImplementation(async (filter, update) => {
    if (filter.status) {
      if (!filter.status.$in.includes(order.status)) return null;
      order.status = 'pagado'; order.paymentId = '123'; return order;
    }
    if (update.$set['paymentDetails.stockClaimedAt']) {
      if (order.paymentDetails.stockClaimedAt) return null;
      order.paymentDetails.stockClaimedAt = new Date(); return order;
    }
    const recipient = Object.keys(update.$set)[0].includes('customer') ? 'customer' : 'admin';
    if (order.paymentDetails.emailsSent?.[`${recipient}Result`]?.success) return null;
    return order;
  });
  Order.updateOne.mockImplementation(async (_, update) => {
    for (const [path, value] of Object.entries(update.$set)) {
      if (path.includes('emailsSent')) {
        order.paymentDetails.emailsSent ||= {};
        order.paymentDetails.emailsSent[path.split('.').pop()] = value;
      }
    }
  });
  User.findById.mockResolvedValue({ email: 'test@example.com' });
  reduceStockForOrder.mockResolvedValue({ success: true });
  customer.mockImplementation(async () => {
    expect(order.status).toBe('pagado');
    return { success: true };
  });
  admin.mockResolvedValue({ success: true });
});
test('persists paid and sends both confirmations once across repeated deliveries', async () => {
  expect((await confirm('123', id)).paid).toBe(true);
  await confirm('123', id);
  expect(customer).toHaveBeenCalledTimes(1);
  expect(admin).toHaveBeenCalledTimes(1);
  expect(reduceStockForOrder).toHaveBeenCalledTimes(1);
});
test.each([{ transaction_amount: 1 }, { currency_id: 'USD' }, { external_reference: 'another-order' }])('rejects mismatched payment %j', async (changes) => {
  Object.assign(payment, changes);
  await expect(confirm('123', id)).rejects.toThrow();
  expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
});
test('pending payment never approves or emails', async () => {
  payment.status = 'pending';
  expect((await confirm('123', id)).paid).toBe(false);
  expect(Order.findOneAndUpdate).not.toHaveBeenCalled();
});
test('SMTP failure preserves payment and retries only failed recipient', async () => {
  admin.mockResolvedValueOnce({ success: false }).mockResolvedValue({ success: true });
  await expect(confirm('123', id)).rejects.toThrow();
  expect(order.status).toBe('pagado');
  await confirm('123', id);
  expect(customer).toHaveBeenCalledTimes(1);
  expect(admin).toHaveBeenCalledTimes(2);
  expect(reduceStockForOrder).toHaveBeenCalledTimes(1);
});
test('shipped orders do not regress on duplicate notification', async () => {
  await confirm('123', id);
  order.status = 'enviado';
  await confirm('123', id);
  expect(order.status).toBe('enviado');
});
