'use client';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';
import CopyButton from '@/shared/components/CopyButton';
import OrderStatusUpdate from '@/components/admin/OrderStatusUpdate';

export default function OrderDetailsAdmin({ order, statusStyle }) {
  const formatDate = (dateString) => {
    try {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
      return 'Fecha no válida';
    }
  };

  const getPaymentMethodName = (paymentMethod) => {
    const paymentMethods = {
      mercadopago: 'MercadoPago',
      credit_card: 'Tarjeta de Crédito',
      debit_card: 'Tarjeta de Débito',
      whatsapp: 'WhatsApp',
    };
    return paymentMethods[paymentMethod] || paymentMethod;
  };

  const customerInfoText = order.shippingInfo
    ? `Nombre: ${order.shippingInfo.name}\nEmail: ${order.shippingInfo.email}\nTeléfono: ${order.shippingInfo.phone}\nDirección: ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state || ''} ${order.shippingInfo.zipCode || ''}`
    : 'No hay información de cliente disponible';

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center mb-6 transition-colors"
        style={{ color: '#000000' }}
        onMouseEnter={(e) => {
          e.target.style.color = '#777777';
        }}
        onMouseLeave={(e) => {
          e.target.style.color = '#000000';
        }}
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Volver a todos los pedidos
      </Link>

      {/* <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4"> */}
      <div className="grid grid-cols-3 mb-6 gap-6">
        <div>
          <h1 className="text-2xl font-nexa-bold">
            Pedido #{order._id.substring(0, 8)}
          </h1>
          <p className="text-gray-500">
            Realizado el {formatDate(order.createdAt)}
          </p>
        </div>
        <div></div>

        <OrderStatusUpdate order={order} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos del pedido */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-sora-regular">Productos</h2>
            </div>

            <div className="divide-y divide-gray-200">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div
                    key={index}
                    className="px-6 py-5 flex items-center space-x-4"
                  >
                    {/* Imagen del producto */}
                    <div className="shrink-0 size-18 bg-gray-200 rounded-lg overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name || item.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">
                            Sin imagen
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0 self-start">
                      <div className="w-full mb-2 flex gap-2 items-center">
                        <p className="py-1 px-2 text-sm bg-gray-100 text-gray-600 rounded-md">
                          Talle: {item.size || 'N/A'}
                        </p>
                        <p className="py-1 px-2 text-sm bg-gray-100 text-gray-600 rounded-md">
                          Color: {item.color || 'N/A'}
                        </p>
                        <p className="py-1 px-2 text-sm bg-gray-100 text-gray-600 rounded-md">
                          Cantidad: {item.quantity} × ${item.price}
                        </p>
                      </div>
                      <h3 className="text-md font-nexa-bold text-gray-900 truncate">
                        {item.name || item.title}
                      </h3>
                    </div>

                    {/* Subtotal */}
                    <div className="text-sm font-nexa-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No hay productos en este pedido
                </div>
              )}
            </div>

            {/* Total */}
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-nexa-bold text-gray-900">
                  Total:
                </span>
                <span className="text-lg font-bold text-gray-900">
                  ${order.totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información del pedido */}
        <div className="space-y-6">
          {/* Estado */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-nexa-bold mb-4">Estado del Pedido</h3>
            <div>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-nexa-bold"
                style={{
                  backgroundColor: `${statusStyle.color}20`,
                  color: statusStyle.color,
                }}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-nexa-bold">
                Información del Cliente
              </h3>
              <CopyButton
                text={customerInfoText}
                className="border-none rounded-none shadow-none p-0"
                shareIcon={true}
              />
            </div>
            {order.shippingInfo ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-nexa-bold text-gray-500">
                      Nombre:
                    </span>
                    <p className="text-sm text-gray-900">
                      {order.shippingInfo.name}
                    </p>
                  </div>
                  <CopyButton
                    text={order.shippingInfo.name}
                    className="border-none rounded-none shadow-none p-0"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-nexa-bold text-gray-500">
                      Email:
                    </span>
                    <p className="text-sm text-gray-900">
                      {order.shippingInfo.email}
                    </p>
                  </div>
                  <CopyButton
                    text={order.shippingInfo.email}
                    className="border-none rounded-none shadow-none p-0"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-nexa-bold text-gray-500">
                      Teléfono:
                    </span>
                    <p className="text-sm text-gray-900">
                      {order.shippingInfo.phone}
                    </p>
                  </div>
                  <CopyButton
                    text={order.shippingInfo.phone}
                    className="border-none rounded-none shadow-none p-0"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-nexa-bold text-gray-500">
                      Dirección:
                    </span>
                    <p className="text-sm text-gray-900">
                      {order.shippingInfo.address}
                      <br />
                      {order.shippingInfo.city}, {order.shippingInfo.state}{' '}
                      {order.shippingInfo.zipCode}
                    </p>
                  </div>
                  <CopyButton
                    text={`${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state || ''} ${order.shippingInfo.zipCode || ''}`}
                    className="border-none rounded-none shadow-none p-0"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No hay información de cliente disponible
              </p>
            )}
          </div>

          {/* Información de pago */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-nexa-bold mb-4">Información de Pago</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-nexa-bold text-gray-500">
                  Método:
                </span>
                <p className="text-sm text-gray-900">
                  {getPaymentMethodName(order.paymentMethod)}
                </p>
              </div>
              {order.paymentId && (
                <div>
                  <span className="text-sm font-nexa-bold text-gray-500">
                    ID de Pago:
                  </span>
                  <p className="text-sm text-gray-900 font-mono">
                    {order.paymentId}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm font-nexa-bold text-gray-500">
                  Fecha:
                </span>
                <p className="text-sm text-gray-900">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
