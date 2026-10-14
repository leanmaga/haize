jest.mock('next/server', () => ({ NextResponse: { json: (data, options = {}) => ({ data, status: options.status || 200 }) } }));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/db', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/lib/categories', () => ({ seedCategories: jest.fn() }));
jest.mock('@/models/Category', () => ({ __esModule: true, default: { create: jest.fn(), find: jest.fn() } }));
import { POST, GET } from './route';
import { getServerSession } from 'next-auth/next';
import Category from '@/models/Category';
beforeEach(() => jest.clearAllMocks());
test.each([null, { user: { role: 'user' } }])('only administrators can create categories', async (session) => {
  getServerSession.mockResolvedValue(session);
  expect((await POST({ json: async () => ({ name: 'Buzos' }) })).status).toBe(403);
  expect(Category.create).not.toHaveBeenCalled();
});
test('creates category in the DB with stable slug and handles concurrent duplicates', async () => {
  getServerSession.mockResolvedValue({ user: { role: 'admin' } });
  Category.create.mockImplementation(async (data) => data);
  expect((await POST({ json: async () => ({ name: 'Buzos' }) })).status).toBe(201);
  expect(Category.create).toHaveBeenCalledWith({ name: 'Buzos', slug: 'buzos' });
  Category.create.mockRejectedValueOnce({ code: 11000 });
  expect((await POST({ json: async () => ({ name: 'BUZOS' }) })).status).toBe(409);
});
test('public catalog reads persisted categories', async () => {
  Category.find.mockReturnValue({ select: () => ({ sort: () => ({ lean: async () => [{ name: 'Buzos', slug: 'buzos' }] }) }) });
  expect((await GET()).data.categories).toEqual([{ name: 'Buzos', slug: 'buzos' }]);
});
