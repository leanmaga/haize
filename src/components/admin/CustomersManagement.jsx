'use client';

import { useState, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, ShoppingBag, User } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Clientes</p>
              <p className="text-3xl font-bold">{customers.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <User className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Clientes Activos</p>
              <p className="text-3xl font-bold">
                {customers.filter((c) => c.orders?.length > 0).length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <ShoppingBag className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nuevos este mes</p>
              <p className="text-3xl font-bold">
                {
                  customers.filter((c) => {
                    const createdDate = new Date(c.createdAt);
                    const now = new Date();
                    return (
                      createdDate.getMonth() === now.getMonth() &&
                      createdDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <User className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar clientes por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Cliente
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Teléfono
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Órdenes
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Registrado
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {customer.imageUrl ? (
                        <img
                          src={customer.imageUrl}
                          alt={customer.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User size={20} className="text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          @{customer.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      {customer.email}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      {customer.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium">
                      {customer.orders?.length || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowDetailModal(true);
                      }}
                      className="text-black hover:text-gray-600 text-sm underline"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No se encontraron clientes</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Información del Cliente</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Personal */}
              <div className="flex items-center gap-4">
                {selectedCustomer.imageUrl ? (
                  <img
                    src={selectedCustomer.imageUrl}
                    alt={selectedCustomer.firstName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={32} className="text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h3>
                  <p className="text-gray-500">@{selectedCustomer.username}</p>
                  <span
                    className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                      selectedCustomer.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedCustomer.role}
                  </span>
                </div>
              </div>

              {/* Contacto */}
              <div>
                <h4 className="font-semibold mb-3">Información de Contacto</h4>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-gray-400" />
                    <span>{selectedCustomer.phone || 'No especificado'}</span>
                  </div>
                  {selectedCustomer.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-gray-400" />
                      <span>
                        {selectedCustomer.address.street},{' '}
                        {selectedCustomer.address.city}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Estadísticas */}
              <div>
                <h4 className="font-semibold mb-3">Estadísticas</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedCustomer.orders?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Órdenes</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedCustomer.cart?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Items en carrito</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedCustomer.favorites?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Favoritos</p>
                  </div>
                </div>
              </div>

              {/* Fecha registro */}
              <div className="text-sm text-gray-500 pt-4 border-t">
                Registrado el{' '}
                {new Date(selectedCustomer.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
