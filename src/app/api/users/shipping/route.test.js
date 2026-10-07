jest.mock('next/server', () => ({ NextResponse: { json: (data, options = {}) => ({ data, status: options.status || 200, headers: options.headers }) } }));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/db', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/models/User', () => ({ __esModule: true, default: { findOne: jest.fn() } }));

import { GET } from './route';
import { getServerSession } from 'next-auth/next';
import User from '@/models/User';

beforeEach(() => jest.clearAllMocks());
test('rejects anonymous requests without querying private account data', async () => {
  getServerSession.mockResolvedValue(null);
  expect((await GET()).status).toBe(401);
  expect(User.findOne).not.toHaveBeenCalled();
});
test('reads only the current account and disables response caching', async () => {
  getServerSession.mockResolvedValue({ user: { email: 'owner@example.com' } });
  const savedShippingInfo = { street: 'Calle', streetNumber: '123' };
  User.findOne.mockReturnValue({ select: () => ({ lean: async () => ({ savedShippingInfo }) }) });
  const response = await GET();
  expect(User.findOne).toHaveBeenCalledWith({ email: 'owner@example.com' });
  expect(response.data).toEqual({ shippingInfo: savedShippingInfo, hasSavedShippingInfo: true });
  expect(response.headers['Cache-Control']).toBe('private, no-store');
});
test('new accounts prefill contact details without inventing an address', async () => {
  getServerSession.mockResolvedValue({ user: { email: 'owner@example.com' } });
  User.findOne.mockReturnValue({ select: () => ({ lean: async () => ({ name: 'Cliente', email: 'owner@example.com', phone: '123' }) }) });
  const response = await GET();
  expect(response.data.hasSavedShippingInfo).toBe(false);
  expect(response.data.shippingInfo).toEqual({ name: 'Cliente', email: 'owner@example.com', phone: '123' });
});
