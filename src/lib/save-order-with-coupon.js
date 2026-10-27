import Coupon from '@/models/Coupon';
import { OrderPricingError } from '@/lib/order-pricing';

// Reserve a per-account use atomically before persisting a discounted order.
// A retry of that same order keeps the reservation; a second order cannot take it.
export async function saveOrderWithCoupon(order, coupon, userId, CouponModel = Coupon) {
  if (!coupon?.oncePerUser) return order.save();
  const reservation = await CouponModel.findOneAndUpdate({
    _id: coupon._id, isActive: true, 'usedBy.userId': { $ne: userId },
  }, {
    $inc: { usedCount: 1 },
    $push: { usedBy: { userId, orderId: order._id, discountApplied: order.discountAmount, usedAt: new Date() } },
  }, { new: true });
  if (!reservation) {
    const ownReservation = await CouponModel.exists({
      _id: coupon._id,
      usedBy: { $elemMatch: { userId, orderId: order._id } },
    });
    if (!ownReservation) throw new OrderPricingError('Ya has usado este cupón anteriormente');
  }
  try {
    return await order.save();
  } catch (error) {
    if (reservation) {
      await CouponModel.updateOne({
        _id: coupon._id, usedBy: { $elemMatch: { userId, orderId: order._id } },
      }, { $inc: { usedCount: -1 }, $pull: { usedBy: { userId, orderId: order._id } } });
    }
    throw error;
  }
}
