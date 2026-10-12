jest.mock('next/server', () => ({ NextResponse: { json: (data, options = {}) => ({ data, status: options.status || 200 }) } }));
jest.mock('@/lib/mercadopago-confirmation', () => ({ confirmMercadoPagoPayment: jest.fn() }));
import { createHmac } from 'crypto';
import { POST } from './route';
import { confirmMercadoPagoPayment as confirm } from '@/lib/mercadopago-confirmation';
const originalSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
const secret = 'test-only-secret';
const hash = createHmac('sha256', secret).update('id:123;request-id:req;ts:1234;').digest('hex');
function request(signature = `ts=1234,v1=${hash}`, body = { type: 'payment', data: { id: 123 } }, query = 'data.id=123') {
  return { url: `https://example.com/?${query}`, headers: { get: name => name === 'x-signature' ? signature : 'req' }, json: jest.fn().mockResolvedValue(body) };
}
beforeEach(() => { jest.resetAllMocks(); process.env.MERCADOPAGO_WEBHOOK_SECRET = secret; confirm.mockResolvedValue({ paid: true }); });
afterEach(() => { if (originalSecret === undefined) delete process.env.MERCADOPAGO_WEBHOOK_SECRET; else process.env.MERCADOPAGO_WEBHOOK_SECRET = originalSecret; });
test.each([null, '', 'ts=1234,v1=ab', `ts=1234,v1=${'0'.repeat(64)}`, `ts=1234,v1=${hash},v1=${hash}`, `ts=9,v1=${hash}`])('rejects invalid signature %s', async signature => {
  const req = request(signature);
  expect((await POST(req)).status).toBe(401);
  expect(req.json).not.toHaveBeenCalled(); expect(confirm).not.toHaveBeenCalled();
});
test.each(['', 'data.id=999', 'data.id=123&data.id=123'])('rejects changed query %s', async query => {
  expect((await POST(request(undefined, undefined, query))).status).toBe(401);
  expect(confirm).not.toHaveBeenCalled();
});
test('rejects substituted body', async () => {
  expect((await POST(request(undefined, { type: 'payment', data: { id: 999 } }))).status).toBe(400);
  expect(confirm).not.toHaveBeenCalled();
});
test('missing secret fails closed', async () => {
  delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
  expect((await POST(request())).status).toBe(503);
});
test('authentic payment invokes shared confirmation', async () => {
  expect((await POST(request())).status).toBe(200);
  expect(confirm).toHaveBeenCalledWith('123');
});
test('processing failure asks provider to retry', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  confirm.mockRejectedValue(new Error('temporary outage'));
  expect((await POST(request())).status).toBe(503);
  spy.mockRestore();
});
