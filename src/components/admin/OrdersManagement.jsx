'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrdersRequest,
  updateOrderStatusRequest,
} from '@/redux/slices/ordersSlice';
import { selectAllOrders } from '@/redux/selectors/ordersSelectors';
import { Search, Filter, Eye, Package, Truck, CheckCircle } from 'lucide-react';

const ORDER_STATUSES = [
  {
    value: 'pending',
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    value: 'processing',
    label: 'En Proceso',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    value: 'shipped',
    label: 'Enviado',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    value: 'delivered',
    label: 'Entregado',
    color: 'bg-green-100 text-green-800',
  },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

export default function OrdersManagement() {
  const dispatch = useDispatch();
  const orders = useSelector(selectAllOrders);
  const { loading } = useSelector((state) => state.orders);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    dispatch(fetchOrdersRequest());
  }, [dispatch]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatusRequest({ orderId, status: newStatus }));
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por #orden o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Orden
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Cliente
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Fecha
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Items
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Total
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Estado
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-sm">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium">
                        {order.shippingAddress?.fullName || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.shippingAddress?.city}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {order.items?.length || 0} items
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-sm">
                      ${order.totalPrice?.toFixed(2)}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className={`text-xs px-3 py-1 rounded-full border-0 font-medium ${
                        ORDER_STATUSES.find((s) => s.value === order.status)
                          ?.color || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="text-black hover:text-gray-600 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No se encontraron órdenes</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Orden #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Cliente */}
              <div>
                <h3 className="font-semibold mb-2">Información del Cliente</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Nombre:</span>{' '}
                    {selectedOrder.shippingAddress?.fullName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Teléfono:</span>{' '}
                    {selectedOrder.shippingAddress?.phone}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Dirección:</span>{' '}
                    {selectedOrder.shippingAddress?.street},{' '}
                    {selectedOrder.shippingAddress?.city},{' '}
                    {selectedOrder.shippingAddress?.state}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-2">Productos</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${item.subtotal?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div>
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envío:</span>
                    <span>${selectedOrder.shippingPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impuestos:</span>
                    <span>${selectedOrder.taxPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>${selectedOrder.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
