jest.mock('next/server', () => ({ NextResponse: { json: (data, options = {}) => ({ data, status: options.status || 200 }) } }));
jest.mock('@/lib/db', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/models/Order', () => ({ __esModule: true, default: { findById: jest.fn() } }));
jest.mock('@/models/User', () => ({ __esModule: true, default: { findById: jest.fn() } }));
jest.mock('@/lib/mercadopago', () => ({ getPaymentById: jest.fn() }));
jest.mock('@/lib/order-emails', () => ({ sendPaymentConfirmedEmails: jest.fn() }));
jest.mock('@/lib/email-config', () => ({ verifyEmailConfig: jest.fn() }));
jest.mock('@/lib/stock-utils', () => ({ reduceStockForOrder: jest.fn() }));

import { createHmac } from 'crypto';
import { POST } from './route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { getPaymentById } from '@/lib/mercadopago';
import { verifyEmailConfig } from '@/lib/email-config';
import { reduceStockForOrder } from '@/lib/stock-utils';
import { sendPaymentConfirmedEmails } from '@/lib/order-emails';

const secret = 'test-only-webhook-secret';
const originalSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
const ts = '1742505638683';
const digest = createHmac('sha256', secret)
  .update(`id:123456;request-id:notification-123;ts:${ts};`).digest('hex');

function notification({ signature = `ts=${ts},v1=${digest}`, requestId = 'notification-123', query = 'data.id=123456', body = { action: 'payment.updated', data: { id: 123456 } } } = {}) {
  return {
    url: `https://staging.haize.com.ar/api/mercadopago/webhook?${query}`,
    headers: { get: (name) => ({ 'x-signature': signature, 'x-request-id': requestId })[name] },
    text: jest.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.MERCADOPAGO_WEBHOOK_SECRET = secret;
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  getPaymentById.mockResolvedValue({ id: 123456, status: 'approved', external_reference: 'order-123' });
  Order.findById.mockResolvedValue({ _id: 'order-123', status: 'pagado' });
});

afterEach(() => {
  jest.restoreAllMocks();
  if (originalSecret === undefined) delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
  else process.env.MERCADOPAGO_WEBHOOK_SECRET = originalSecret;
});

test.each([
  ['missing signature', { signature: null }],
  ['short hash', { signature: `ts=${ts},v1=ab` }],
  ['non-hex hash', { signature: `ts=${ts},v1=${'z'.repeat(64)}` }],
  ['wrong hash', { signature: `ts=${ts},v1=${'0'.repeat(64)}` }],
  ['duplicate signature field', { signature: `ts=${ts},v1=${digest},v1=${digest}` }],
  ['missing timestamp', { signature: `v1=${digest}` }],
  ['changed timestamp', { signature: `ts=1,v1=${digest}` }],
  ['missing request ID', { requestId: null }],
  ['changed request ID', { requestId: 'attacker' }],
  ['missing query ID', { query: '' }],
  ['changed query ID', { query: 'data.id=654321' }],
  ['duplicate query ID', { query: 'data.id=123456&data.id=654321' }],
])('rejects %s before reading body or calling payment services', async (_, overrides) => {
  const request = notification(overrides);
  expect((await POST(request)).status).toBe(401);
  expect(request.text).not.toHaveBeenCalled();
  expect(getPaymentById).not.toHaveBeenCalled();
  expect(connectDB).not.toHaveBeenCalled();
  expect(reduceStockForOrder).not.toHaveBeenCalled();
  expect(sendPaymentConfirmedEmails).not.toHaveBeenCalled();
});

test.each([undefined, '', '   '])('fails closed when secret is unavailable (%s)', async (value) => {
  if (value === undefined) delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
  else process.env.MERCADOPAGO_WEBHOOK_SECRET = value;
  expect((await POST(notification())).status).toBe(503);
  expect(getPaymentById).not.toHaveBeenCalled();
});

test('rejects a signature generated with another app secret', async () => {
  process.env.MERCADOPAGO_WEBHOOK_SECRET = 'another-app-secret';
  expect((await POST(notification())).status).toBe(401);
  expect(getPaymentById).not.toHaveBeenCalled();
});

test.each([
  { action: 'payment.updated', data: { id: 654321 } },
  { action: 'payment.updated' },
  null,
  '{invalid json',
])('rejects malformed or substituted body IDs', async (body) => {
  expect((await POST(notification({ body }))).status).toBe(400);
  expect(getPaymentById).not.toHaveBeenCalled();
});

test.each([`ts=${ts},v1=${digest}`, `v1=${digest}, ts=${ts}`])('accepts signed notifications and safely acknowledges a paid order', async (signature) => {
  const response = await POST(notification({ signature }));
  expect(response.status).toBe(200);
  expect(response.data.message).toBe('No update required');
  expect(getPaymentById).toHaveBeenCalledWith('123456');
  expect(Order.findById).toHaveBeenCalledWith('order-123');
  expect(reduceStockForOrder).not.toHaveBeenCalled();
  expect(sendPaymentConfirmedEmails).not.toHaveBeenCalled();
});

test('normalizes alphanumeric resource IDs as specified by Mercado Pago', async () => {
  const hash = createHmac('sha256', secret).update(`id:abc123;request-id:notification-123;ts:${ts};`).digest('hex');
  expect((await POST(notification({
    signature: `ts=${ts},v1=${hash}`,
    query: 'data.id=ABC123',
    body: { action: 'payment.updated', data: { id: 'ABC123' } },
  }))).status).toBe(200);
  expect(getPaymentById).toHaveBeenCalledWith('ABC123');
});

test('processes an authentic approved payment and does not repeat its effects on redelivery', async () => {
  const order = { _id: 'order-123', status: 'pendiente', user: 'buyer-123', save: jest.fn().mockResolvedValue(undefined) };
  Order.findById.mockResolvedValue(order);
  User.findById.mockResolvedValue({ _id: 'buyer-123' });
  verifyEmailConfig.mockResolvedValue({ success: true });
  reduceStockForOrder.mockResolvedValue({ success: true, updated: [], errors: [] });
  sendPaymentConfirmedEmails.mockResolvedValue({ success: true });

  const first = await POST(notification());
  expect(first.status).toBe(200);
  expect(first.data.processed).toBe(true);
  expect(order.status).toBe('pagado');
  expect(order.paymentId).toBe('123456');
  expect(order.save).toHaveBeenCalledTimes(1);

  const repeated = await POST(notification());
  expect(repeated.status).toBe(200);
  expect(repeated.data.processed).toBe(false);
  expect(reduceStockForOrder).toHaveBeenCalledTimes(1);
  expect(sendPaymentConfirmedEmails).toHaveBeenCalledTimes(1);
  expect(order.save).toHaveBeenCalledTimes(1);
});
