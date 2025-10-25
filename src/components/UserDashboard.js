'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersRequest } from '@/redux/slices/ordersSlice';
import {
  selectAllOrders,
  selectOrdersLoading,
} from '@/redux/selectors/ordersSelectors';

export default function UserDashboard() {
  const { user } = useUser();
  const dispatch = useDispatch();
  const orders = useSelector(selectAllOrders);
  const loading = useSelector(selectOrdersLoading);

  useEffect(() => {
    if (user) {
      dispatch(fetchOrdersRequest());
    }
  }, [user, dispatch]);

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenido, {user.firstName || user.username}!
          </h1>
          <p className="text-gray-600">{user.emailAddresses[0].emailAddress}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Mis Órdenes</h2>

          {loading ? (
            <p>Cargando órdenes...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-600">No tienes órdenes todavía.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Orden #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${order.total}</p>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
