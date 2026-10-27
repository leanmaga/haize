/** @jest-environment-options {"customExportConditions":["node","node-addons"]} */
jest.mock('@/models/Product', () => ({ __esModule: true, default: {} }));
jest.mock('@/models/Coupon', () => ({ __esModule: true, default: {} }));

import { calculateTrustedOrder, OrderPricingError } from './order-pricing';

const productId = '64a000000000000000000001';
const product = {
  _id: { toString: () => productId },
  title: 'Remera oficial',
  salePrice: 10000,
  promoPrice: 8000,
  imageUrl: '/trusted.jpg',
  stock: 10,
  isActive: true,
  isComplete: true,
  variants: [{ size: 'M', color: 'Azul', stock: 3 }],
};

const ProductModel = { find: jest.fn(() => ({ lean: async () => [product] })) };
const noCoupon = { findByCode: jest.fn(async () => null) };

beforeEach(() => jest.clearAllMocks());

test('published legacy product without wizard metadata can sell its last unit', async () => {
  const legacy = { ...product, variants: [{ size: 'XXL', color: 'Blanco', stock: 1 }], stock: 1 };
  delete legacy.isComplete;
  // Model hydration reproduces the production failure; lean returns stored data.
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
  const RealProduct = jest.requireActual('@/models/Product').default;
  expect(RealProduct.hydrate({ ...legacy, _id: productId }).isComplete).toBe(false);
  const model = { find: jest.fn(() => ({ lean: async () => [legacy] })) };
  const request = { items: [{ product: productId, quantity: 1, size: 'XXL', color: 'Blanco' }], ProductModel: model };
  await expect(calculateTrustedOrder(request)).resolves.toMatchObject({ totalAmount: 8000 });
  await expect(calculateTrustedOrder({ ...request, items: [{ ...request.items[0], quantity: 2 }] })).rejects.toThrow('No hay stock suficiente');
});

test.each([{ ...product, isComplete: false }, { ...product, isActive: false }, null])('blocks explicit drafts, inactive or missing products', async (stored) => {
  const model = { find: () => ({ lean: async () => stored ? [stored] : [] }) };
  await expect(calculateTrustedOrder({ items: [{ product: productId, quantity: 1, size: 'M', color: 'Azul' }], ProductModel: model })).rejects.toThrow('Uno de los productos ya no está disponible');
});

test('ignores browser prices, titles and totals and prices the selected DB variant', async () => {
  const result = await calculateTrustedOrder({
    items: [{
      product: productId,
      title: 'Producto falso',
      price: 1,
      quantity: 2,
      imageUrl: '/fake.jpg',
      size: 'M',
      color: 'Azul',
    }],
    userId: 'user-1',
    ProductModel,
    CouponModel: noCoupon,
  });

  expect(result.items).toEqual([expect.objectContaining({
    title: 'Remera oficial',
    price: 8000,
    quantity: 2,
    imageUrl: '/trusted.jpg',
  })]);
  expect(result).toMatchObject({ subtotal: 16000, discountAmount: 0, totalAmount: 16000 });
});

test('loads and calculates the coupon from DB instead of trusting its browser payload', async () => {
  const coupon = {
    _id: 'coupon-1',
    code: 'SEGURA10',
    discountType: 'percentage',
    discountValue: 10,
    usedBy: [],
    isAvailable: () => ({ valid: true }),
    canUserUse: () => ({ valid: true }),
    calculateDiscount: (subtotal) => ({ valid: true, discount: subtotal * 0.1 }),
  };
  const CouponModel = { findByCode: jest.fn(async () => coupon) };

  const result = await calculateTrustedOrder({
    items: [{ product: productId, quantity: 1, size: 'M', color: 'Azul' }],
    couponCode: 'segura10',
    userId: 'user-1',
    ProductModel,
    CouponModel,
  });

  expect(CouponModel.findByCode).toHaveBeenCalledWith('SEGURA10');
  expect(result).toMatchObject({ subtotal: 8000, discountAmount: 800, totalAmount: 7200 });
  expect(result.appliedCoupon).toMatchObject({ code: 'SEGURA10', discountValue: 10, discountAmount: 800 });
});

test('rejects nonexistent variants and split quantities that exceed stock', async () => {
  await expect(calculateTrustedOrder({
    items: [{ product: productId, quantity: 1, size: 'XL', color: 'Azul' }],
    userId: 'user-1', ProductModel, CouponModel: noCoupon,
  })).rejects.toBeInstanceOf(OrderPricingError);

  await expect(calculateTrustedOrder({
    items: [
      { product: productId, quantity: 2, size: 'M', color: 'Azul' },
      { product: productId, quantity: 2, size: 'M', color: 'Azul' },
    ],
    userId: 'user-1', ProductModel, CouponModel: noCoupon,
  })).rejects.toThrow('No hay stock suficiente');
});
