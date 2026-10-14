'use server';
import { sendEmailWithRetry } from './email-config';
import { questionNotificationTemplate } from './message-email-templates';

export async function sendNewQuestionNotificationToAdmin(question, product, user) {
  try {
    return await sendEmailWithRetry({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `Nueva consulta sobre ${product.title} - HAIZE`,
      html: questionNotificationTemplate(question, product, user),
    });
  } catch (error) { return { success: false, error: error.message }; }
}
export async function sendQuestionAnsweredEmail(question, product, user) {
  try {
    return await sendEmailWithRetry({
      to: user.email,
      subject: `Respondimos tu consulta sobre ${product.title} - HAIZE`,
      html: questionNotificationTemplate(question, product, user, true),
    });
  } catch (error) { return { success: false, error: error.message }; }
}
