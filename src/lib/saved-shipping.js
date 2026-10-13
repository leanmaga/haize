import { normalizeShippingAddress } from './shipping-address';

export function shippingForAccount(info) {
  const normalized = normalizeShippingAddress(typeof info?.toObject === 'function' ? info.toObject() : info);
  return Object.fromEntries(
    ['name', 'email', 'phone', 'street', 'streetNumber', 'apartment', 'province', 'address', 'city', 'municipalityId', 'localityId', 'locality', 'postalCode']
      .map((field) => [field, typeof normalized[field] === 'string' ? normalized[field].trim() : '']),
  );
}

export async function rememberShipping(user, orderData) {
  if (orderData.saveShippingInfo !== true) return;
  user.savedShippingInfo = shippingForAccount(orderData.shippingInfo);
  await user.save();
}
