// app/api/newsletter/confirm/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import { sendWelcomeEmail, WELCOME_CODE } from '@/lib/welcome-email';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de confirmación no proporcionado' },
        { status: 400 },
      );
    }

    await dbConnect();

    // Buscar suscriptor por token
    const subscriber = await Newsletter.findOne({ confirmationToken: token });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 404 },
      );
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json(
        { error: 'Volvé a suscribirte para confirmar tu email' },
        { status: 400 },
      );
    }

    // Confirmar suscriptor
    subscriber.status = 'confirmed';
    subscriber.confirmedAt ||= new Date();

    // Generar código de descuento
    const discountCode = WELCOME_CODE;
    subscriber.discountCode = discountCode;

    await subscriber.save();

    // Enviar email de bienvenida con código
    const result = await sendWelcomeEmail(subscriber.email);
    if (!result.success) {
      return NextResponse.json({ error: 'Suscripción confirmada. No pudimos enviar tu bienvenida; volvé a abrir este enlace para reintentar.' }, { status: 503 });
    }

    // Redirigir a página de éxito
    return NextResponse.redirect(new URL('/newsletter/success', request.url));
  } catch (error) {
    console.error('Error al confirmar suscripción:', error);
    return NextResponse.json(
      { error: 'Error al confirmar la suscripción' },
      { status: 500 },
    );
  }
}
