// src/app/admin/orders/[id]/page.js - CORREGIDO
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';
import OrderDetailsAdmin from '@/modules/admin/order/OrderDetailsAdmin';

// ✅ FUNCIÓN CORREGIDA - Usar la ruta API correcta
async function fetchOrderFromAPI(id) {
  try {
    // Usar URL absoluta para server-side
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.haize.com.ar';

    // ✅ CORREGIDO: Usar la ruta de admin específica
    const url = `${baseUrl}/api/admin/orders/${id}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // No cachear para tener datos frescos
    });

    if (response.status === 404) {
      return null;
    }

    if (response.status === 401) {
      throw new Error('No autenticado');
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para ver esta orden');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // La API devuelve { order, paymentDetails }
    const order = data.order || data;

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
    // Importar las dependencias necesarias
    const connectDB = (await import('@/lib/db')).default;
    const Order = (await import('@/models/Order')).default;

    // Validar que el ID tenga formato válido
    const mongoose = await import('mongoose');
    if (!mongoose.default.Types.ObjectId.isValid(id)) {
      return null;
    }

    // Conectar a la base de datos
    await connectDB();

    // Buscar la orden
    const order = await Order.findById(id).lean();

    if (!order) {
      return null;
    }

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

export async function generateMetadata({ params }) {
  const resolvedParams = await params;

  if (!resolvedParams?.id) {
    return {
      title: 'Pedido no encontrado | TiendaOnline',
    };
  }

  try {
    // Usar la función de base de datos para metadata (más rápido)
    const order = await fetchOrderFromDB(resolvedParams.id);

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
  const resolvedParams = await params;

  try {
    // 1. Verificar autenticación PRIMERO
    const session = await getServerSession(authOptions);

    if (!session) {
      redirect('/auth/signin');
    }

    if (session.user.role !== 'admin') {
      redirect('/unauthorized');
    }

    // 2. Validar parámetros
    if (!resolvedParams?.id) {
      notFound();
    }

    // 3. Validar formato de ObjectId (opcional pero recomendado)
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(resolvedParams.id)) {
      notFound();
    }

    const order = await fetchOrderFromDB(params.id);

    if (!order) {
      notFound();
    }

    const statusStyle = getStatusStyle(order.status);

    return <OrderDetailsAdmin order={order} statusStyle={statusStyle} />;
  } catch (error) {
    console.error('❌ Error crítico en OrderDetailPage:', error);

    // En lugar de lanzar el error, mostrar una página de error personalizada
    return (
      <div className="min-h-screen bg-white py-8">
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
