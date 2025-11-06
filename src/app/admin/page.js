"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import PopularProducts from "@/components/admin/PopularProducts";
import StatsCards from "@/components/admin/StatsCards";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState({
    products: [],
    orders: [],
    users: [],
    totalSales: 0,
    pendingOrders: 0,
    recentOrders: [],
  });

  const [isDataLoading, setIsDataLoading] = useState(true);

  // Función para obtener las clases CSS del estado de la orden
  const getOrderStatusStyles = (status) => {
    const statusConfig = {
      pagado: { className: "bg-green-100 text-green-800", style: {} },
      pendiente: {
        className: "text-yellow-800",
        style: { backgroundColor: "rgba(246, 195, 67, 0.1)" },
      },
      enviado: { className: "bg-blue-100 text-blue-800", style: {} },
      entregado: { className: "bg-gray-800 text-white", style: {} },
      default: { className: "bg-red-100 text-red-800", style: {} },
    };

    return statusConfig[status] || statusConfig.default;
  };

  // Función auxiliar para hacer fetch con manejo de errores
  const fetchWithErrorHandling = async (url, defaultValue = []) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Error al cargar ${url}:`, response.status);
        return defaultValue;
      }

      const data = await response.json();

      // Para productos, extraer el array de products
      if (url.includes("/products")) {
        return data.products || defaultValue;
      }

      // Validar que sea un array para otros endpoints
      return Array.isArray(data) ? data : defaultValue;
    } catch (error) {
      console.error(`Error al cargar ${url}:`, error);
      return defaultValue;
    }
  };

  // Función para calcular estadísticas
  const calculateStats = (orders) => {
    const totalSales = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    const pendingOrders = orders.filter(
      (order) => order.status === "pendiente"
    ).length;
    const recentOrders = orders.slice(0, 5);

    return { totalSales, pendingOrders, recentOrders };
  };

  // Función para cargar todos los datos del dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setIsDataLoading(true);

      const [productsData, ordersData, usersData] = await Promise.all([
        fetchWithErrorHandling("/api/products", []),
        fetchWithErrorHandling("/api/orders", []),
        fetchWithErrorHandling("/api/users", []),
      ]);

      const { totalSales, pendingOrders, recentOrders } =
        calculateStats(ordersData);

      setDashboardData({
        products: productsData,
        orders: ordersData,
        users: usersData,
        totalSales,
        pendingOrders,
        recentOrders,
      });
    } catch (error) {
      console.error("Error general al cargar datos del dashboard:", error);
      toast.error("Error al cargar datos del dashboard");
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // Verificar autenticación y rol de administrador
  useEffect(() => {
    const isUnauthenticated = status === "unauthenticated";
    const isNotAdmin =
      status === "authenticated" && session?.user?.role !== "admin";

    if (isUnauthenticated || isNotAdmin) {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  // Cargar datos del dashboard
  useEffect(() => {
    const isAuthenticatedAdmin =
      status === "authenticated" && session?.user?.role === "admin";

    if (isAuthenticatedAdmin) {
      loadDashboardData();
    }
  }, [status, session, loadDashboardData]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success("Sesión cerrada correctamente");
    router.push("/auth/login");
  };

  // Verificar si debe mostrar loading
  const shouldShowAuthLoading = () => {
    return (
      status === "loading" ||
      status === "unauthenticated" ||
      (status === "authenticated" && session?.user?.role !== "admin")
    );
  };

  // Mostrar pantalla de carga mientras se verifican permisos
  if (shouldShowAuthLoading()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderTopColor: "#F6C343", borderBottomColor: "#F6C343" }}
        ></div>
      </div>
    );
  }

  // Mostrar pantalla de carga mientras se cargan los datos
  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderTopColor: "#F6C343", borderBottomColor: "#F6C343" }}
        ></div>
      </div>
    );
  }

  const { products, orders, users, totalSales, pendingOrders, recentOrders } =
    dashboardData;

  return (
    <div className="border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-white transition rounded-md"
          style={{ backgroundColor: "#F6C343" }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#E5B63C";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#F6C343";
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Información del administrador */}
      <div className="bg-white p-4 border border-gray-200 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-2">
          Admin: {session.user.name}
        </h2>
        <p className="text-gray-600">{session.user.email}</p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <StatsCards
        productsCount={products.length || 0}
        ordersCount={orders.length || 0}
        usersCount={users.length || 0}
        totalSales={totalSales}
        pendingOrders={pendingOrders}
      />

      {/* Órdenes Recientes */}
      <div className="bg-white border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pedidos Recientes</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium transition-colors hover:underline"
            style={{ color: "#F6C343" }}
            onMouseEnter={(e) => {
              e.target.style.color = "#E5B63C";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#F6C343";
            }}
          >
            Ver todos
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID Pedido
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cliente
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.shippingInfo?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.shippingInfo?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.totalAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const { className, style } = getOrderStatusStyles(
                          order.status
                        );
                        return (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}
                            style={style}
                          >
                            {order.status
                              ? order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)
                              : "N/A"}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No hay pedidos recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Productos Populares */}
      <PopularProducts products={products} />
    </div>
  );
}
