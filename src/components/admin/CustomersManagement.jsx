'use client';

import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShoppingBagIcon,
  UserIcon,
  XMarkIcon,
  HeartIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';

/**
 * CustomersManagement - Estilo Premium Minimalista
 */
export default function CustomersManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newThisMonth = customers.filter((c) => {
    const createdDate = new Date(c.createdAt);
    const now = new Date();
    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    );
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Clientes', value: customers.length },
          {
            label: 'Con Compras',
            value: customers.filter((c) => c.orders?.length > 0).length,
          },
          { label: 'Nuevos este mes', value: newThisMonth },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 p-6 hover:border-gray-400 transition-colors"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              {stat.label}
            </p>
            <p className="text-3xl font-light text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-gray-900 focus:ring-0 outline-none transition-colors text-sm"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="text-center py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Órdenes
                </th>
                <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer._id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      {customer.imageUrl ? (
                        <img
                          src={customer.imageUrl}
                          alt={customer.firstName}
                          className="w-10 h-10 object-cover grayscale"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          @{customer.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        {customer.email}
                      </p>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-300" />
                        {customer.phone || '—'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-sm font-medium text-gray-700">
                      {customer.orders?.length || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {new Date(customer.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowDetailModal(true);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4 transition-colors"
                    >
                      Ver más
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-16">
            <UserIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-400 text-sm">No se encontraron clientes</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-sm font-medium uppercase tracking-wider">
                Detalle del Cliente
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                {selectedCustomer.imageUrl ? (
                  <img
                    src={selectedCustomer.imageUrl}
                    alt={selectedCustomer.firstName}
                    className="w-20 h-20 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    @{selectedCustomer.username}
                  </p>
                  <span
                    className={`inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-1 ${
                      selectedCustomer.role === 'admin'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {selectedCustomer.role}
                  </span>
                </div>
              </div>

              {/* Contact */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Contacto
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      {selectedCustomer.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      {selectedCustomer.phone || '—'}
                    </span>
                  </div>
                  {selectedCustomer.address && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">
                        {selectedCustomer.address.street},{' '}
                        {selectedCustomer.address.city}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Actividad
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      icon: ShoppingBagIcon,
                      value: selectedCustomer.orders?.length || 0,
                      label: 'Órdenes',
                    },
                    {
                      icon: ShoppingCartIcon,
                      value: selectedCustomer.cart?.length || 0,
                      label: 'En carrito',
                    },
                    {
                      icon: HeartIcon,
                      value: selectedCustomer.favorites?.length || 0,
                      label: 'Favoritos',
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="text-center p-4 bg-gray-50"
                      >
                        <Icon className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                        <p className="text-xl font-light text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          {stat.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
                Registrado el{' '}
                {new Date(selectedCustomer.createdAt).toLocaleString('es-AR')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
