jest.mock('./email-config', () => ({ sendEmailWithRetry: jest.fn() }));
import { sendEmailWithRetry } from './email-config';
import { sendPaymentConfirmedEmails, resendEmails } from './order-emails';
const order = { _id: '12345678', status: 'pagado', subtotal: 100, shippingCost: 50, totalAmount: 150, items: [{ title: 'Remera', price: 100, quantity: 1 }] };
beforeEach(() => { jest.resetAllMocks(); sendEmailWithRetry.mockResolvedValue({ success: true }); });
test('payment confirmations preserve both recipient results and shipping breakdown', async () => {
  const result = await sendPaymentConfirmedEmails(order, { email: 'customer@example.com' });
  expect(result.customerResult.success).toBe(true);
  expect(result.adminResult.success).toBe(true);
  expect(sendEmailWithRetry).toHaveBeenCalledTimes(2);
  expect(sendEmailWithRetry.mock.calls[0][0]).toMatchObject({ to: 'customer@example.com', html: expect.stringContaining('Envío') });
});
test('resending a paid order never says payment is pending', async () => {
  await resendEmails(order, { email: 'customer@example.com' }, ['customer']);
  expect(sendEmailWithRetry.mock.calls[0][0].html).toContain('PAGADO');
  expect(sendEmailWithRetry.mock.calls[0][0].html).not.toContain('PENDIENTE');
});
