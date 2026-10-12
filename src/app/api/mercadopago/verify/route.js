import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { confirmMercadoPagoPayment } from '@/lib/mercadopago-confirmation';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({}, { status: 400 }); }
  const { orderId, paymentId } = body || {};
  if (!/^[a-f\d]{24}$/i.test(orderId || '') || !/^\d+$/.test(paymentId || '')) {
    return NextResponse.json({}, { status: 400 });
  }
  try {
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order || (String(order.user) !== String(session.user.id) && session.user.role !== 'admin')) {
      return NextResponse.json({}, { status: 404 });
    }
    return NextResponse.json(await confirmMercadoPagoPayment(paymentId, orderId));
  } catch (error) {
    console.error('Payment return verification failed:', error.message);
    return NextResponse.json({ message: 'Verificación pendiente' }, { status: 503 });
  }
}
