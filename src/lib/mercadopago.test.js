jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn(),
  Preference: jest.fn(),
  Payment: jest.fn(),
}));
jest.mock('./db', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/models/MercadoPagoConfig', () => ({
  __esModule: true,
  default: { getActiveConfig: jest.fn() },
}));
jest.mock('./config', () => ({
  getMercadoPagoConfig: () => ({
    environment: 'sandbox',
    accessToken: 'TEST-mock-access-token',
  }),
}));

import { Preference } from 'mercadopago';
import MercadoPagoConfigModel from '@/models/MercadoPagoConfig';
import { createPaymentPreference } from './mercadopago';

const envKeys = ['VERCEL_ENV', 'VERCEL_AUTOMATION_BYPASS_SECRET', 'NEXT_PUBLIC_BASE_URL'];
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
const create = jest.fn();
const secret = 'test-only+secret/with?special&characters';
const order = { _id: 'order-123', items: [{ product: 'product-123', title: 'Remera', quantity: 1, price: 100 }], subtotal: 100, totalAmount: 100 };

beforeEach(() => {
  process.env.NEXT_PUBLIC_BASE_URL = 'https://staging.haize.com.ar/';
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET = secret;
  MercadoPagoConfigModel.getActiveConfig.mockResolvedValue({ accessToken: 'test-token', getDecryptedAccessToken: () => 'test-token' });
  Preference.mockImplementation(() => ({ create }));
  create.mockResolvedValue({ id: 'preference-123', init_point: 'https://www.mercadopago.com.ar/checkout/test' });
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

test('sends an encoded bypass only in the preview notification URL', async () => {
  process.env.VERCEL_ENV = 'preview';
  await createPaymentPreference(order);
  const body = create.mock.calls[0][0].body;
  const url = new URL(body.notification_url);
  expect(url.origin).toBe('https://staging.haize.com.ar');
  expect(url.pathname).toBe('/api/mercadopago/webhook');
  expect(url.searchParams.get('x-vercel-protection-bypass')).toBe(secret);
  for (const backUrl of Object.values(body.back_urls)) {
    expect(new URL(backUrl).searchParams.has('x-vercel-protection-bypass')).toBe(false);
  }
  expect(JSON.stringify(console.log.mock.calls)).not.toContain(secret);
});

test.each(['production', 'development', undefined])('omits bypass outside Preview (%s)', async (environment) => {
  if (environment) process.env.VERCEL_ENV = environment;
  else delete process.env.VERCEL_ENV;
  process.env.NEXT_PUBLIC_BASE_URL = 'https://www.haize.com.ar';
  await createPaymentPreference(order);
  expect(create.mock.calls[0][0].body.notification_url).toBe('https://www.haize.com.ar/api/mercadopago/webhook');
});

test('keeps previews without a configured bypass usable', async () => {
  process.env.VERCEL_ENV = 'preview';
  delete process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  await createPaymentPreference(order);
  expect(create.mock.calls[0][0].body.notification_url).toBe('https://staging.haize.com.ar/api/mercadopago/webhook');
});
