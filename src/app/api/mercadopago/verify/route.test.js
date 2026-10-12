jest.mock('next/server', () => ({ NextResponse: { json: (data, options = {}) => ({ data, status: options.status || 200 }) } }));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/db', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/models/Order', () => ({ __esModule: true, default: { findById: jest.fn() } }));
jest.mock('@/lib/mercadopago-confirmation', () => ({ confirmMercadoPagoPayment: jest.fn() }));
import { getServerSession } from 'next-auth/next';
import Order from '@/models/Order';
import { confirmMercadoPagoPayment as confirm } from '@/lib/mercadopago-confirmation';
import { POST } from './route';
const id = '6acd04eea2267e6c656c658f';
const request = { json: async () => ({ orderId: id, paymentId: '123' }) };
beforeEach(() => {
  jest.resetAllMocks();
  getServerSession.mockResolvedValue({ user: { id: 'buyer' } });
  Order.findById.mockResolvedValue({ user: 'buyer' });
  confirm.mockResolvedValue({ paid: true });
});
test('requires authentication', async () => {
  getServerSession.mockResolvedValue(null);
  expect((await POST(request)).status).toBe(401);
  expect(confirm).not.toHaveBeenCalled();
});
test('rejects another customer order before consulting payment', async () => {
  Order.findById.mockResolvedValue({ user: 'other' });
  expect((await POST(request)).status).toBe(404);
  expect(confirm).not.toHaveBeenCalled();
});
test('binds verified payment to authenticated customer order', async () => {
  expect((await POST(request)).data.paid).toBe(true);
  expect(confirm).toHaveBeenCalledWith('123', id);
});
test('ignores client approval flags without payment ID', async () => {
  expect((await POST({ json: async () => ({ orderId: id, status: 'approved' }) })).status).toBe(400);
  expect(confirm).not.toHaveBeenCalled();
});
