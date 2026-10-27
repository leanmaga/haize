/** @jest-environment-options {"customExportConditions":["node","node-addons"]} */
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const mongoose = require('mongoose');
const Coupon = require('./Coupon').default;

test('welcome stays available to other accounts after one account uses it', () => {
  const user = new mongoose.Types.ObjectId();
  const coupon = new Coupon({ code: 'HAIZE10', discountType: 'percentage', discountValue: 10,
    usageType: 'reusable', oncePerUser: true, expirationType: 'manual', systemCreated: true,
    usedCount: 1, usedBy: [{ userId: user, orderId: new mongoose.Types.ObjectId(), discountApplied: 100 }] });
  expect(coupon.validateSync()).toBeUndefined();
  expect(coupon.isAvailable().valid).toBe(true);
  expect(coupon.canUserUse(user).valid).toBe(false);
  expect(coupon.canUserUse(new mongoose.Types.ObjectId()).valid).toBe(true);
  expect(coupon.calculateDiscount(10000).discount).toBe(1000);
});
test('ordinary coupons still require their administrator creator', () => {
  const coupon = new Coupon({ code: 'OTHER', discountType: 'percentage', discountValue: 10,
    usageType: 'reusable', expirationType: 'manual' });
  expect(coupon.validateSync().errors.createdBy).toBeDefined();
});
