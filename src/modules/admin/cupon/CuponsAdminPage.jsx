'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import CouponCard from './components/CouponCard';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default function CouponsAdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  // Verificar autenticación y rol de admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      toast.error('No tenés permisos para acceder a esta página');
      router.push('/');
    }
  }, [status, session, router]);

  // Cargar cupones
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchCoupons();
    }
  }, [status, session, statusFilter, sortBy]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        sortBy: sortBy,
        order: 'desc',
      });

      const response = await fetch(`/api/coupons?${params}`);

      if (!response.ok) {
        throw new Error('Error al cargar cupones');
      }

      const data = await response.json();
      setCoupons(data.coupons);
      setStats(data.stats);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los cupones');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar cupones por búsqueda
  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 mt-[80px]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-nexa-bold">Gestión de Cupones</h1>
              <p className="text-gray-600 mt-2">
                Administrá los códigos de descuento de HAIZE
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/coupons/new')}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Crear Cupón
            </button>
          </div>

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.inactive}
                </p>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Expirados</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.expired}
                </p>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Usado</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalUsed}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white border border-gray-200 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
              />
            </div>

            {/* Filtro por estado */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-black appearance-none"
              >
                <option value="all">Todos los cupones</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="expired">Expirados</option>
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black appearance-none"
              >
                <option value="createdAt">Más recientes</option>
                <option value="code">Código (A-Z)</option>
                <option value="usedCount">Más usados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de cupones */}
        {filteredCoupons.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? 'No se encontraron cupones con ese criterio'
                : 'No hay cupones creados todavía'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/admin/coupons/new')}
                className="mt-4 px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Crear primer cupón
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                onUpdate={fetchCoupons}
                onDelete={(id) =>
                  setCoupons(coupons.filter((c) => c._id !== id))
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
