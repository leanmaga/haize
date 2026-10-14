import { NextResponse } from 'next/server';
import { coverageMunicipalityId } from '@/lib/delivery-coverage';

// Public, read-only administrative boundaries; no account or delivery configuration.
export async function GET() {
  try {
    const query = new URLSearchParams({
      where: "CODPROV = '06'", outFields: 'CODINDEC,NAM',
      returnGeometry: 'true', outSR: '4326', geometryPrecision: '5',
      maxAllowableOffset: '0.0001', f: 'geojson',
    });
    const response = await fetch(`https://ide.ign.gob.ar/geoservicios/rest/services/ANIDA/org_politica/MapServer/270/query?${query}`, { next: { revalidate: 86400 } });
    if (!response.ok) throw new Error('El IGN no está disponible.');
    const data = await response.json();
    if (data.error || data.exceededTransferLimit || !data.features?.length) throw new Error('El IGN devolvió un catálogo incompleto.');
    const features = data.features.map((feature) => ({
      type: 'Feature', id: coverageMunicipalityId(feature.properties.CODINDEC, feature.properties.NAM),
      properties: { id: coverageMunicipalityId(feature.properties.CODINDEC, feature.properties.NAM), nombre: feature.properties.NAM },
      geometry: feature.geometry,
    })).filter((feature) => feature.properties.nombre && ['Polygon', 'MultiPolygon'].includes(feature.geometry?.type));
    if (features.length !== 135) throw new Error('No se pudieron verificar los 135 partidos bonaerenses.');
    if (new Set(features.map((feature) => feature.id)).size !== features.length) throw new Error('El catálogo de municipios contiene identificadores duplicados.');
    const cityQuery = new URLSearchParams({ where: '1=1', outFields: 'FNA', returnGeometry: 'true', outSR: '4326', geometryPrecision: '5', maxAllowableOffset: '0.0001', f: 'geojson' });
    const cityResponse = await fetch(`https://ide.ign.gob.ar/geoservicios/rest/services/ANIDA/org_politica/MapServer/234/query?${cityQuery}`, { next: { revalidate: 86400 } });
    if (!cityResponse.ok) throw new Error('No se pudo consultar el límite de CABA.');
    const city = await cityResponse.json();
    if (city.error || city.features?.length !== 1 || !['Polygon', 'MultiPolygon'].includes(city.features[0].geometry?.type)) throw new Error('El límite de CABA no es válido.');
    features.push({ type: 'Feature', id: 'caba', properties: { id: 'caba', nombre: 'CABA' }, geometry: city.features[0].geometry });
    features.sort((a, b) => a.properties.nombre.localeCompare(b.properties.nombre, 'es'));
    return NextResponse.json({ type: 'FeatureCollection', features });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
