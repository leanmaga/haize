jest.mock('next/server', () => ({ NextResponse: { json: (data, options = {}) => ({ data, status: options.status || 200 }) } }));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/db', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/lib/categories', () => ({ categoryExists: jest.fn() }));
jest.mock('@/lib/mercadolibre', () => ({ mercadoLibreRequest: jest.fn() }));
jest.mock('@/lib/mercadolibre-images', () => ({
  resolveMercadoLibrePictures: jest.fn(async (item) => ({ item, warning: '' })),
  storeMercadoLibrePictures: jest.fn(async () => []),
  replaceMercadoLibrePictures: jest.fn((product) => ({ imageUrl: product.imageUrl, additionalImages: product.additionalImages, variants: product.variants })),
}));
jest.mock('@/models/Product', () => ({ __esModule: true, default: { findOne: jest.fn(), findOneAndUpdate: jest.fn(), findById: jest.fn(), create: jest.fn(), find: jest.fn() } }));
import { GET, POST, PATCH } from './route';
import { getServerSession } from 'next-auth/next';
import { categoryExists } from '@/lib/categories';
import { mercadoLibreRequest } from '@/lib/mercadolibre';
import Product from '@/models/Product';

const item = { id: 'MLA12345', seller_id: 42, title: 'Remera de algodón', currency_id: 'ARS', status: 'active', price: 10000, available_quantity: 3, pictures: [{ secure_url: 'https://http2.mlstatic.com/photo.jpg' }] };
const body = { itemId: item.id, title: item.title, salePrice: item.price, description: '', category: 'remeras' };
const post = (data = body) => POST({ json: async () => data });
beforeEach(() => {
  jest.clearAllMocks();
  Product.findOne.mockReset();
  getServerSession.mockResolvedValue({ user: { role: 'admin' } });
  categoryExists.mockResolvedValue(true);
  Product.create.mockImplementation(async (data) => data);
  mercadoLibreRequest.mockImplementation(async (path) => path === '/users/me' ? { id: 42 } : path.includes('/description') ? { plain_text: '' } : item);
});
test.each([null, { user: { role: 'user' } }])('blocks non admins before calling ML', async (session) => {
  getServerSession.mockResolvedValue(session);
  expect((await post()).status).toBe(403);
  expect((await PATCH({ json: async () => body })).status).toBe(403);
  expect((await GET({ url: 'http://local/api/mercadolibre/import' })).status).toBe(403);
  expect(mercadoLibreRequest).not.toHaveBeenCalled();
});
test('refreshes only image fields and rejects concurrent product edits', async () => {
  const product = { _id: 'saved', updatedAt: 'original-version', title: 'Manual title', stock: 99,
    imageUrl: 'photo.jpg', additionalImages: [{ url: 'extra.jpg' }],
    variants: [{ stock: 99, images: ['variant.jpg'] }] };
  Product.findOne.mockReturnValue({ lean: async () => product });
  Product.findOneAndUpdate.mockResolvedValueOnce(product).mockResolvedValueOnce(null);
  expect((await PATCH({ json: async () => body })).status).toBe(200);
  expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
    { _id: 'saved', updatedAt: 'original-version' },
    { $set: { imageUrl: 'photo.jpg', 'additionalImages.0.url': 'extra.jpg', 'variants.0.images': ['variant.jpg'] } },
    { new: true },
  );
  expect((await PATCH({ json: async () => body })).status).toBe(409);
});
test('blocks another seller and malformed IDs', async () => {
  mercadoLibreRequest.mockImplementation(async (path) => path === '/users/me' ? { id: 99 } : item);
  expect((await post()).status).toBe(403);
  expect((await post({ ...body, itemId: '../users/me' })).status).toBe(400);
  expect(Product.create).not.toHaveBeenCalled();
});
test('saves reviewed copy with fresh remote stock and performs no remote writes', async () => {
  expect((await post({ ...body, stock: 999 })).status).toBe(201);
  expect(Product.create).toHaveBeenCalledWith(expect.objectContaining({ stock: 3, isActive: true, variants: expect.any(Array), mercadoLibre: expect.objectContaining({ itemId: item.id }) }));
  expect(mercadoLibreRequest.mock.calls.every((call) => call.length === 1)).toBe(true);
});
test('does not duplicate existing products or concurrent imports', async () => {
  Product.findOne.mockResolvedValueOnce({ _id: 'existing', title: item.title });
  expect((await post()).data.alreadyImported).toBe(true);
  expect(Product.create).not.toHaveBeenCalled();
  Product.create.mockRejectedValueOnce({ code: 11000 });
  Product.findById.mockResolvedValueOnce({ _id: 'same', title: item.title });
  expect((await post()).data.alreadyImported).toBe(true);
});
test('allows missing descriptions and rejects nonexistent categories', async () => {
  mercadoLibreRequest.mockImplementation(async (path) => {
    if (path === '/users/me') return { id: 42 };
    if (path.endsWith('/description')) throw Object.assign(new Error(), { status: 404 });
    return item;
  });
  expect((await GET({ url: 'http://local/api/mercadolibre/import?itemId=MLA12345' })).data.preview.description).toBe('');
  categoryExists.mockResolvedValue(false);
  expect((await post()).status).toBe(400);
  expect(Product.create).not.toHaveBeenCalled();
});
test('lists publications with cursor and already linked indicator', async () => {
  mercadoLibreRequest.mockImplementation(async (path) => {
    if (path === '/users/me') return { id: 42 };
    if (path.startsWith('/users/42')) return { results: [item.id], scroll_id: 'next', paging: { total: 1 } };
    return [{ code: 200, body: item }];
  });
  Product.find.mockReturnValue({ select: () => ({ lean: async () => [{ _id: 'saved', title: item.title, mercadoLibre: { itemId: item.id } }] }) });
  const result = await GET({ url: 'http://local/api/mercadolibre/import?cursor=abc' });
  expect(result.data.items[0].imported.productId).toBe('saved');
  expect(result.data.nextCursor).toBe('next');
});
