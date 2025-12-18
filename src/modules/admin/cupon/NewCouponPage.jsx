'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import CouponForm from './components/CouponForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NewCouponPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      toast.error('No tenés permisos para acceder a esta página');
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
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
          <h1 className="text-3xl font-nexa-bold">Crear Nuevo Cupón</h1>
          <p className="text-gray-600 mt-2">
            Completá el formulario para crear un nuevo código de descuento
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <CouponForm />
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">
            💡 Consejos para crear cupones:
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>
              • Usá códigos cortos y fáciles de recordar (ej: VERANO2024,
              ENVIOGRATIS)
            </li>
            <li>
              • Para cupones de un solo uso, cada usuario podrá usarlo una sola
              vez
            </li>
            <li>
              • Los cupones reutilizables pueden tener un límite global de usos
            </li>
            <li>
              • Establecé un monto mínimo si querés que se aplique solo a
              compras grandes
            </li>
            <li>
              • Podés desactivar un cupón manualmente en cualquier momento
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
