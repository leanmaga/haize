import DeliveryZone from '@/models/DeliveryZone';
import { getMunicipalities, normalizeMunicipality, resolveMunicipality } from './municipalities';

export { normalizeMunicipality } from './municipalities';

export async function calculateShipping(city, ZoneModel = DeliveryZone, municipalityId, catalogLoader = getMunicipalities) {
  const municipality = resolveMunicipality(city, municipalityId, await catalogLoader());
  const zones = await ZoneModel.find({ isActive: true });
  const matches = zones.filter((zone) =>
    zone.municipalityId === municipality.id ||
    ((!zone.municipalityId || municipality.id === 'caba') && normalizeMunicipality(zone.name) === normalizeMunicipality(municipality.name)),
  );
  if (matches.length > 1) throw new Error('Hay varias zonas para esa ciudad; contactanos para coordinar el envío');
  const zone = matches[0];
  if (!zone || zone.shippingPrice == null) return { shippingCost: 0, deliveryZone: zone?._id || null, quoted: false, municipalityId: municipality.id, city: municipality.name };
  if (typeof zone.shippingPrice !== 'number' || !Number.isFinite(zone.shippingPrice) || zone.shippingPrice < 0) throw new Error('La zona tiene una tarifa de envío inválida');
  return { shippingCost: zone.shippingPrice, deliveryZone: zone._id, quoted: true, municipalityId: municipality.id, city: municipality.name };
}
