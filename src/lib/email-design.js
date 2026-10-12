// Shared HAIZE email design. Inline styles remain usable without web-font support.
export const emailFont = "'Nexa', 'Sora', Arial, sans-serif";
export const emailAssetsUrl = 'https://www.haize.com.ar';
export const escapeHtml = (value = '') => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function emailBaseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.NEXTAUTH_URL || emailAssetsUrl).replace(/\/$/, '');
}
export function emailButton(label, url) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto"><tr><td bgcolor="#000000" style="border-radius:2px;text-align:center"><a href="${escapeHtml(url)}" style="display:inline-block;padding:16px 28px;border:1px solid #000000;background:#000000;color:#ffffff;font-family:${emailFont};font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none">${escapeHtml(label)}</a></td></tr></table>`;
}
export function emailLayout(title, content, preheader = title) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title>
  <style>@font-face{font-family:Nexa;src:url('${emailAssetsUrl}/fonts/Nexa/NexaRegular.otf') format('opentype');font-weight:400}@font-face{font-family:Nexa;src:url('${emailAssetsUrl}/fonts/Nexa/NexaBold.otf') format('opentype');font-weight:700}@font-face{font-family:Sora;src:url('${emailAssetsUrl}/fonts/Sora-Regular.ttf') format('truetype')}@media(max-width:480px){.email-content{padding:24px 16px!important}.product-image{width:48px!important;height:64px!important}.email-title{font-size:24px!important}}</style></head>
  <body style="margin:0;padding:0;background:#f5f5f5;color:#111111;font-family:${emailFont};font-size:14px;line-height:1.6">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff">
  <tr><td bgcolor="#000000" align="center" style="padding:30px 20px"><a href="${escapeHtml(emailBaseUrl())}" style="font-family:${emailFont};font-size:36px;font-weight:700;letter-spacing:4px;color:#ffffff;text-decoration:none">HAIZE</a></td></tr>
  <tr><td class="email-content" style="padding:36px 32px;font-family:${emailFont}">${content}</td></tr>
  <tr><td align="center" style="padding:24px;border-top:1px solid #dddddd;color:#666666;font-size:12px">HAIZE · Moda masculina<br>© ${new Date().getFullYear()} HAIZE. Todos los derechos reservados.</td></tr>
  </table></td></tr></table></body></html>`;
}

const money = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(value) || 0);
const row = (label, value, strong = false) => `<tr><td style="padding:10px 0;${strong ? 'border-top:1px solid #000000;font-weight:700' : 'color:#555555'}">${escapeHtml(label)}</td><td align="right" style="padding:10px 0;white-space:nowrap;${strong ? 'border-top:1px solid #000000;font-size:20px;font-weight:700' : ''}">${escapeHtml(value)}</td></tr>`;

export function orderTotals(order, paid = false) {
  const subtotal = order.subtotal ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Do not invent a shipping cost for historical orders that lack a quote.
  const shipping = order.shippingCost > 0 ? money(order.shippingCost)
    : order.shippingQuoted === true ? money(0) : 'A coordinar';
  return `<table aria-label="Resumen de importes" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 24px">
    ${row('Subtotal de productos', money(subtotal))}
    ${order.discountAmount > 0 ? row('Descuento' + (order.appliedCoupon?.code ? ` (${order.appliedCoupon.code})` : ''), `− ${money(order.discountAmount)}`) : ''}
    ${row('Envío', shipping)}
    ${row(paid ? 'TOTAL PAGADO' : 'TOTAL DEL PEDIDO', money(order.totalAmount), true)}
  </table>`;
}

export function orderEmailTemplate(order, user, { paid = false, admin = false, payment = null } = {}) {
  const shortId = String(order._id).slice(0, 8);
  const title = paid ? (admin ? 'Pago recibido' : 'Pago confirmado') : (admin ? 'Nuevo pedido' : 'Pedido recibido');
  const items = (order.items || []).map(item => {
    const src = /^https?:\/\//i.test(item.imageUrl || '') ? item.imageUrl : item.imageUrl?.startsWith('/') ? `${emailAssetsUrl}${item.imageUrl}` : '';
    return `<tr><td style="padding:18px 0;border-bottom:1px solid #dddddd"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    ${src ? `<td width="72" valign="top"><img class="product-image" src="${escapeHtml(src)}" alt="${escapeHtml(item.title)}" width="60" height="80" style="display:block;object-fit:cover"></td>` : ''}
    <td valign="top"><strong>${escapeHtml(item.title)}</strong><div style="font-size:12px;color:#666666">${item.size ? `Talle: ${escapeHtml(item.size)}<br>` : ''}${item.color ? `Color: ${escapeHtml(item.color)}<br>` : ''}Cantidad: ${escapeHtml(item.quantity)}<br>Precio unitario: ${money(item.price)}</div></td></tr></table></td>
    <td align="right" valign="top" style="padding:18px 0 18px 8px;border-bottom:1px solid #dddddd;white-space:nowrap;font-weight:700">${money(item.price * item.quantity)}</td></tr>`;
  }).join('');
  const shipping = order.shippingInfo || {};
  const date = payment?.date_approved || order.createdAt;
  const formattedDate = date ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short', hourCycle: 'h23', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(date)) : '';
  const content = `<p style="margin:0 0 10px;color:#666666;font-size:11px;letter-spacing:2px;text-transform:uppercase">Pedido #${escapeHtml(shortId)}</p>
  <h1 class="email-title" style="margin:0 0 16px;font-size:28px;line-height:1.25;letter-spacing:1px;text-transform:uppercase;font-family:${emailFont}">${title}</h1>
  <p>${admin ? `Cliente: ${escapeHtml(user.name)}.` : `Hola ${escapeHtml(user.name)}, ${paid ? 'tu pago fue acreditado. Gracias por elegir HAIZE.' : 'recibimos tu pedido. El pago todavía está pendiente de confirmación.'}`}</p>
  <p style="padding:14px 0;border-top:1px solid #dddddd;border-bottom:1px solid #dddddd;font-size:12px;color:#555555">Estado del pago: <strong style="color:#000000">${paid ? 'PAGADO' : 'PENDIENTE'}</strong>${formattedDate ? `<br>${escapeHtml(formattedDate)}` : ''}${payment?.id ? `<br>ID de pago: ${escapeHtml(payment.id)}` : ''}</p>
  <h2 style="font-size:14px;letter-spacing:1px;text-transform:uppercase;margin:24px 0 0">Tu compra</h2>
  <table width="100%" cellpadding="0" cellspacing="0"><thead><tr><th align="left" style="font-size:11px;color:#666666;padding-top:12px">PRODUCTOS</th><th align="right" style="font-size:11px;color:#666666;padding-top:12px">IMPORTE</th></tr></thead><tbody>${items}</tbody></table>
  ${orderTotals(order, paid)}
  <h2 style="font-size:14px;letter-spacing:1px;text-transform:uppercase">Datos de entrega</h2>
  <p style="color:#555555">${escapeHtml(shipping.name || user.name)}<br>${escapeHtml(shipping.address)}<br>${escapeHtml(shipping.city)} ${escapeHtml(shipping.postalCode)}<br>${escapeHtml(shipping.phone)}<br>${escapeHtml(shipping.email || user.email)}</p>
  <p style="color:#555555">${paid ? 'El próximo paso es preparar y coordinar el envío del pedido.' : 'Podés consultar los detalles y coordinar el pago desde tu pedido.'}</p>
  ${emailButton(admin ? 'Ver pedido en administración' : 'Ver mi pedido', `${emailBaseUrl()}/${admin ? 'admin' : 'profile'}/orders/${order._id}`)}`;
  return emailLayout(title, content, `${title} · #${shortId} · ${money(order.totalAmount)}`);
}
