// app/checkout/whatsapp/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaWhatsapp, FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function WhatsAppRedirectPage() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('orderId');
  const whatsappUrl = searchParams.get('url');

  useEffect(() => {
    console.log('📋 Params recibidos:', { orderId, whatsappUrl });

    // Cargar datos de la orden desde localStorage
    if (orderId) {
      const orderKey = `whatsapp_order_temp_${orderId}`;
      const storedData = localStorage.getItem(orderKey);

      console.log(
        '💾 Datos en localStorage:',
        storedData ? 'Encontrados' : 'No encontrados',
      );

      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          console.log('✅ Datos parseados:', data);
          setOrderData(data);
        } catch (error) {
          console.error('Error parsing order data:', error);
        }
      }
    } else {
      console.warn('⚠️ No se recibió orderId en URL');
    }

    setLoading(false);
  }, [orderId, whatsappUrl]);

  const handleOpenWhatsApp = () => {
    if (whatsappUrl) {
      // Abrir WhatsApp en nueva ventana
      window.location.href = whatsappUrl;

      // Después de un momento, redirigir a success
      setTimeout(() => {
        router.push(`/checkout/success?method=whatsapp&orderId=${orderId}`);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-[80px]">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Mensaje de éxito */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-6">
              <FaCheckCircle className="text-green-600 text-6xl" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-nexa-bold mb-4">
            ¡Orden Creada Exitosamente!
          </h1>

          {/* Número de orden */}
          {orderId && (
            <p className="text-gray-600 mb-6">
              Número de pedido:{' '}
              <span className="font-bold text-black">
                #{orderId.substring(0, 8)}
              </span>
            </p>
          )}

          {/* Detalles de la orden */}
          {orderData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-nexa-bold text-lg mb-4">
                Resumen de tu pedido:
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {orderData.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.title} x {item.quantity}
                      {item.size && ` - Talle: ${item.size}`}
                      {item.color && ` - Color: ${item.color}`}
                    </span>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${orderData.subtotal?.toFixed(2) || '0.00'}</span>
                </div>

                {orderData.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({orderData.appliedCoupon?.code}):</span>
                    <span>-${orderData.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-nexa-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${orderData.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-900 text-sm">
              📱 <strong>Siguiente paso:</strong> Haz click en el botón de abajo
              para abrir WhatsApp y confirmar tu pedido con nuestro equipo.
            </p>
          </div>

          {/* Botón de WhatsApp GRANDE */}
          {whatsappUrl ? (
            <button
              onClick={handleOpenWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 px-8 rounded-lg text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg mb-4"
            >
              <FaWhatsapp className="text-3xl" />
              <span>Abrir WhatsApp y Confirmar Pedido</span>
            </button>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-900 text-sm">
                ⚠️ <strong>URL de WhatsApp no encontrada.</strong> Por favor,
                intenta crear el pedido nuevamente.
              </p>
              <Link
                href="/checkout"
                className="mt-4 inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
              >
                Volver al Checkout
              </Link>
            </div>
          )}

          {/* Botón alternativo - Mostrar SIEMPRE */}
          {!whatsappUrl && orderId && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                Mientras tanto, puedes contactarnos directamente:
              </p>
              <a
                href="https://wa.me/5491126907696"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all"
              >
                <FaWhatsapp className="text-2xl" />
                <span>Abrir WhatsApp (Sin Mensaje)</span>
              </a>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Número de pedido para referencia: #{orderId?.substring(0, 8)}
              </p>
            </div>
          )}

          {/* Botón alternativo */}
          <p className="text-sm text-gray-600 mb-4">
            También puedes copiar el enlace y abrirlo manualmente:
          </p>

          {whatsappUrl && (
            <div className="bg-gray-100 rounded p-3 mb-6 break-all text-xs text-gray-700">
              {whatsappUrl}
            </div>
          )}

          {/* Link de navegación */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t">
            <Link
              href="/products"
              className="text-gray-600 hover:text-black transition-colors"
            >
              ← Seguir comprando
            </Link>
            <Link
              href="/profile/orders"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Ver mis pedidos →
            </Link>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-nexa-bold text-lg mb-4">
            ℹ️ Información importante:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              ✓ Tu pedido ha sido guardado y nuestro equipo lo recibirá por
              WhatsApp
            </li>
            <li>
              ✓ Recibirás un email de confirmación con los detalles de tu pedido
            </li>
            <li>
              ✓ Te responderemos por WhatsApp para confirmar disponibilidad y
              coordinar el envío
            </li>
            <li>
              ✓ Si tienes alguna pregunta, puedes contactarnos directamente por
              WhatsApp
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
