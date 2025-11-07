// src/app/admin/settings/page.js
'use client';

import MercadoPagoLinkButton from '@/components/admin/MercadoPagoLinkButton';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Verificar que sea administrador
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin/settings');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Mostrar loading mientras se verifica la sesión
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // No renderizar nada si no es admin
  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Configuración del Sistema</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-medium mb-4">Pagos y Facturación</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <MercadoPagoLinkButton />
          </div>
        </section>
      </div>
    </div>
  );
}
