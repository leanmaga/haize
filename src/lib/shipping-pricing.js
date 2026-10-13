import DeliveryZone from '@/models/DeliveryZone';
import { canonicalMunicipalityId, getMunicipalities, normalizeMunicipality, resolveMunicipality } from './municipalities';
import { getLocalities, resolveLocality } from './localities';
import { localityTariff } from './locality-tariffs';

export { normalizeMunicipality } from './municipalities';

export async function calculateShipping(city, ZoneModel = DeliveryZone, municipalityId, catalogLoader = getMunicipalities, localityId, localityLoader = getLocalities) {
  const municipality = resolveMunicipality(city, municipalityId, await catalogLoader());
  const locality = localityId ? resolveLocality(localityId, await localityLoader(municipality.id)) : null;
  const zones = await ZoneModel.find({ isActive: true });
  const matches = zones.filter((zone) =>
    canonicalMunicipalityId(zone.municipalityId) === municipality.id ||
    ((!zone.municipalityId || municipality.id === 'caba') && normalizeMunicipality(zone.name) === normalizeMunicipality(municipality.name)),
  );
  if (matches.length > 1) throw new Error('Hay varias zonas para esa ciudad; contactanos para coordinar el envío');
  const zone = matches[0];
  if (locality) {
    const tariff = localityTariff(municipality, locality);
    if (zone?.shippingPrice != null && (typeof zone.shippingPrice !== 'number' || !Number.isFinite(zone.shippingPrice) || zone.shippingPrice < 0)) throw new Error('La zona tiene una tarifa de envío inválida');
    const quoted = zone?.shippingPrice === 0 || (zone?.shippingPrice != null && tariff.price != null);
    return {
      shippingCost: quoted ? (zone.shippingPrice === 0 ? 0 : tariff.price) : 0,
      deliveryZone: zone?._id || null,
      quoted,
      municipalityId: municipality.id,
      city: municipality.name,
      localityId: locality.id,
      locality: locality.name,
      note: zone?.shippingPrice === 0 ? '' : tariff.note,
    };
  }
  if (!zone || zone.shippingPrice == null) return { shippingCost: 0, deliveryZone: zone?._id || null, quoted: false, municipalityId: municipality.id, city: municipality.name };
  if (typeof zone.shippingPrice !== 'number' || !Number.isFinite(zone.shippingPrice) || zone.shippingPrice < 0) throw new Error('La zona tiene una tarifa de envío inválida');
  return { shippingCost: zone.shippingPrice, deliveryZone: zone._id, quoted: true, municipalityId: municipality.id, city: municipality.name };
}
