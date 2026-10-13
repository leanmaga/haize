import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { resolveGoogleAddress } from '@/lib/resolve-google-address';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const address = await resolveGoogleAddress(await request.json());
    return NextResponse.json(address, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'No pudimos identificar la localidad. Completá el municipio y la localidad manualmente.' }, { status: 400 });
  }
}
