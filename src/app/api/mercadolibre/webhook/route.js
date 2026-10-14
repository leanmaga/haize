import { NextResponse } from 'next/server';
import { mercadoLibreRequest } from '@/lib/mercadolibre';
import { reduceStockForMercadoLibreOrder } from '@/lib/mercadolibre-stock';

export async function POST(request) {
  try {
    const notification = await request.json();
    // Mercado Libre reintenta las notificaciones: responder 200 a eventos que
    // no son ventas y usar la orden como fuente de verdad, nunca el payload.
    if (!['orders_v2', 'marketplace_orders'].includes(notification.topic)) return NextResponse.json({ received: true });
    const resource = notification.resource || '';
    if (!/^\/orders\/\d+$/.test(resource) && !/^\/marketplace\/orders\/\d+$/.test(resource)) {
      return NextResponse.json({ received: true });
    }
    const order = await mercadoLibreRequest(resource);
    const result = await reduceStockForMercadoLibreOrder(order);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    console.error('[MERCADOLIBRE] Error procesando webhook:', error);
    // Devolvemos error para que Mercado Libre reintente una venta no procesada.
    return NextResponse.json({ error: 'No se pudo procesar la notificación' }, { status: 500 });
  }
}
