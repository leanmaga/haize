jest.mock('@/lib/db', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/models/Product', () => ({ __esModule: true, default: { countDocuments: jest.fn(), findOne: jest.fn() } }));
jest.mock('@/models/MercadoLibreSale', () => ({ __esModule: true, default: { create: jest.fn(), updateOne: jest.fn(), deleteOne: jest.fn() } }));
import Product from '@/models/Product';
import MercadoLibreSale from '@/models/MercadoLibreSale';
import { reduceStockForMercadoLibreOrder } from './mercadolibre-stock';

test('deducts a sale from the sole imported variant for a listing without remote variations', async () => {
  const product = { _id: 'local', title: 'Remera', stock: 5, mercadoLibre: { itemId: 'MLA123', variationMappings: [] }, variants: [{ stock: 5 }] };
  product.save = jest.fn(async () => { product.stock = product.variants[0].stock; });
  Product.countDocuments.mockResolvedValue(1);
  Product.findOne.mockResolvedValue(product);
  const order = { id: 9, status: 'paid', order_items: [{ item: { id: 'MLA123' }, quantity: 2 }] };
  expect((await reduceStockForMercadoLibreOrder(order)).success).toBe(true);
  expect(product.variants[0].stock).toBe(3);
  expect(product.stock).toBe(3);
  MercadoLibreSale.create.mockRejectedValueOnce({ code: 11000 });
  expect((await reduceStockForMercadoLibreOrder(order)).skipped).toBe(true);
  expect(product.stock).toBe(3);
});
