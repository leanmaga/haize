// src/app/api/mercadopago/public-key/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MercadoPagoConfig from '@/models/MercadoPagoConfig';

export async function GET() {
  try {
    await connectDB();

    const config = await MercadoPagoConfig.getActiveConfig();

    if (!config || !config.publicKey) {
      // Fallback SOLO para desarrollo local
      if (
        process.env.NODE_ENV === 'development' &&
        process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
      ) {
        return NextResponse.json({
          publicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
          source: 'env_fallback',
        });
      }

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
