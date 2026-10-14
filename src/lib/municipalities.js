const GEOREF_URL = 'https://apis.datos.gob.ar/georef/api/municipios?campos=id,nombre,provincia&max=5000';

export const normalizeMunicipality = (value) => typeof value === 'string'
  ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase()
  : '';

// IGN uses five digits for Buenos Aires partidos; GeoRef inserts a zero after the province code.
export const canonicalMunicipalityId = (value) => {
  const id = String(value || '');
  return /^06\d{3}$/.test(id) ? `06${id.slice(2).padStart(4, '0')}` : id;
};

export async function getMunicipalities() {
  const response = await fetch(GEOREF_URL, { next: { revalidate: 86400 } });
  if (!response.ok) throw new Error('No se pudo consultar el catálogo oficial de municipios');
  const data = await response.json();
  if (!Array.isArray(data.municipios) || data.municipios.length < 1000 || data.cantidad !== data.total) {
    throw new Error('El catálogo oficial de municipios está incompleto');
  }
  return [
    ...data.municipios.map((municipio) => ({
      id: String(municipio.id),
      name: municipio.nombre,
      province: municipio.provincia?.nombre || '',
    })),
    { id: 'caba', name: 'CABA', province: 'Ciudad Autónoma de Buenos Aires' },
  ];
}

export function resolveMunicipality(city, municipalityId, catalog) {
  const normalized = normalizeMunicipality(city);
  if (!normalized) throw new Error('Ingresá el municipio de entrega');
  const matches = catalog.filter((item) => normalizeMunicipality(item.name) === normalized);
  const selected = municipalityId
    ? matches.find((item) => item.id === String(municipalityId))
    : matches.length === 1 ? matches[0] : null;
  if (!selected) throw new Error('Seleccioná un municipio válido de la lista');
  return selected;
}
