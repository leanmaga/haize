'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);
  const [state, setState] = useState('checking');

  // Limpiar el carrito al cargar la página
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('method') === 'whatsapp') {
      setState('whatsapp');
      clearCart();
      return;
    }
    const orderId = query.get('external_reference');
    const paymentId = query.get('payment_id') || query.get('collection_id');
    let stopped = false;
    let timer;
    async function verify(attempt = 0) {
      try {
        const response = await fetch('/api/mercadopago/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, paymentId }),
        });
        const result = await response.json();
        if (stopped) return;
        if (response.ok && result.paid) {
          setState('paid');
          clearCart();
          return;
        }
      } catch { /* Retry network failures without charging again. */ }
      if (stopped) return;
      if (attempt < 5) timer = setTimeout(() => verify(attempt + 1), 3000);
      else setState('pending');
    }
    if (orderId && paymentId) verify();
    else setState('pending');
    return () => { stopped = true; clearTimeout(timer); };
  }, [clearCart]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-lg w-full text-center">
          <div className="flex justify-center mb-4">
            {state === 'paid' && <CheckCircleIcon className="h-16 w-16 text-green-500" />}
          </div>

          <h1 className="text-2xl font-nexa-bold text-gray-900 mb-2">
            {state === 'paid' ? '¡Pago confirmado!' : state === 'checking' ? 'Verificando tu pago…' : state === 'whatsapp' ? 'Pedido recibido' : 'Confirmación en proceso'}
          </h1>

          <p className="text-gray-600 mb-4">
            {state === 'paid' ? 'Tu pedido ya figura como pagado.' : state === 'whatsapp' ? 'Coordinaremos el pago por WhatsApp.' : 'Estamos esperando la confirmación del pago. Si ya pagaste, no vuelvas a pagar.'}
          </p>

          <div className="text-gray-600 mb-6">
            <p className="mb-2">
              {state === 'paid' ? 'Recibirás la confirmación del pago por correo electrónico.' : 'Podés consultar el estado actualizado en Mis Pedidos.'}
            </p>
            <p>
              El vendedor se pondrá en contacto contigo para coordinar el envío
              utilizando la información proporcionada.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white border border-gray-400 text-gray-600 hover:bg-gray-50 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Seguir Comprando
            </Link>

            <Link
              href="/profile/orders"
              className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Ver Mis Pedidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
