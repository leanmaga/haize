jest.mock('next/server', () => ({ NextResponse: { redirect: (url) => ({ url }) } }));
jest.mock('@/lib/db', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/models/MercadoPagoConfig', () => ({ __esModule: true, default: { findOneAndUpdate: jest.fn(), updateMany: jest.fn() } }));

import { GET } from './route';
import { getServerSession } from 'next-auth/next';
import Config from '@/models/MercadoPagoConfig';

const envKeys = ['MERCADOPAGO_CLIENT_SECRET', 'MERCADOPAGO_CLIENT_ID', 'NEXT_PUBLIC_BASE_URL'];
const original = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
const request = { url: 'https://staging.haize.com.ar/api/mercadopago/auth/callback?code=test-code' };
beforeEach(() => {
  jest.clearAllMocks();
  process.env.MERCADOPAGO_CLIENT_SECRET = 'test-only';
  process.env.MERCADOPAGO_CLIENT_ID = 'test-app';
  process.env.NEXT_PUBLIC_BASE_URL = 'https://staging.haize.com.ar';
  getServerSession.mockResolvedValue({ user: { id: 'admin', role: 'admin' } });
  fetch.mockResolvedValue({ ok: true, json: async () => ({ access_token: 'APP_USR-test-secret', refresh_token: 'TG-test-secret', expires_in: 3600 }) });
  Config.findOneAndUpdate.mockResolvedValue({ _id: 'config-123' });
  Config.updateMany.mockResolvedValue({ acknowledged: true });
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
  for (const key of envKeys) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

test('deactivates only other configurations after successfully saving the new tokens', async () => {
  expect((await GET(request)).url).toContain('success=mp_connected');
  expect(Config.updateMany).toHaveBeenCalledWith({ isActive: true, _id: { $ne: 'config-123' } }, { $set: { isActive: false } });
  expect(Config.findOneAndUpdate.mock.invocationCallOrder[0]).toBeLessThan(Config.updateMany.mock.invocationCallOrder[0]);
});

test('preserves the previous connection and does not expose token values when saving fails', async () => {
  Config.findOneAndUpdate.mockRejectedValue(new Error('ENCRYPTION_KEY unavailable APP_USR-test-secret'));
  const response = await GET(request);
  expect(response.url).toContain('error=server_error');
  expect(Config.updateMany).not.toHaveBeenCalled();
  expect(response.url).not.toContain('APP_USR-test-secret');
  expect(JSON.stringify(console.error.mock.calls)).not.toContain('APP_USR-test-secret');
});

test('does not log a token in an incomplete OAuth response', async () => {
  fetch.mockResolvedValue({ ok: true, json: async () => ({ access_token: 'APP_USR-test-secret' }) });
  expect((await GET(request)).url).toContain('error=incomplete_response');
  expect(Config.findOneAndUpdate).not.toHaveBeenCalled();
  expect(JSON.stringify(console.error.mock.calls)).not.toContain('APP_USR-test-secret');
});
