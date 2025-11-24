// src/app/admin/orders/[id]/page.js - CORREGIDO
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import OrderStatusUpdate from '@/components/admin/OrderStatusUpdate';
import PropTypes from 'prop-types';

// ✅ FUNCIÓN CORREGIDA - Usar la ruta API correcta
async function fetchOrderFromAPI(id) {
  try {
    console.log('🌐 Intentando obtener orden via API:', id);

    // Usar URL absoluta para server-side
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.haize.com.ar';

    // ✅ CORREGIDO: Usar la ruta de admin específica
    const url = `${baseUrl}/api/admin/orders/${id}`;

    console.log('🌐 URL de la API (CORREGIDA):', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // No cachear para tener datos frescos
    });

    console.log('🌐 Response status:', response.status);
    console.log('🌐 Response ok:', response.ok);

    if (response.status === 404) {
      console.log('🌐 Orden no encontrada (404)');
      return null;
    }

    if (response.status === 401) {
      console.log('🌐 No autenticado (401)');
      throw new Error('No autenticado');
    }

    if (response.status === 403) {
      console.log('🌐 Sin permisos (403)');
      throw new Error('No tienes permisos para ver esta orden');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log('🌐 Error en la respuesta:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🌐 Datos recibidos de la API:', !!data);
    console.log('🌐 Estructura de datos:', Object.keys(data));

    // La API devuelve { order, paymentDetails }
    const order = data.order || data;
    console.log('🌐 Orden extraída:', !!order);
    console.log('🌐 ID de la orden:', order?._id);

    return order;
  } catch (error) {
    console.error('🌐 Error completo obteniendo orden de la API:', {
      message: error.message,
      stack: error.stack,
      id: id,
    });
    throw error;
  }
}

// ✅ ALTERNATIVA MEJORADA: Usar conexión directa a la base de datos (MÁS EFICIENTE)
async function fetchOrderFromDB(id) {
  try {
    console.log('🗄️ Obteniendo orden directamente de la base de datos:', id);

    // Importar las dependencias necesarias
    const connectDB = (await import('@/lib/db')).default;
    const Order = (await import('@/models/Order')).default;

    // Validar que el ID tenga formato válido
    const mongoose = await import('mongoose');
    if (!mongoose.default.Types.ObjectId.isValid(id)) {
      console.log('❌ ID no es un ObjectId válido:', id);
      return null;
    }

    // Conectar a la base de datos
    await connectDB();

    // Buscar la orden
    const order = await Order.findById(id).lean();

    if (!order) {
      console.log('❌ Orden no encontrada para ID:', id);
      return null;
    }

    console.log('✅ Orden encontrada directamente de la DB:', order._id);

    // Convertir a JSON serializable
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error('❌ Error obteniendo orden de la DB:', {
      message: error.message,
      stack: error.stack,
      id: id,
    });
    return null;
  }
}

// Función auxiliar para formatear fechas
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

// Función auxiliar para obtener estilos de estado
const getStatusStyle = (status) => {
  switch (status) {
    case 'pagado':
      return { color: '#10b981', fontWeight: 'medium' };
    case 'enviado':
      return { color: '#2563eb', fontWeight: 'medium' };
    case 'cancelado':
      return { color: '#dc2626', fontWeight: 'medium' };
    case 'pendiente':
    case 'entregado':
      return { color: '#000000', fontWeight: 'medium' };
    default:
      return { color: '#4b5563', fontWeight: 'medium' };
  }
};

// Función auxiliar para obtener el nombre del método de pago
const getPaymentMethodName = (paymentMethod) => {
  const paymentMethods = {
    mercadopago: 'MercadoPago',
    credit_card: 'Tarjeta de Crédito',
    debit_card: 'Tarjeta de Débito',
    whatsapp: 'WhatsApp',
  };
  return paymentMethods[paymentMethod] || paymentMethod;
};

export async function generateMetadata({ params }) {
  if (!params?.id) {
    return {
      title: 'Pedido no encontrado | TiendaOnline',
    };
  }

  try {
    // Usar la función de base de datos para metadata (más rápido)
    const order = await fetchOrderFromDB(params.id);

    if (!order) {
      return {
        title: 'Pedido no encontrado | TiendaOnline',
      };
    }

    return {
      title: `Pedido #${order._id.substring(0, 8)} | TiendaOnline`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error | TiendaOnline',
    };
  }
}

