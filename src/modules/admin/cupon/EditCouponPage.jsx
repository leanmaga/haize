'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import CouponForm from './components/CouponForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function EditCouponPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponId, setCouponId] = useState(null);

  // Obtener el ID del cupón de los params (Next.js 15)
  useEffect(() => {
    params.then((resolvedParams) => {
      setCouponId(resolvedParams.id);
    });
  }, [params]);

  // Verificar autenticación
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      toast.error('No tenés permisos para acceder a esta página');
      router.push('/');
    }
  }, [status, session, router]);

  // Cargar datos del cupón
  useEffect(() => {
    if (
      status === 'authenticated' &&
      session?.user?.role === 'admin' &&
      couponId
    ) {
      fetchCoupon();
    }
  }, [status, session, couponId]);

  const fetchCoupon = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coupons/${couponId}`);

      if (!response.ok) {
        throw new Error('Cupón no encontrado');
      }

      const data = await response.json();
      setCoupon(data.coupon);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar el cupón');
      router.push('/admin/coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push('/admin/coupons');
  };

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

  if (!coupon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cupón no encontrado</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 mt-[80px]">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Volver
          </button>
          <h1 className="text-3xl font-nexa-bold">Editar Cupón</h1>
          <p className="text-gray-600 mt-2">
            Código: <span className="font-semibold">{coupon.code}</span>
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <CouponForm coupon={coupon} onSuccess={handleSuccess} />
        </div>

        {/* Estadísticas de uso */}
        {coupon.usedCount > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold mb-2">📊 Estadísticas de Uso</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total de usos</p>
                <p className="text-xl font-bold">{coupon.usedCount}</p>
              </div>
              {coupon.usageLimit && (
                <div>
                  <p className="text-gray-600">Límite de usos</p>
                  <p className="text-xl font-bold">{coupon.usageLimit}</p>
                </div>
              )}
            </div>

            {coupon.usedBy && coupon.usedBy.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Últimos usos:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {coupon.usedBy
                    .slice(-5)
                    .reverse()
                    .map((use, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded border border-gray-200 text-xs"
                      >
                        <p>
                          Fecha:{' '}
                          {new Date(use.usedAt).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p>
                          Descuento aplicado: $
                          {use.discountApplied.toLocaleString('es-AR')}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advertencia si el cupón fue usado */}
        {coupon.usedCount > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Nota:</strong> Este cupón ya ha sido usado{' '}
              {coupon.usedCount} {coupon.usedCount === 1 ? 'vez' : 'veces'}. No
              podrás eliminarlo, pero podés desactivarlo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
