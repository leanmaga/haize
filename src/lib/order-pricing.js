import Product from '@/models/Product';
import Coupon from '@/models/Coupon';

export class OrderPricingError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'OrderPricingError';
    this.status = status;
  }
}

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

function productId(value) {
  const source = value?.product ?? value?.productId ?? value?.id;
  const raw = source == null ? '' : source.toString().trim();
  const candidate = raw.includes('-') ? raw.split('-')[0] : raw.slice(0, 24);
  return /^[0-9a-fA-F]{24}$/.test(candidate) ? candidate : null;
}

function selectedVariant(product, item) {
  const size = clean(item.size ?? item.variant?.size);
  const color = clean(item.color ?? item.variant?.color);
  const variants = product.variants || [];

  if (!variants.length) return { variant: null, size: size || undefined, color: color || undefined };
  if (!size || !color) throw new OrderPricingError(`Elegí talle y color para ${product.title}`);

  const variant = variants.find(
    (entry) => clean(entry.size) === size && clean(entry.color) === color,
  );
  if (!variant) throw new OrderPricingError(`La variante elegida de ${product.title} no existe`);
  return { variant, size, color };
}

function currentPrice(product) {
  const salePrice = Number(product.salePrice);
  const promoPrice = Number(product.promoPrice);
  const price = promoPrice > 0 && promoPrice < salePrice ? promoPrice : salePrice;
  if (!Number.isFinite(price) || price <= 0) {
    throw new OrderPricingError(`El precio de ${product.title} no es válido`, 409);
  }
  return price;
}

export async function calculateTrustedOrder({ items, couponCode, userId, currentOrderId, ProductModel = Product, CouponModel = Coupon }) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    throw new OrderPricingError('Items inválidos en la orden');
  }

  const requests = items.map((item) => {
    const id = productId(item);
    const quantity = Number(item.quantity);
    if (!id) throw new OrderPricingError('Hay un producto inválido en la orden');
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100) {
      throw new OrderPricingError('La cantidad solicitada no es válida');
    }
    return { item, id, quantity };
  });

  const ids = [...new Set(requests.map(({ id }) => id))];
  const products = await ProductModel.find({ _id: { $in: ids } });
  const byId = new Map(products.map((product) => [product._id.toString(), product]));
  const requestedStock = new Map();

  const trustedItems = requests.map(({ item, id, quantity }) => {
    const product = byId.get(id);
    if (!product || product.isActive === false || product.isComplete === false) {
      throw new OrderPricingError('Uno de los productos ya no está disponible', 409);
    }

    const { variant, size, color } = selectedVariant(product, item);
    const stockKey = `${id}:${size || ''}:${color || ''}`;
    const accumulated = (requestedStock.get(stockKey) || 0) + quantity;
    requestedStock.set(stockKey, accumulated);
    const stock = Number(variant ? variant.stock : product.stock);
    if (!Number.isFinite(stock) || accumulated > stock) {
      throw new OrderPricingError(`No hay stock suficiente de ${product.title}`, 409);
    }

    return {
      product: id,
      title: product.title,
      quantity,
      price: currentPrice(product),
      imageUrl: product.imageUrl,
      size,
      color,
    };
  });

  const subtotal = trustedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let coupon = null;
  let appliedCoupon = null;
  let discountAmount = 0;
  const normalizedCode = clean(couponCode).toUpperCase();

  if (normalizedCode) {
    coupon = await CouponModel.findByCode(normalizedCode);
    if (!coupon) throw new OrderPricingError('El cupón no existe');
    const availability = coupon.isAvailable();
    const belongsToCurrentOrder = currentOrderId && coupon.usedBy?.some(
      (usage) => usage.orderId?.toString() === currentOrderId.toString(),
    );
    const sameOrderConsumedLastUse = belongsToCurrentOrder
      && availability.reason === 'El cupón alcanzó su límite de usos';
    if (!availability.valid && !sameOrderConsumedLastUse) {
      throw new OrderPricingError(availability.reason);
    }
    const userCanUse = coupon.canUserUse(userId);
    if (!userCanUse.valid && !belongsToCurrentOrder) throw new OrderPricingError(userCanUse.reason);
    const discount = coupon.calculateDiscount(subtotal);
    if (!discount.valid) throw new OrderPricingError(discount.reason);

    discountAmount = discount.discount;
    appliedCoupon = {
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    };
  }

  return {
    items: trustedItems,
    subtotal,
    discountAmount,
    totalAmount: subtotal - discountAmount,
    appliedCoupon,
    coupon,
  };
}
