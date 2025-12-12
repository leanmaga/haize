'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminProfile from './AdminProfile';
import UserProfile from './UserProfile';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const router = useRouter();

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Verificar que hay una sesión activa
        if (!session) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/users/profile');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || 'Error al obtener datos del perfil',
          );
        }

        const data = await response.json();

        // Actualizar estados con la información del usuario
        setUserData(data);

        // Manejar órdenes recientes solo para usuarios normales
        if (data.role !== 'admin') {
          if (data.recentOrders) {
            // Si las órdenes ya vienen incluidas en la respuesta de perfil
            setRecentOrders(data.recentOrders);
          } else {
            // Caso de respaldo: hacer una solicitud separada
            try {
              const ordersResponse = await fetch(
                '/api/users/orders?userOnly=true&limit=3',
              );

              if (!ordersResponse.ok) {
                // Si es 404, el endpoint no existe
                if (ordersResponse.status === 404) {
                  console.warn(
                    'Endpoint de órdenes no encontrado, intentando ruta alternativa',
                  );

                  // Intentar con la ruta alternativa
                  const altResponse = await fetch(
                    '/api/profile/orders?limit=3',
                  );
                  if (altResponse.ok) {
                    const altData = await altResponse.json();
                    setRecentOrders(
                      Array.isArray(altData) ? altData.slice(0, 3) : [],
                    );
                  }
                  return;
                }

                // Si es 405, método no permitido
                if (ordersResponse.status === 405) {
                  console.warn('Método no permitido en endpoint de órdenes');
                  return;
                }

                throw new Error(
                  `Error ${ordersResponse.status}: ${ordersResponse.statusText}`,
                );
              }

              const contentType = ordersResponse.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                console.warn('La respuesta no es JSON válido');
                return;
              }

              const ordersData = await ordersResponse.json();

              // Manejo seguro de la estructura de datos
              if (ordersData.success && ordersData.orders) {
                setRecentOrders(ordersData.orders);
              } else if (Array.isArray(ordersData)) {
                setRecentOrders(ordersData.slice(0, 3));
              } else {
                console.warn(
                  'Estructura de datos de órdenes inesperada:',
                  ordersData,
                );
              }
            } catch (orderError) {
              console.error('Error al obtener pedidos recientes:', orderError);
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener datos del perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Callback para actualizar userData cuando se edita el perfil
  const handleUserUpdate = (updatedUser) => {
    setUserData(updatedUser);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="p-8 bg-white rounded-lg shadow-md animate-pulse flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-400 mb-4"></div>
          <p className="text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Si no hay datos de usuario después de cargar
  if (!userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">No se pudo cargar el perfil</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = userData.role === 'admin';

  // Renderizar el componente apropiado según el rol
  return isAdmin ? (
    <AdminProfile userData={userData} onUpdate={handleUserUpdate} />
  ) : (
    <UserProfile
      userData={userData}
      recentOrders={recentOrders}
      onUpdate={handleUserUpdate}
    />
  );
}
