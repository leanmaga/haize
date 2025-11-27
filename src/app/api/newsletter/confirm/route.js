// app/api/newsletter/confirm/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import NewsletterWelcome from '@/emails/NewsletterWelcome';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    if (subscriber.status === 'confirmed') {
      return NextResponse.json(
        { error: 'Este email ya fue confirmado anteriormente' },
        { status: 400 },
      );
    }

    // Confirmar suscriptor
    subscriber.status = 'confirmed';
    subscriber.confirmedAt = new Date();

    // Generar código de descuento
    const discountCode = subscriber.generateDiscountCode();
    subscriber.discountCode = discountCode;

    await subscriber.save();

    // Enviar email de bienvenida con código
    const emailHtml = await render(
      NewsletterWelcome({
        discountCode,
        email: subscriber.email,
      }),
    );

    await resend.emails.send({
      from: 'HAIZE <newsletter@haize.com.ar>',
      to: subscriber.email,
      subject: '¡Bienvenido a HAIZE! Tu código de descuento',
      html: emailHtml,
    });

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
