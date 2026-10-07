import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  if ((await getServerSession(authOptions))?.user?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  try {
    const response = await fetch('https://apis.datos.gob.ar/georef/api/municipios?provincia=06&formato=geojson&max=5000', { next: { revalidate: 86400 } });
    if (!response.ok) throw new Error(`GeoRef respondió ${response.status}`);
    const data = await response.json();
    const features = data.features || [];
    return NextResponse.json({ features });
  } catch (error) { return NextResponse.json({ error: 'No se pudo consultar GeoRef', details: error.message }, { status: 502 }); }
}
