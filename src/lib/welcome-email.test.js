jest.mock('@/models/Coupon', () => ({ __esModule: true, default: { findOneAndUpdate: jest.fn(), findByCode: jest.fn() } }));
jest.mock('@/models/WelcomeEmail', () => ({ __esModule: true, default: { updateOne: jest.fn(), findOneAndUpdate: jest.fn() } }));
jest.mock('@/lib/email-config', () => ({ sendEmailWithRetry: jest.fn() }));
import Coupon from '@/models/Coupon';
import WelcomeEmail from '@/models/WelcomeEmail';
import { sendEmailWithRetry } from '@/lib/email-config';
import { ensureWelcomeCoupon, sendWelcomeEmail, welcomeEmailHtml } from './welcome-email';

const coupon = { discountType: 'percentage', discountValue: 10, oncePerUser: true,
  usageType: 'reusable', usageLimit: null, minimumPurchase: 0, expirationType: 'manual', isActive: true };
beforeEach(() => {
  jest.clearAllMocks();
  Coupon.findOneAndUpdate.mockResolvedValue(coupon);
  WelcomeEmail.updateOne.mockResolvedValue({});
  WelcomeEmail.findOneAndUpdate.mockResolvedValue({ sendingAt: new Date() });
  sendEmailWithRetry.mockResolvedValue({ success: true });
});
test('provisions the fixed code without changing an existing coupon or its uses', async () => {
  await ensureWelcomeCoupon();
  const [filter, update] = Coupon.findOneAndUpdate.mock.calls[0];
  expect(filter).toEqual({ code: 'HAIZE10' });
  expect(Object.keys(update)).toEqual(['$setOnInsert']);
  expect(update.$setOnInsert).toMatchObject({ discountValue: 10, oncePerUser: true, usageLimit: null });
});
test('does not advertise a conflicting or disabled coupon', async () => {
  Coupon.findOneAndUpdate.mockResolvedValue({ ...coupon, discountValue: 5 });
  expect(await sendWelcomeEmail('test@example.com')).toEqual({ success: false });
  expect(sendEmailWithRetry).not.toHaveBeenCalled();
});
test('registration and newsletter share a normalized email identity and one welcome', async () => {
  WelcomeEmail.findOneAndUpdate.mockResolvedValueOnce({ sendingAt: new Date() }).mockResolvedValueOnce(null);
  await sendWelcomeEmail('TEST@example.com ', 'Ana');
  await sendWelcomeEmail('test@example.com');
  expect(sendEmailWithRetry).toHaveBeenCalledTimes(1);
  expect(sendEmailWithRetry).toHaveBeenCalledWith(expect.objectContaining({ to: 'test@example.com' }));
  expect(sendEmailWithRetry.mock.calls[0][0].html).toContain('HAIZE10');
});
test('failed delivery releases the claim and does not mark the email as sent', async () => {
  sendEmailWithRetry.mockResolvedValue({ success: false, error: 'SMTP unavailable' });
  expect(await sendWelcomeEmail('test@example.com')).toEqual({ success: false });
  expect(WelcomeEmail.updateOne).toHaveBeenLastCalledWith(expect.anything(), { $unset: { sendingAt: 1 } });
});
test('welcome uses branded layout and escapes names', () => {
  const html = welcomeEmailHtml('<script>');
  expect(html).toContain('&lt;script&gt;');
  expect(html).toContain('background:#000000');
  expect(html).toContain('Un uso por cuenta');
  expect(html).not.toContain('HAIZE10-');
});
