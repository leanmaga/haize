import { NextResponse } from 'next/server';
import { getLocalities } from '@/lib/localities';

export async function GET(request) {
  const municipalityId = new URL(request.url).searchParams.get('municipalityId');
  if (!/^(\d{6}|caba)$/.test(municipalityId || '')) return NextResponse.json({ error: 'Seleccioná un municipio válido' }, { status: 400 });
  try {
    return NextResponse.json({ municipalityId, localities: await getLocalities(municipalityId) }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
