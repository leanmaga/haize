// app//api/newsletter/subscribe/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import NewsletterConfirmation from '@/emails/NewsletterConfirmation';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validar email
    if (
      !email ||
      !email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    ) {
      return NextResponse.json(
        { error: 'Por favor ingresa un email válido' },
        { status: 400 },
      );
    }

    await dbConnect();

    // Verificar si ya existe
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'confirmed') {
        return NextResponse.json(
          { error: 'Este email ya está suscrito' },
          { status: 400 },
        );
      }

      if (existingSubscriber.status === 'pending') {
        // Reenviar email de confirmación
        const confirmationUrl = `${
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        }/api/newsletter/confirm?token=${existingSubscriber.confirmationToken}`;

        const emailHtml = await render(
          NewsletterConfirmation({ confirmationUrl }),
        );

        await resend.emails.send({
          from: 'HAIZE <newsletter@haize.com.ar>',
          to: email,
          subject: 'Confirma tu suscripción a HAIZE',
          html: emailHtml,
        });

        return NextResponse.json({
          message: 'Te hemos reenviado el email de confirmación',
        });
      }

      if (existingSubscriber.status === 'unsubscribed') {
        // Reactivar suscripción
        existingSubscriber.status = 'pending';
        existingSubscriber.confirmationToken = crypto
          .randomBytes(32)
          .toString('hex');
        existingSubscriber.unsubscribedAt = null;
        await existingSubscriber.save();

        const confirmationUrl = `${
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        }/api/newsletter/confirm?token=${existingSubscriber.confirmationToken}`;

        const emailHtml = await render(
          NewsletterConfirmation({ confirmationUrl }),
        );

        await resend.emails.send({
          from: 'HAIZE <newsletter@haize.com.ar>',
          to: email,
          subject: 'Confirma tu suscripción a HAIZE',
          html: emailHtml,
        });

        return NextResponse.json({
          message: 'Te enviamos un email para confirmar tu suscripción',
        });
      }
    }

    // Crear nuevo suscriptor
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    const subscriber = new Newsletter({
      email,
      confirmationToken,
      status: 'pending',
      metadata: {
        userAgent: request.headers.get('user-agent'),
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip'),
      },
    });

    await subscriber.save();

    // Enviar email de confirmación
    const confirmationUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }/api/newsletter/confirm?token=${confirmationToken}`;

    const emailHtml = await render(NewsletterConfirmation({ confirmationUrl }));

    await resend.emails.send({
      from: 'HAIZE <newsletter@haize.com.ar>',
      to: email,
      subject: 'Confirma tu suscripción a HAIZE',
      html: emailHtml,
    });

    return NextResponse.json({
      message: 'Te enviamos un email para confirmar tu suscripción',
    });
  } catch (error) {
    console.error('Error en suscripción:', error);
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 },
    );
  }
}
