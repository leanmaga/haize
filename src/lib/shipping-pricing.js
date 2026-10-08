import DeliveryZone from '@/models/DeliveryZone';

export const normalizeMunicipality = (value) => typeof value === 'string'
  ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase()
  : '';

export async function calculateShipping(city, ZoneModel = DeliveryZone) {
  const normalized = normalizeMunicipality(city);
  if (!normalized) throw new Error('Ingresá la ciudad de entrega');
  const zones = await ZoneModel.find({ isActive: true });
  const matches = zones.filter((zone) => normalizeMunicipality(zone.name) === normalized);
  if (matches.length > 1) throw new Error('Hay varias zonas para esa ciudad; contactanos para coordinar el envío');
  const zone = matches[0];
  if (!zone) return { shippingCost: 0, deliveryZone: null, quoted: false };
  const shippingCost = zone.shippingPrice;
  if (typeof shippingCost !== 'number' || !Number.isFinite(shippingCost) || shippingCost < 0) {
    throw new Error('La zona no tiene una tarifa de envío válida');
  }
  return { shippingCost, deliveryZone: zone._id, quoted: true };
}
