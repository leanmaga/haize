jest.mock('next/server', () => ({ NextResponse: { json: (data, options = {}) => ({ data, status: options.status || 200 }) } }));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/db', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/lib/categories', () => ({ categoryExists: jest.fn() }));
jest.mock('@/models/SizeGuide', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/models/Product', () => ({ __esModule: true, default: {} }));
import { POST } from './route';
import { getServerSession } from 'next-auth/next';
import { categoryExists } from '@/lib/categories';
import SizeGuide from '@/models/SizeGuide';
test('keeps a custom category when saving a reusable size guide', async () => {
  getServerSession.mockResolvedValue({ user: { role: 'admin' } });
  categoryExists.mockResolvedValue(true);
  const save = jest.fn().mockResolvedValue(undefined);
  SizeGuide.mockImplementation((data) => ({ ...data, save }));
  const response = await POST({ json: async () => ({ name: 'Guía Buzos', category: 'buzos', method: 'prenda', sizes: [{ labelSize: 'M', garmentMeasurements: { length: 65, width: 50 } }] }) });
  expect(response.status).toBe(201);
  expect(response.data.sizeGuide.category).toBe('buzos');
  expect(save).toHaveBeenCalledTimes(1);
});
test('rejects unknown categories before saving a guide', async () => {
  getServerSession.mockResolvedValue({ user: { role: 'admin' } });
  categoryExists.mockResolvedValue(false);
  expect((await POST({ json: async () => ({ category: 'missing' }) })).status).toBe(400);
});
