// app/admin/products/add/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProductWizard from '@/components/admin/products/ProductWizard';

export default function AddProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirección de autenticación
  useEffect(() => {
    if (
      status === 'unauthenticated' ||
      (status === 'authenticated' && session?.user?.role !== 'admin')
    ) {
      router.push('/auth/signin?callbackUrl=/admin');
    }
  }, [status, session, router]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderTopColor: '#000000', borderBottomColor: '#000000' }}
        ></div>
      </div>
    );
  }

  // Si no está autenticado o no es admin, no mostrar nada
  if (
    status === 'unauthenticated' ||
    (status === 'authenticated' && session?.user?.role !== 'admin')
  ) {
    return null;
  }

  // Usar el ProductWizard nuevo
  return <ProductWizard />;
}
