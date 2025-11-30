// src/app/api/mercadopago/auth/callback/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MercadoPagoConfig from '@/models/MercadoPagoConfig';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    // Obtener el código de autorización
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId del admin (opcional)
    const error = searchParams.get('error'); // MercadoPago puede enviar errores

    // Obtener URL base
    const baseUrl = (
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      process.env.NEXTAUTH_URL ||
      'http://localhost:3000'
    ).replace(/\/$/, '');

    // Si MercadoPago envía un error (usuario canceló, etc.)
    if (error) {
      console.error('Error de MercadoPago:', error);
      return NextResponse.redirect(
        `${baseUrl}/admin/settings?error=mp_error&details=${encodeURIComponent(error)}`,
      );
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/admin/settings?error=no_code`);
    }

    // Verificar credenciales antes de hacer la petición
    if (
      !process.env.MERCADOPAGO_CLIENT_SECRET ||
      !process.env.MERCADOPAGO_CLIENT_ID
    ) {
      console.error('Faltan credenciales de MercadoPago en .env');
      return NextResponse.redirect(
        `${baseUrl}/admin/settings?error=missing_credentials`,
      );
    }

    // Intercambiar código por token
    const tokenResponse = await fetch(
      'https://api.mercadopago.com/oauth/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
          client_id: process.env.MERCADOPAGO_CLIENT_ID,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: `${baseUrl}/api/mercadopago/auth/callback`,
        }),
      },
    );

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Error al obtener token de MercadoPago:', data);
      return NextResponse.redirect(
        `${baseUrl}/admin/settings?error=token_exchange_failed&message=${encodeURIComponent(
          data.message || data.error || 'Error desconocido',
        )}`,
      );
    }

    // Verificar que tenemos los datos necesarios
    if (!data.access_token || !data.refresh_token) {
      console.error('Respuesta incompleta de MercadoPago:', data);
      return NextResponse.redirect(
        `${baseUrl}/admin/settings?error=incomplete_response`,
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Obtener sesión del admin actual
    const session = await getServerSession(authOptions);

    // Verificar que el usuario es admin
    if (!session || session.user?.role !== 'admin') {
      console.error('Usuario no autorizado intentó configurar MercadoPago');
      return NextResponse.redirect(
        `${baseUrl}/admin/settings?error=unauthorized`,
      );
    }

    const userId = state || session?.user?.id || 'default';

    // Desactivar cualquier configuración anterior
    await MercadoPagoConfig.updateMany({ isActive: true }, { isActive: false });

    // Guardar la nueva configuración
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    const config = await MercadoPagoConfig.findOneAndUpdate(
      { userId },
      {
        userId,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        publicKey: data.public_key,
        userIdMP: data.user_id?.toString(), // Asegurar que es string
        isProduction: true,
        expiresAt,
        isActive: true,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true },
    );

    // Redirigir a una página de éxito
    return NextResponse.redirect(
      `${baseUrl}/admin/settings?success=mp_connected`,
    );
  } catch (error) {
    console.error('Error en callback de MercadoPago:', error);

    const baseUrl = (
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      process.env.NEXTAUTH_URL ||
      'http://localhost:3000'
    ).replace(/\/$/, '');

    return NextResponse.redirect(
      `${baseUrl}/admin/settings?error=server_error&message=${encodeURIComponent(
        error.message,
      )}`,
    );
  }
}
