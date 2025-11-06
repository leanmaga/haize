'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  InboxIcon,
  FunnelIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const MessagesPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados principales
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, answered: 0 });
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  // Redirección si no está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/messages');
    }
  }, [status, router]);

  // Cargar mensajes
  useEffect(() => {
    if (session?.user) {
      fetchMessages();
    }
  }, [session, filter, currentPage]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      const response = await fetch(`/api/users/messages?${params}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        setStats(data.stats);
        setTotalPages(data.pagination.total);
      } else {
        setError('Error al cargar los mensajes');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Error de conexión al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar mensajes por estado
  const filteredMessages = messages.filter((message) => {
    if (filter === 'pending') {
      return !message.response || message.response.trim() === '';
    } else if (filter === 'answered') {
      return message.response && message.response.trim() !== '';
    }
    return true; // "all"
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus mensajes...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Volver a la tienda</span>
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-yellow-500" />
              <h1 className="text-xl font-semibold text-gray-800">
                Mis Mensajes
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-800">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Preguntas realizadas</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Esperando respuesta</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Respondidas</p>
                <p className="text-3xl font-bold" style={{ color: '#F1ECE8' }}>
                  {stats.answered}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#F1ECE8' }}
              >
                <CheckCircleIcon
                  className="h-6 w-6"
                  style={{ color: '#5A5A5A' }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Ya respondidas</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Filtrar:
              </span>

              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'Todas', count: stats.total },
                  { key: 'pending', label: 'Pendientes', count: stats.pending },
                  {
                    key: 'answered',
                    label: 'Respondidas',
                    count: stats.answered,
                  },
                ].map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => {
                      setFilter(filterOption.key);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      filter === filterOption.key
                        ? 'text-gray-800 border border-yellow-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                    }`}
                    style={
                      filter === filterOption.key
                        ? { backgroundColor: '#FAC348' }
                        : {}
                    }
                  >
                    {filterOption.label} ({filterOption.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchMessages}
                className="text-red-700 hover:text-red-900 font-medium underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Mensajes */}
        <div className="space-y-4">
          {filteredMessages.length > 0 ? (
            <>
              {filteredMessages.map((message) => (
                <div
                  key={message._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Header del mensaje */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Imagen del producto */}
                        <div className="w-16 h-16 relative flex-shrink-0">
                          <Image
                            src={
                              message.product?.imageUrl || '/placeholder.jpg'
                            }
                            alt={message.product?.title || 'Producto'}
                            fill
                            sizes="64px"
                            className="object-cover rounded-lg"
                          />
                        </div>

                        {/* Info del producto */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-800 mb-1">
                            {message.product?.title || 'Producto eliminado'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Preguntado el {formatDate(message.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Estado */}
                      <div className="flex-shrink-0">
                        {message.response ? (
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-gray-700"
                            style={{ backgroundColor: '#F1ECE8' }}
                          >
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Respondida
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contenido del mensaje */}
                  <div className="px-6 py-4">
                    {/* Tu pregunta */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Tu pregunta:
                      </h4>
                      <div
                        className="border-l-4 p-3 rounded-r-lg"
                        style={{
                          backgroundColor: '#FEF3E2',
                          borderLeftColor: '#FAC348',
                        }}
                      >
                        <p className="text-gray-800">{message.comment}</p>
                      </div>
                    </div>

                    {/* Respuesta */}
                    {message.response ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Respuesta del vendedor:
                        </h4>
                        <div
                          className="border-l-4 p-3 rounded-r-lg"
                          style={{
                            backgroundColor: '#F9F7F4',
                            borderLeftColor: '#F1ECE8',
                          }}
                        >
                          <p className="text-gray-800 mb-2">
                            {message.response}
                          </p>
                          <p className="text-xs text-gray-500">
                            Respondido el {formatDate(message.responseDate)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 font-medium">
                          Esperando respuesta del vendedor
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Te notificaremos cuando tengamos una respuesta
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer con acciones */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>👍 {message.helpful || 0} útiles</span>
                        <span>ID: {message._id.slice(-6)}</span>
                      </div>

                      <Link
                        href={`/products/${message.product?._id}#reviews-section`}
                        className="text-yellow-600 hover:text-yellow-700 text-sm font-medium transition-colors"
                      >
                        Ver producto →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span>Anterior</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          currentPage === i + 1
                            ? 'text-gray-800'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                        style={
                          currentPage === i + 1
                            ? { backgroundColor: '#FAC348' }
                            : {}
                        }
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Siguiente</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <InboxIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {filter === 'pending'
                  ? 'No tienes preguntas pendientes'
                  : filter === 'answered'
                  ? 'No tienes preguntas respondidas'
                  : 'No has hecho preguntas aún'}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? 'Cuando hagas preguntas sobre productos, aparecerán aquí junto con las respuestas del vendedor.'
                  : 'Cambia el filtro para ver otras preguntas.'}
              </p>

              {filter === 'all' && (
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#FAC348' }}
                >
                  Explorar productos
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Info adicional */}
        <div
          className="mt-8 border rounded-lg p-4"
          style={{ backgroundColor: '#FEF3E2', borderColor: '#FAC348' }}
        >
          <div className="flex items-start space-x-3">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">💡 ¿Cómo funciona?</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Haz preguntas sobre cualquier producto en su página</li>
                <li>El vendedor responderá directamente a tu pregunta</li>
                <li>Recibirás una notificación cuando haya una respuesta</li>
                <li>Todas tus conversaciones se guardan aquí</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
