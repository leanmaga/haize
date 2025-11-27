'use client';

import { useState, useEffect } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  ArchiveBoxIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const estadoConfig = {
  pendiente: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  leido: {
    label: 'Leído',
    color: 'bg-blue-100 text-blue-800',
    dotColor: 'bg-blue-500',
  },
  respondido: {
    label: 'Respondido',
    color: 'bg-green-100 text-green-800',
    dotColor: 'bg-green-500',
  },
  archivado: {
    label: 'Archivado',
    color: 'bg-gray-100 text-gray-800',
    dotColor: 'bg-gray-500',
  },
};

export default function AdminContactos() {
  const [contacts, setContacts] = useState([]);
  const [counts, setCounts] = useState({
    pendiente: 0,
    leido: 0,
    respondido: 0,
    archivado: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar consultas
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEstado !== 'todos') params.set('estado', filtroEstado);

      const res = await fetch(`/api/contact?${params}`);
      const data = await res.json();

      setContacts(data.contacts || []);
      setCounts(data.counts || {});
    } catch (error) {
      console.error('Error al cargar consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [filtroEstado]);

  // Actualizar estado de consulta
  const updateEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado }),
      });

      if (res.ok) {
        fetchContacts();
        if (selectedContact?._id === id) {
          setSelectedContact((prev) => ({ ...prev, estado: nuevoEstado }));
        }
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  // Eliminar consulta
  const deleteContact = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta consulta?')) return;

    try {
      const res = await fetch(`/api/contact?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchContacts();
        if (selectedContact?._id === id) {
          setSelectedContact(null);
        }
      }
    } catch (error) {
      console.error('Error al eliminar consulta:', error);
    }
  };

  // Filtrar por búsqueda
  const filteredContacts = contacts.filter((contact) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      contact.nombreApellido?.toLowerCase().includes(search) ||
      contact.email?.toLowerCase().includes(search) ||
      contact.motivo?.toLowerCase().includes(search)
    );
  });

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-nexa-bold text-gray-900">
          Consultas de Contacto
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona las consultas recibidas desde el formulario de contacto
        </p>
      </div>

      {/* Stats */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`p-4 rounded-lg border transition-all ${
              filtroEstado === 'todos'
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-nexa-bold">{counts.total}</p>
            <p className="text-sm">Total</p>
          </button>

          {Object.entries(estadoConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFiltroEstado(key)}
              className={`p-4 rounded-lg border transition-all ${
                filtroEstado === key
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="text-2xl font-nexa-bold">{counts[key] || 0}</p>
              <p className="text-sm">{config.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        <div className="flex gap-6">
          {/* Lista de consultas */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-500">Cargando consultas...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <EnvelopeIcon className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="mt-4 text-gray-500">No hay consultas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    onClick={() => {
                      setSelectedContact(contact);
                      if (contact.estado === 'pendiente') {
                        updateEstado(contact._id, 'leido');
                      }
                    }}
                    className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedContact?._id === contact._id
                        ? 'border-black shadow-md'
                        : 'border-gray-200'
                    } ${
                      contact.estado === 'pendiente'
                        ? 'border-l-4 border-l-yellow-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {contact.nombreApellido}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              estadoConfig[contact.estado]?.color
                            }`}
                          >
                            {estadoConfig[contact.estado]?.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {contact.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {contact.motivo} · {formatDate(contact.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalle de consulta */}
          {selectedContact && (
            <div className="w-96 bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-6">
              {/* Header del detalle */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-nexa-bold text-gray-900">
                    {selectedContact.nombreApellido}
                  </h2>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                      estadoConfig[selectedContact.estado]?.color
                    }`}
                  >
                    {estadoConfig[selectedContact.estado]?.label}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Motivo */}
              <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4">
                <p className="text-sm font-medium text-gray-900">
                  {selectedContact.motivo}
                </p>
              </div>

              {/* Info de contacto */}
              <div className="space-y-3 mb-6">
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-black"
                >
                  <EnvelopeIcon className="h-4 w-4" />
                  {selectedContact.email}
                </a>
                <a
                  href={`tel:${selectedContact.telefono}`}
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-black"
                >
                  <PhoneIcon className="h-4 w-4" />
                  {selectedContact.telefono}
                </a>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4" />
                  {selectedContact.localidad}, {selectedContact.pais}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <ClockIcon className="h-4 w-4" />
                  {formatDate(selectedContact.createdAt)}
                </div>
              </div>

              {/* Comentarios */}
              {selectedContact.comentarios && (
                <div className="mb-6">
                  <p className="text-xs uppercase text-gray-500 mb-2">
                    Comentarios
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedContact.comentarios}
                    </p>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs uppercase text-gray-500 mb-3">
                  Cambiar estado
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateEstado(selectedContact._id, 'leido')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      selectedContact.estado === 'leido'
                        ? 'bg-blue-100 border-blue-200 text-blue-800'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <EyeIcon className="h-3.5 w-3.5" />
                    Leído
                  </button>
                  <button
                    onClick={() =>
                      updateEstado(selectedContact._id, 'respondido')
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      selectedContact.estado === 'respondido'
                        ? 'bg-green-100 border-green-200 text-green-800'
                        : 'border-gray-200 hover:border-green-200 hover:bg-green-50'
                    }`}
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    Respondido
                  </button>
                  <button
                    onClick={() =>
                      updateEstado(selectedContact._id, 'archivado')
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      selectedContact.estado === 'archivado'
                        ? 'bg-gray-200 border-gray-300 text-gray-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <ArchiveBoxIcon className="h-3.5 w-3.5" />
                    Archivar
                  </button>
                </div>

                {/* Botón eliminar */}
                <button
                  onClick={() => deleteContact(selectedContact._id)}
                  className="flex items-center gap-1.5 mt-4 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Eliminar consulta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
