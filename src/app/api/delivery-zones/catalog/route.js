import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  if ((await getServerSession(authOptions))?.user?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  try {
    const response = await fetch('https://apis.datos.gob.ar/georef/api/municipios?provincia=06&max=5000', { next: { revalidate: 86400 } });
    if (!response.ok) throw new Error(`GeoRef respondió ${response.status}`);
    const municipalities = await response.json();
    const geometryResponse = await fetch('https://ide.ign.gob.ar/geoservicios/rest/services/ANIDA/org_politica/MapServer/275/query?where=IN1%20LIKE%20%2706%25%27&outFields=FNA%2CIN1&returnGeometry=true&outSR=4326&f=geojson', { next: { revalidate: 86400 } });
    if (!geometryResponse.ok) throw new Error(`IGN respondió ${geometryResponse.status}`);
    const geometryData = await geometryResponse.json();
    const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const names = municipalities.municipios || [];
    const features = (geometryData.features || []).map((feature) => {
      const name = feature.properties?.FNA || feature.properties?.fna || feature.properties?.nombre;
      const match = names.find((municipality) => normalize(municipality.nombre) === normalize(name) || normalize(name).includes(normalize(municipality.nombre)));
      return { ...feature, id: feature.properties?.IN1 || match?.id || name, properties: { id: feature.properties?.IN1 || match?.id || name, nombre: match?.nombre || name } };
    }).filter((feature) => feature.geometry?.coordinates?.length);
    return NextResponse.json({ features });
  } catch (error) { return NextResponse.json({ error: 'No se pudo consultar GeoRef', details: error.message }, { status: 502 }); }
}
