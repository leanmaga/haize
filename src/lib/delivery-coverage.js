export const zoneSlug = (name = '') => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function mergeCoverage(catalog, zones) {
  const matched = new Set();
  const features = catalog.map((feature) => {
    const slug = zoneSlug(feature.properties.nombre);
    const zone = zones.find((item) => item.municipalityId === String(feature.id) || item.slug === slug);
    if (zone) matched.add(zone._id);
    return { ...feature, properties: {
      ...feature.properties, name: feature.properties.nombre, slug,
      isActive: zone?.isActive === true, shippingPrice: zone?.shippingPrice ?? null,
      cutoffTime: zone?.cutoffTime || '11:00',
    } };
  });
  for (const zone of zones) {
    if (!matched.has(zone._id) && zone.geometry) features.push({
      type: 'Feature', id: String(zone._id), geometry: zone.geometry,
      properties: { name: zone.name, slug: zone.slug, isActive: zone.isActive, shippingPrice: zone.shippingPrice ?? null, cutoffTime: zone.cutoffTime },
    });
  }
  return features;
}

export function zonePayload(data) {
  if (!data.name || !data.slug || !['Polygon', 'MultiPolygon'].includes(data.geometry?.type) || !data.geometry.coordinates?.length) throw new Error('Nombre, slug y polígono son requeridos.');
  if (data.shippingPrice != null && (typeof data.shippingPrice !== 'number' || !Number.isFinite(data.shippingPrice) || data.shippingPrice < 0 || Math.abs(Math.round(data.shippingPrice * 100) - data.shippingPrice * 100) > 0.000001)) throw new Error('El precio debe ser un número positivo o cero, con hasta dos decimales.');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.cutoffTime || '')) throw new Error('Hora límite inválida.');
  if (typeof data.isActive !== 'boolean') throw new Error('Estado de cobertura inválido.');
  return { name: data.name, slug: data.slug, geometry: data.geometry, detail: data.detail || '', municipalityId: data.municipalityId || undefined, shippingPrice: data.shippingPrice ?? null, cutoffTime: data.cutoffTime, isActive: data.isActive };
}
