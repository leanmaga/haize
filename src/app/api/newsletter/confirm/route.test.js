jest.mock('next/server', () => ({ NextResponse: {
  json: (data, options) => ({ data, status: options?.status || 200 }),
  redirect: url => ({ status: 307, url: String(url) }),
} }));
jest.mock('@/lib/mongodb', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/models/Newsletter', () => ({ __esModule: true, default: { findOne: jest.fn() } }));
jest.mock('@/lib/welcome-email', () => ({ WELCOME_CODE: 'HAIZE10', sendWelcomeEmail: jest.fn() }));
import Newsletter from '@/models/Newsletter';
import { sendWelcomeEmail } from '@/lib/welcome-email';
import { GET } from './route';

test('confirmation persists HAIZE10 and retries a failed welcome with the same token', async () => {
  const subscriber = { email: 'new@example.com', status: 'pending', save: jest.fn() };
  Newsletter.findOne.mockResolvedValue(subscriber);
  sendWelcomeEmail.mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true });
  const request = { url: 'https://www.haize.com.ar/api/newsletter/confirm?token=test' };
  expect((await GET(request)).status).toBe(503);
  expect(subscriber.discountCode).toBe('HAIZE10');
  expect(subscriber.status).toBe('confirmed');
  expect((await GET(request)).url).toBe('https://www.haize.com.ar/newsletter/success');
});
test('old unsubscribed tokens cannot subscribe or send a welcome again', async () => {
  sendWelcomeEmail.mockClear();
  Newsletter.findOne.mockResolvedValue({ status: 'unsubscribed' });
  expect((await GET({ url: 'https://example.com?token=old' })).status).toBe(400);
  expect(sendWelcomeEmail).not.toHaveBeenCalled();
});
