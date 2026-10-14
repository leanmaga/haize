import { contactNotificationTemplate, questionNotificationTemplate, accountEmailTemplate, emailPreviewTemplate } from './message-email-templates';
test('contact notification keeps fields and escapes submitted HTML', () => {
  const html = contactNotificationTemplate({ nombreApellido: '<img onerror=bad>', email: 'buyer@example.com', motivo: 'Cambio', telefono: '123', localidad: 'Morón', pais: 'Argentina', comentarios: 'Consulta\nen dos líneas' });
  expect(html).toContain('&lt;img onerror=bad&gt;');
  expect(html).toContain('Consulta\nen dos líneas');
  expect(html).toContain('mailto:buyer@example.com');
  expect(html).toContain('background:#000000;color:#ffffff');
});
test('customer response keeps question, answer and product link', () => {
  const html = questionNotificationTemplate({ comment: '¿Hay M?', response: 'Sí, hay stock.' }, { _id: 'p123', title: 'Remera' }, { name: 'Cliente' }, true);
  expect(html).toContain('¿Hay M?'); expect(html).toContain('Sí, hay stock.');
  expect(html).toContain('/products/p123#reviews-section');
  expect(html).not.toContain('envío gratis');
});
test('account template preserves token URL', () => {
  expect(accountEmailTemplate('https://example.com/reset/token', true)).toContain('href="https://example.com/reset/token"');
});
test.each(['test', 'verification', 'password-reset', 'order-confirmation', 'admin-order-notification', 'payment-confirmation', 'admin-payment-notification'])('preview %s uses HAIZE shell without legacy accent colors', type => {
  const html = emailPreviewTemplate(type);
  expect(html).toContain('HAIZE'); expect(html).toContain('Nexa');
  expect(html).not.toMatch(/#4CAF50|#10b981|#f59e0b|#3b82f6/);
  if (type.includes('order') || type.includes('payment')) {
    expect(html).toContain('Envío'); expect(html).toContain('5.000,00');
  }
});
