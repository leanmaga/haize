import { getMunicipalities } from './municipalities';
import { getLocalities } from './localities';
import { normalizeMunicipality } from './municipalities';

// Resolve the municipality by coordinates, not similarly named towns in another province.
export async function resolveGoogleAddress({ lat, lng, localityNames }) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -56 || lat > -21 || lng < -74 || lng > -53 || !Array.isArray(localityNames) || localityNames.length > 8 || localityNames.some((name) => typeof name !== 'string' || name.length > 150)) {
    throw new Error('Dirección inválida');
  }
  const response = await fetch(`https://apis.datos.gob.ar/georef/api/ubicacion?lat=${lat}&lon=${lng}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('No se pudo identificar el municipio');
  const { ubicacion } = await response.json();
  const id = ubicacion?.provincia?.id === '02' ? 'caba' : ubicacion?.municipio?.id;
  const municipality = (await getMunicipalities()).find((item) => item.id === id);
  if (!municipality) throw new Error('Seleccioná el municipio manualmente');
  const localities = await getLocalities(municipality.id);
  const names = new Set(localityNames.map(normalizeMunicipality));
  const matches = localities.filter((item) => names.has(normalizeMunicipality(item.name)));
  const locality = id === 'caba' ? localities[0] : matches.length === 1 ? matches[0] : null;
  return { city: municipality.name, municipalityId: municipality.id, province: municipality.province, localityId: locality?.id || '', locality: locality?.name || '' };
}
