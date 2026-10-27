jest.mock('@/models/Coupon', () => ({ __esModule: true, default: {} }));
jest.mock('@/lib/order-pricing', () => ({ OrderPricingError: class extends Error {} }));
import { saveOrderWithCoupon } from './save-order-with-coupon';

const coupon = { _id: 'coupon', oncePerUser: true };
let model;
const order = id => ({ _id: id, discountAmount: 100, save: jest.fn().mockResolvedValue({}) });
beforeEach(() => {
  model = { findOneAndUpdate: jest.fn().mockResolvedValue({}), exists: jest.fn().mockResolvedValue(null), updateOne: jest.fn().mockResolvedValue({}) };
});
test('a competing order cannot save after losing the atomic reservation', async () => {
  model.findOneAndUpdate.mockResolvedValueOnce({}).mockResolvedValueOnce(null);
  const first = order('first'), second = order('second');
  await saveOrderWithCoupon(first, coupon, 'user', model);
  await expect(saveOrderWithCoupon(second, coupon, 'user', model)).rejects.toThrow('Ya has usado');
  expect(second.save).not.toHaveBeenCalled();
  expect(model.findOneAndUpdate.mock.calls[0][0]).toMatchObject({ 'usedBy.userId': { $ne: 'user' } });
});
test('a retry of the same order is allowed without a second use', async () => {
  model.findOneAndUpdate.mockResolvedValue(null);
  model.exists.mockResolvedValue({ _id: 'coupon' });
  const retry = order('first');
  await saveOrderWithCoupon(retry, coupon, 'user', model);
  expect(retry.save).toHaveBeenCalledTimes(1);
});
test('failed order persistence releases only the new reservation', async () => {
  const failed = order('first');
  failed.save.mockRejectedValue(new Error('write failed'));
  await expect(saveOrderWithCoupon(failed, coupon, 'user', model)).rejects.toThrow('write failed');
  expect(model.updateOne).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ $inc: { usedCount: -1 } }));
});
test('ordinary coupons keep their existing flow', async () => {
  await saveOrderWithCoupon(order('first'), { oncePerUser: false }, 'user', model);
  expect(model.findOneAndUpdate).not.toHaveBeenCalled();
});
