// src/app/api/mercadopago/public-key/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MercadoPagoConfig from '@/models/MercadoPagoConfig';
import { getMercadoPagoConfig } from '@/lib/config';

export async function GET() {
  try {
    const isDevelopment =
      process.env.VERCEL_ENV === 'preview' ||
      process.env.VERCEL_ENV === 'development' ||
      process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      const { publicKey } = getMercadoPagoConfig();
      if (publicKey) {
        return NextResponse.json({
          publicKey,
          source: 'env_development',
          isProduction: false,
        });
      }
    }

    await connectDB();

    const config = await MercadoPagoConfig.getActiveConfig();

    if (!config || !config.publicKey) {
      return NextResponse.json(
        {
          error: 'No hay configuración de MercadoPago activa',
          message: 'La tienda debe conectar su cuenta de MercadoPago primero.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      publicKey: config.publicKey,
      source: 'database',
      isProduction: config.isProduction,
    });
  } catch (error) {
    console.error('❌ API: Error al obtener public key:', error);

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: 'No se pudo obtener la configuración de pagos.',
      },
      { status: 500 },
    );
  }
}
