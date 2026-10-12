// Keep all order email entry points on the same brand and totals template.
import { orderEmailTemplate } from './email-design';
const paid = order => ['pagado', 'enviado', 'entregado'].includes(order.status);
export const orderConfirmationTemplate = (order, user) => orderEmailTemplate(order, user, { paid: paid(order) });
export const adminOrderNotificationTemplate = (order, user) => orderEmailTemplate(order, user, { paid: paid(order), admin: true });
export const paymentConfirmationTemplate = (order, user, paymentInfo) => orderEmailTemplate(order, user, { paid: true, payment: paymentInfo });
export const adminPaymentNotificationTemplate = (order, user, paymentInfo) => orderEmailTemplate(order, user, { paid: true, admin: true, payment: paymentInfo });
