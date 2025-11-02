'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProductsRequest } from '@/redux/slices/adminProductsSlice';
import { fetchOrdersRequest } from '@/redux/slices/ordersSlice';
import {
  selectOrdersStats,
  selectAllOrders,
} from '@/redux/selectors/ordersSelectors';
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';

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

  const stats = [
    {
      name: 'Ingresos Totales',
      value: `$${ordersStats.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%',
    },
    {
      name: 'Órdenes Totales',
      value: ordersStats.total || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: '+8.2%',
    },
    {
      name: 'Productos',
      value: products.length || 0,
      icon: Package,
      color: 'bg-purple-500',
      change: `${products.filter((p) => p.stock > 0).length} en stock`,
    },
    {
      name: 'Órdenes Pendientes',
      value: ordersStats.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      change: 'Requieren atención',
    },
  ];

  const recentOrders = orders.slice(0, 5);

  if (productsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Órdenes por Estado */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Órdenes por Estado
          </h3>
          <div className="space-y-3">
            {[
              {
                label: 'Pendientes',
                value: ordersStats.pending,
                color: 'bg-yellow-500',
              },
              {
                label: 'En Proceso',
                value: ordersStats.processing,
                color: 'bg-blue-500',
              },
              {
                label: 'Enviadas',
                value: ordersStats.shipped,
                color: 'bg-purple-500',
              },
              {
                label: 'Entregadas',
                value: ordersStats.delivered,
                color: 'bg-green-500',
              },
              {
                label: 'Canceladas',
                value: ordersStats.cancelled,
                color: 'bg-red-500',
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`${item.color} w-3 h-3 rounded-full`}></div>
                <span className="text-sm text-gray-600 flex-1">
                  {item.label}
                </span>
                <span className="text-sm font-semibold">{item.value || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Productos Destacados */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Productos Destacados
          </h3>
          <div className="space-y-3">
            {products
              .filter((p) => p.featured)
              .slice(0, 5)
              .map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${product.salePrice}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      product.stock > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.stock} stock
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Órdenes Recientes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Órdenes Recientes</h3>
          <a
            href="/admin/orders"
            className="text-sm text-black hover:underline"
          >
            Ver todas →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  #Orden
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Total
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm">#{order.orderNumber}</td>
                  <td className="py-3 px-4 text-sm">
                    {order.shippingAddress?.fullName || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold">
                    ${order.totalPrice?.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
