import { normalizeMunicipality } from './municipalities';

export async function getLocalities(municipalityId) {
  if (municipalityId === 'caba') return [{ id: 'caba', name: 'Ciudad Autónoma de Buenos Aires' }];
  if (!/^\d{6}$/.test(municipalityId || '')) throw new Error('Seleccioná un municipio válido');
  const url = new URL('https://apis.datos.gob.ar/georef/api/localidades');
  url.search = new URLSearchParams({ municipio: municipalityId, campos: 'id,nombre,municipio', max: '5000' }).toString();
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) throw new Error('No se pudieron cargar las localidades. Intentá nuevamente.');
  const data = await response.json();
  if (!Array.isArray(data.localidades) || data.cantidad !== data.total) throw new Error('El catálogo de localidades está incompleto');
  // GeoRef can include both the census locality and its namesake settlement.
  const unique = new Map();
  for (const item of [...data.localidades].sort((a, b) => b.id.length - a.id.length)) {
    if (String(item.municipio?.id) !== municipalityId) continue;
    const key = normalizeMunicipality(item.nombre);
    if (!unique.has(key)) unique.set(key, { id: String(item.id), name: item.nombre });
  }
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function resolveLocality(localityId, localities) {
  const locality = localities.find((item) => item.id === localityId);
  if (!locality) throw new Error('Seleccioná una localidad válida del municipio');
  return locality;
}
