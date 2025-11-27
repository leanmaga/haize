// app/api/newsletter/unsubscribe/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email no proporcionado' },
        { status: 400 }
      );
    }

    await dbConnect();

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Email no encontrado' },
        { status: 404 }
      );
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json(
        { message: 'Ya te encuentras desuscrito' },
        { status: 200 }
      );
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return NextResponse.json({
      message: 'Te has desuscrito exitosamente',
    });
  } catch (error) {
    console.error('Error al desuscribir:', error);
    return NextResponse.json(
      { error: 'Error al procesar la desuscripción' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.redirect(
        new URL('/newsletter/unsubscribe', request.url)
      );
    }

    await dbConnect();

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return NextResponse.redirect(
        new URL('/newsletter/unsubscribe?error=not-found', request.url)
      );
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.redirect(
        new URL('/newsletter/unsubscribe?already=true', request.url)
      );
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return NextResponse.redirect(
      new URL('/newsletter/unsubscribe?success=true', request.url)
    );
  } catch (error) {
    console.error('Error al desuscribir:', error);
    return NextResponse.redirect(
      new URL('/newsletter/unsubscribe?error=true', request.url)
    );
  }
}
