import { orderEmailTemplate, orderTotals } from './email-design';
const order = { _id: '6acd0a631234567812345678', createdAt: '2026-10-12T16:28:00Z', status: 'pagado', totalAmount: 25000, subtotal: 20000, shippingCost: 5000, shippingQuoted: true, items: [{ title: 'Pantalón negro', quantity: 2, price: 10000, size: 'M', color: 'Negro' }], shippingInfo: {} };
const user = { name: 'Cliente', email: 'test@example.com' };
test('separates unit price, products, shipping and paid total', () => {
  const html = orderEmailTemplate(order, user, { paid: true });
  expect(html).toContain('Precio unitario:');
  expect(html).toContain('Cantidad: 2');
  expect(html).toMatch(/Subtotal de productos[\s\S]*20\.000,00[\s\S]*Envío[\s\S]*5\.000,00[\s\S]*TOTAL PAGADO[\s\S]*25\.000,00/);
});
test.each([false, true])('customer/admin share breakdown (admin %s)', admin => {
  const html = orderEmailTemplate({ ...order, discountAmount: 2000, totalAmount: 23000 }, user, { paid: true, admin });
  expect(html).toMatch(/Descuento[\s\S]*2\.000,00[\s\S]*Envío[\s\S]*5\.000,00[\s\S]*23\.000,00/);
  expect(html).not.toMatch(/#10b981|#eff6ff|#f59e0b|www\.www/);
  expect(html).toContain('background:#000000;color:#ffffff');
});
test('distinguishes free delivery from delivery to arrange', () => {
  expect(orderTotals({ ...order, shippingCost: 0 })).toMatch(/Envío[\s\S]*0,00/);
  expect(orderTotals({ ...order, shippingCost: 0, shippingQuoted: false })).toContain('A coordinar');
});
test('escapes customer and product input', () => {
  const html = orderEmailTemplate({ ...order, items: [{ title: '<script>bad</script>', price: 100, quantity: 1 }] }, { name: '<b>name</b>' });
  expect(html).not.toContain('<script>');
  expect(html).toContain('&lt;script&gt;');
  expect(html).toContain('&lt;b&gt;name&lt;/b&gt;');
});
test('uses Buenos Aires date and keeps shipped orders payment context', () => {
  const html = orderEmailTemplate(order, user, { paid: true, payment: { id: '123', date_approved: '2026-10-12T16:28:00Z' } });
  expect(html).toContain('13:28');
  expect(html).toContain('ID de pago: 123');
});
