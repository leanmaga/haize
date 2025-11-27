'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function OrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/profile/orders/${params.id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cargar el pedido');
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (error) {
        console.error('Error al cargar pedido:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const getStatusText = (status) => {
    const statusMap = {
      pendiente: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      pagado: { text: 'Pagado', color: 'bg-green-100 text-green-800' },
      enviado: { text: 'Enviado', color: 'bg-blue-100 text-blue-800' },
      entregado: { text: 'Entregado', color: 'bg-green-100 text-green-800' },
      cancelado: { text: 'Cancelado', color: 'bg-red-100 text-red-800' },
      whatsapp_pendiente: {
        text: 'WhatsApp - Pendiente',
        color: 'bg-yellow-100 text-yellow-800',
      },
    };
    return (
      statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error || 'Pedido no encontrado'}</p>
        <Link href="/profile/orders" className="text-blue-600 hover:underline">
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-[80px]">
      <Link
        href="/profile/orders"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Volver a mis pedidos
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Pedido #{order._id.substring(0, 8)}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                getStatusText(order.status).color
              }`}
            >
              {getStatusText(order.status).text}
            </span>
          </div>
        </div>

        {/* ✅ PRODUCTOS CON VARIANTES */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Productos</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-4 py-4 border-b last:border-b-0"
              >
                <div className="h-20 w-20 relative flex-shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.title || 'Producto'}
                    fill
                    sizes="80px"
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>

                  {/* ✅ MOSTRAR TALLE Y COLOR */}
                  {(item.size || item.color) && (
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      {item.size && (
                        <p className="uppercase">
                          <span className="font-medium">Talle:</span>{' '}
                          {item.size}
                        </p>
                      )}
                      {item.color && (
                        <p className="uppercase">
                          <span className="font-medium">Color:</span>{' '}
                          {item.color}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mt-2">
                    Cantidad: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Precio unitario: ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Información de envío */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Información de Envío</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Nombre:</span>{' '}
              {order.shippingInfo.name}
            </p>
            <p>
              <span className="font-medium">Email:</span>{' '}
              {order.shippingInfo.email}
            </p>
            <p>
              <span className="font-medium">Teléfono:</span>{' '}
              {order.shippingInfo.phone}
            </p>
            <p>
              <span className="font-medium">Dirección:</span>{' '}
              {order.shippingInfo.address}
            </p>
            <p>
              <span className="font-medium">Ciudad:</span>{' '}
              {order.shippingInfo.city}
            </p>
            <p>
              <span className="font-medium">Código Postal:</span>{' '}
              {order.shippingInfo.postalCode}
            </p>
          </div>
        </div>

        {/* Información de pago */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Información de Pago</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Método:</span>{' '}
              {order.paymentMethod === 'mercadopago'
                ? 'MercadoPago'
                : order.paymentMethod === 'whatsapp'
                  ? 'WhatsApp'
                  : order.paymentMethod}
            </p>
            {order.paymentId && (
              <p>
                <span className="font-medium">ID de pago:</span>{' '}
                {order.paymentId}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
