import { NextResponse } from 'next/server';
import { getMunicipalities } from '@/lib/municipalities';

export async function GET() {
  try {
    const municipalities = await getMunicipalities();
    return NextResponse.json({ municipalities }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
