import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getMercadoLibreRedirectUri } from '@/lib/mercadolibre';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const clientId = process.env.MERCADOLIBRE_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: 'Falta configurar MERCADOLIBRE_CLIENT_ID' }, { status: 500 });

  const url = new URL('https://auth.mercadolibre.com.ar/authorization');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', getMercadoLibreRedirectUri());
  return NextResponse.json({ authUrl: url.toString() });
}
