import { emailLayout, emailButton, emailBaseUrl, escapeHtml, orderEmailTemplate } from './email-design';

const paragraph = text => `<p style="color:#555555;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(text)}</p>`;
const title = text => `<h1 style="font-size:26px;line-height:1.25;letter-spacing:1px;text-transform:uppercase">${escapeHtml(text)}</h1>`;
export function contactNotificationTemplate(contact) {
  return emailLayout('Nueva consulta', `${title('Nueva consulta')}
    ${paragraph(contact.motivo)}
    <h2 style="font-size:14px;text-transform:uppercase">Datos de contacto</h2>
    ${paragraph(`${contact.nombreApellido}\n${contact.email}\n${contact.telefono}\n${contact.localidad}, ${contact.pais}`)}
    <h2 style="font-size:14px;text-transform:uppercase">Mensaje</h2>
    ${paragraph(contact.comentarios || 'Sin comentarios adicionales')}
    ${emailButton('Responder por correo', `mailto:${contact.email}`)}`);
}
export function questionNotificationTemplate(question, product, user, answered = false) {
  const heading = answered ? 'Tu consulta fue respondida' : 'Nueva pregunta de un cliente';
  return emailLayout(heading, `${title(heading)}
    ${paragraph(answered ? `Hola ${user.name}, tenemos una respuesta para vos.` : `Cliente: ${user.name}\nEmail: ${user.email}\nTeléfono: ${user.phone || 'No proporcionado'}`)}
    <h2 style="font-size:14px;text-transform:uppercase">${escapeHtml(product.title)}</h2>
    <div style="border-top:1px solid #dddddd;border-bottom:1px solid #dddddd;padding:12px 0"><strong>Pregunta</strong>${paragraph(question.comment)}</div>
    ${answered ? `<div style="padding:12px 0"><strong>Nuestra respuesta</strong>${paragraph(question.response)}</div>` : ''}
    ${emailButton(answered ? 'Ver producto y respuesta' : 'Responder en administración', `${emailBaseUrl()}${answered ? `/products/${product._id}#reviews-section` : '/admin/questions'}`)}
    ${answered ? emailButton('Contactar por WhatsApp', 'https://wa.me/5491126907696') : ''}`);
}
export function accountEmailTemplate(url, reset = false, preview = false) {
  const heading = reset ? 'Restablecer contraseña' : 'Verificá tu cuenta';
  return emailLayout(heading, `${title(heading)}
    ${paragraph(reset ? 'Recibimos una solicitud para cambiar tu contraseña. Si no la solicitaste, podés ignorar este mensaje.' : 'Gracias por registrarte en HAIZE. Confirmá tu correo para completar el registro.')}
    ${emailButton(reset ? 'Restablecer contraseña' : 'Verificar cuenta', url)}
    ${paragraph(`El enlace vence en ${reset ? '1 hora' : '24 horas'}.`)}
    ${paragraph(url)}
    ${preview ? paragraph('VISTA PREVIA: este enlace de ejemplo no es funcional.') : ''}`);
}
export function basicTestEmailTemplate() {
  return emailLayout('Correo de prueba', `${title('Correo de prueba')}${paragraph('Este mensaje permite comprobar el diseño y la entrega de los correos de HAIZE. No corresponde a una compra real.')}`);
}
// The admin test panel uses the same production templates, with synthetic data.
export function emailPreviewTemplate(type) {
  if (type === 'test') return basicTestEmailTemplate();
  if (type === 'verification' || type === 'password-reset') {
    return accountEmailTemplate(`${emailBaseUrl()}/auth/${type === 'verification' ? 'verify-email?token=preview' : 'reset-password/preview'}`, type === 'password-reset', true);
  }
  const paid = type.includes('payment');
  const order = { _id: 'TEST1234', status: paid ? 'pagado' : 'pendiente', createdAt: new Date(), subtotal: 20000, shippingCost: 5000, shippingQuoted: true, totalAmount: 25000, items: [{ title: 'Producto de ejemplo', quantity: 2, price: 10000, size: 'M', color: 'Negro' }], shippingInfo: { name: 'Cliente de ejemplo', address: 'Dirección de ejemplo', city: 'Buenos Aires' } };
  return orderEmailTemplate(order, { name: 'Cliente de ejemplo', email: 'cliente@example.com' }, { paid, admin: type.startsWith('admin-') }).replace('<h1 ', '<p style="font-size:12px;color:#555555">VISTA PREVIA · Datos de ejemplo, sin compra real</p><h1 ');
}
