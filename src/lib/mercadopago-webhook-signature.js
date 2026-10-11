import { createHmac, timingSafeEqual } from 'crypto';

// Mercado Pago signs the query resource ID, request ID and timestamp, not the body.
// https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/payment-notifications
export function verifyWebhookSignature({ signature, requestId, dataId, secret }) {
  if (!secret || !signature || !requestId || !dataId) return false;

  const fields = new Map();
  for (const part of signature.split(',')) {
    const match = part.trim().match(/^(ts|v1)=(.+)$/);
    if (!match || fields.has(match[1])) return false;
    fields.set(match[1], match[2]);
  }

  const ts = fields.get('ts');
  const v1 = fields.get('v1');
  if (!/^\d+$/.test(ts || '') || !/^[a-f\d]{64}$/i.test(v1 || '')) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest();
  return timingSafeEqual(Buffer.from(v1, 'hex'), expected);
}