export default async function OrderDetailPage({ params }) {
  try {
    console.log('🚀 OrderDetailPage iniciado');
    console.log('🚀 Params recibidos:', params);

    // 1. Verificar autenticación PRIMERO
    const session = await getServerSession(authOptions);
    console.log('🚀 Sesión:', session ? 'ENCONTRADA' : 'NO ENCONTRADA');

    if (!session) {
      console.log('🚀 No hay sesión, redirigiendo a login');
      redirect('/auth/signin');
    }

    if (session.user.role !== 'admin') {
      console.log('🚀 Usuario no es admin, redirigiendo');
      console.log('🚀 Rol del usuario:', session.user.role);
      redirect('/unauthorized');
    }

    console.log('🚀 Usuario autenticado como admin:', session.user.email);

    // 2. Validar parámetros
    if (!params?.id) {
      console.log('🚀 No ID provided in params');
      notFound();
    }

    console.log('🚀 ID recibido:', params.id);
    console.log('🚀 Longitud del ID:', params.id.length);

    // 3. Validar formato de ObjectId (opcional pero recomendado)
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(params.id)) {
      console.log('🚀 ID no tiene formato de ObjectId válido:', params.id);
      notFound();
    }

    // 4. Obtener la orden usando conexión directa a la DB (MÁS EFICIENTE)
    console.log('🚀 Intentando obtener orden...');
    const order = await fetchOrderFromDB(params.id);

    if (!order) {
      console.log('🚀 Orden no encontrada, mostrando 404');
      notFound();
    }

    console.log('🚀 Orden obtenida exitosamente:');
    console.log('🚀   - ID:', order._id);
    console.log('🚀   - Status:', order.status);
    console.log('🚀   - Cliente:', order.shippingInfo?.name);
    console.log('🚀   - Total:', order.totalAmount);
    console.log('🚀   - Items:', order.items?.length);

    const statusStyle = getStatusStyle(order.status);

    return (
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center mb-6 transition-colors"
          style={{ color: '#000000' }}
          onMouseEnter={(e) => {
            e.target.style.color = '#E5B63C';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#000000';
          }}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Volver a todos los pedidos
        </Link>

        <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-nexa-bold">
              Pedido #{order._id.substring(0, 8)}
            </h1>
            <p className="text-gray-500">
              Realizado el {formatDate(order.createdAt)}
            </p>
          </div>

          <OrderStatusUpdate order={order} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productos del pedido */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-sora-regular">Productos</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div
                      key={index}
                      className="px-6 py-4 flex items-center space-x-4"
                    >
                      {/* Imagen del producto */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
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
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-nexa-bold text-gray-900 truncate">
                          {item.name || item.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.quantity} × ${item.price}
                        </p>
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
              <div className="px-6 py-4 bg-gray-50 border-t">
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
            <div className="bg-white rounded-lg shadow p-6">
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
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-nexa-bold mb-4">
                Información del Cliente
              </h3>
              {order.shippingInfo ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-nexa-bold text-gray-500">
                      Nombre:
                    </span>
                    <p className="text-sm text-gray-900">
                      {order.shippingInfo.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-nexa-bold text-gray-500">
                      Email:
                    </span>
                    <p className="text-sm text-gray-900">
                      {order.shippingInfo.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-nexa-bold text-gray-500">
                      Teléfono:
                    </span>
                    <p className="text-sm text-gray-900">
                      {order.shippingInfo.phone}
                    </p>
                  </div>
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
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No hay información de cliente disponible
                </p>
              )}
            </div>

            {/* Información de pago */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-nexa-bold mb-4">
                Información de Pago
              </h3>
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
  } catch (error) {
    console.error('❌ Error crítico en OrderDetailPage:', error);

    // En lugar de lanzar el error, mostrar una página de error personalizada
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-lg font-nexa-bold text-red-800 mb-2">
              Error al cargar el pedido
            </h1>
            <p className="text-red-600 mb-4">{error.message}</p>
            <Link
              href="/admin/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-nexa-bold rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver a la lista de pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

// Agregar PropTypes si lo necesitas
OrderDetailPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};
