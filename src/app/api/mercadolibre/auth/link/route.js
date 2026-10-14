import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createHash, randomBytes } from 'crypto';
import { authOptions } from '@/lib/auth';
import { getMercadoLibreRedirectUri } from '@/lib/mercadolibre';

const PKCE_VERIFIER_COOKIE = 'ml_oauth_verifier';
const PKCE_STATE_COOKIE = 'ml_oauth_state';

function toBase64Url(value) {
  return value.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const clientId = process.env.MERCADOLIBRE_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: 'Falta configurar MERCADOLIBRE_CLIENT_ID' }, { status: 500 });

  const url = new URL('https://auth.mercadolibre.com.ar/authorization');
  const verifier = toBase64Url(randomBytes(48));
  const state = toBase64Url(randomBytes(32));
  const challenge = toBase64Url(createHash('sha256').update(verifier).digest());
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', getMercadoLibreRedirectUri());
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', state);

  const response = NextResponse.json({ authUrl: url.toString() });
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/mercadolibre/auth/callback',
    maxAge: 10 * 60,
  };
  response.cookies.set(PKCE_VERIFIER_COOKIE, verifier, cookieOptions);
  response.cookies.set(PKCE_STATE_COOKIE, state, cookieOptions);
  return response;
}
