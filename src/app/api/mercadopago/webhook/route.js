import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/mercadopago-webhook-signature';
import { confirmMercadoPagoPayment } from '@/lib/mercadopago-confirmation';

export async function POST(request) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret?.trim()) return NextResponse.json({ message: 'Webhook unavailable' }, { status: 503 });
  const ids = new URL(request.url).searchParams.getAll('data.id');
  const paymentId = ids.length === 1 ? ids[0] : null;
  if (!verifyWebhookSignature({
    signature: request.headers.get('x-signature'),
    requestId: request.headers.get('x-request-id'), dataId: paymentId, secret,
  })) return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  let data;
  try { data = await request.json(); }
  catch { return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 }); }
  if (data?.data?.id == null || String(data.data.id).toLowerCase() !== paymentId.toLowerCase()) {
    return NextResponse.json({ message: 'Payment ID mismatch' }, { status: 400 });
  }
  if (data.type !== 'payment' && !['payment.created', 'payment.updated'].includes(data.action)) {
    return NextResponse.json({ message: 'Not a payment notification' });
  }
  try {
    return NextResponse.json(await confirmMercadoPagoPayment(paymentId));
  } catch (error) {
    console.error('Mercado Pago confirmation failed:', error.message);
    return NextResponse.json({ message: 'Payment processing failed' }, { status: 503 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'MercadoPago Webhook Endpoint', status: 'active' });
}
