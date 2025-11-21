'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProductsRequest } from '@/redux/slices/adminProductsSlice';
import { fetchOrdersRequest } from '@/redux/slices/ordersSlice';
import {
  selectOrdersStats,
  selectAllOrders,
} from '@/redux/selectors/ordersSelectors';
import Link from 'next/link';
import {
  ArrowUpRightIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XMarkIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

/**
 * DashboardStats - Estilo Premium Minimalista
 */
export default function DashboardStats() {
  const dispatch = useDispatch();
  const { products, loading: productsLoading } = useSelector(
    (state) => state.adminProducts
  );
  const orders = useSelector(selectAllOrders);
  const ordersStats = useSelector(selectOrdersStats);
  const { loading: ordersLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchAdminProductsRequest());
    dispatch(fetchOrdersRequest());
  }, [dispatch]);

  const recentOrders = orders.slice(0, 5);

  // Status config para badges
  const statusConfig = {
    pending: { label: 'Pendiente', style: 'bg-gray-100 text-gray-700' },
    processing: { label: 'Procesando', style: 'bg-gray-200 text-gray-800' },
    shipped: { label: 'Enviado', style: 'bg-gray-800 text-white' },
    delivered: { label: 'Entregado', style: 'bg-gray-900 text-white' },
    cancelled: { label: 'Cancelado', style: 'bg-red-50 text-red-700' },
  };

  if (productsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Ingresos',
            value: `$${
              ordersStats.totalRevenue?.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
              }) || '0.00'
            }`,
          },
          { label: 'Órdenes', value: ordersStats.total || 0 },
          { label: 'Productos', value: products.length || 0 },
          {
            label: 'Pendientes',
            value: ordersStats.pending || 0,
            highlight: true,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`p-6 border transition-colors ${
              stat.highlight && stat.value > 0
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-400'
            }`}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              {stat.label}
            </p>
            <p className="text-2xl font-light text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Órdenes por Estado */}
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-6">
            Estado de Órdenes
          </h3>
          <div className="space-y-4">
            {[
              {
                label: 'Pendientes',
                value: ordersStats.pending,
                icon: ClockIcon,
              },
              {
                label: 'En Proceso',
                value: ordersStats.processing,
                icon: CubeIcon,
              },
              {
                label: 'Enviadas',
                value: ordersStats.shipped,
                icon: TruckIcon,
              },
              {
                label: 'Entregadas',
                value: ordersStats.delivered,
                icon: CheckCircleIcon,
              },
              {
                label: 'Canceladas',
                value: ordersStats.cancelled,
                icon: XMarkIcon,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {item.value || 0}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Productos Destacados */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
              Productos Destacados
            </h3>
            <Link
              href="/admin/products"
              className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              Ver todos
              <ArrowUpRightIcon className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products
              .filter((p) => p.featured)
              .slice(0, 4)
              .map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 p-3 border border-gray-100 hover:border-gray-300 transition-colors"
                >
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.title}
                      className="w-16 h-16 object-cover grayscale hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
                      <CubeIcon className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${product.salePrice?.toLocaleString('es-AR')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Stock: {product.stock}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {products.filter((p) => p.featured).length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No hay productos destacados
            </p>
          )}
        </div>
      </div>

      {/* Órdenes Recientes */}
      <div className="bg-white border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">
            Órdenes Recientes
          </h3>
          <Link
            href="/admin/orders"
            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            Ver todas
            <ArrowUpRightIcon className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const status =
                  statusConfig[order.status] || statusConfig.pending;
                return (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span className="text-sm font-mono text-gray-600">
                        #{order.orderNumber?.slice(-8) || order.id?.slice(-8)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">
                        {order.shippingAddress?.fullName || '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        $
                        {order.totalPrice?.toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs px-3 py-1 ${status.style}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {recentOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">No hay órdenes recientes</p>
          </div>
        )}
      </div>
    </div>
  );
}
