jest.mock('./email-config', () => ({ sendEmailWithRetry: jest.fn() }));
import { sendEmailWithRetry } from './email-config';
import { sendNewQuestionNotificationToAdmin, sendQuestionAnsweredEmail } from './review-emails';
const admin = process.env.ADMIN_EMAIL;
beforeEach(() => { jest.clearAllMocks(); process.env.ADMIN_EMAIL = 'admin@example.com'; sendEmailWithRetry.mockResolvedValue({ success: true }); });
afterEach(() => { if (admin === undefined) delete process.env.ADMIN_EMAIL; else process.env.ADMIN_EMAIL = admin; });
test('admin question uses proper recipient, subject and HTML with shared sender', async () => {
  await sendNewQuestionNotificationToAdmin({ comment: 'Consulta' }, { title: 'Remera', _id: '123' }, { name: 'Cliente' });
  const email = sendEmailWithRetry.mock.calls[0][0];
  expect(email.to).toBe('admin@example.com'); expect(email.subject).toContain('Remera');
  expect(email.html).toContain('/admin/questions'); expect(email.from).toBeUndefined();
});
test('answer is sent to customer through the configured transport', async () => {
  await sendQuestionAnsweredEmail({ comment: 'Consulta', response: 'Respuesta' }, { title: 'Remera', _id: '123' }, { email: 'customer@example.com' });
  expect(sendEmailWithRetry.mock.calls[0][0].to).toBe('customer@example.com');
  expect(sendEmailWithRetry.mock.calls[0][0].html).toContain('Respuesta');
});
