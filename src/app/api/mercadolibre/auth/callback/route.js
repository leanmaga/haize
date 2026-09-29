import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import MercadoLibreConfig from '@/models/MercadoLibreConfig';
import { getMercadoLibreRedirectUri } from '@/lib/mercadolibre';

export async function GET(request) {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');
  if (oauthError || !code) return NextResponse.redirect(`${baseUrl}/admin/settings/integrations/mercado-libre?error=${encodeURIComponent(oauthError || 'no_code')}`);

  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') return NextResponse.redirect(`${baseUrl}/admin/settings/integrations/mercado-libre?error=unauthorized`);

  try {
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.MERCADOLIBRE_CLIENT_ID || '',
        client_secret: process.env.MERCADOLIBRE_CLIENT_SECRET || '',
        code,
        redirect_uri: getMercadoLibreRedirectUri(),
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.access_token || !data.refresh_token || !data.user_id) throw new Error(data.message || 'Respuesta de autorización inválida');
    await connectDB();
    await MercadoLibreConfig.updateMany({ isActive: true }, { isActive: false });
    await MercadoLibreConfig.findOneAndUpdate(
      { userId: session.user.id },
      { userId: session.user.id, accessToken: data.access_token, refreshToken: data.refresh_token, sellerId: String(data.user_id), expiresAt: new Date(Date.now() + data.expires_in * 1000), isActive: true, lastUpdated: new Date() },
      { upsert: true, new: true },
    );
    return NextResponse.redirect(`${baseUrl}/admin/settings/integrations/mercado-libre?success=connected`);
  } catch (error) {
    console.error('[MERCADOLIBRE] Error al vincular cuenta:', error);
    return NextResponse.redirect(`${baseUrl}/admin/settings/integrations/mercado-libre?error=token_exchange_failed`);
  }
}
