// app/admin/products/edit/[id]/page.js - VERSION DEBUG
'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProductWizard from '@/components/admin/products/ProductWizard';

export default function EditProductPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Unwrap params Promise
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  // 🔍 DEBUG: Log inicial
  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [EDIT PAGE] EditProductPage montada');
    console.log('📋 [EDIT PAGE] Params:', unwrappedParams);
    console.log('🆔 [EDIT PAGE] ID extraído:', id);
    console.log('👤 [EDIT PAGE] Session status:', status);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, []);

  // 🔍 DEBUG: Monitorear cambios en id
  useEffect(() => {
    console.log('🔄 [EDIT PAGE] ID cambió:', id);
  }, [id]);

  // Redirección de autenticación
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('🚫 [EDIT PAGE] Usuario no autenticado, redirigiendo...');
      router.push('/auth/signin?callbackUrl=/admin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      console.log('🚫 [EDIT PAGE] Usuario no es admin, redirigiendo...');
      router.push('/auth/signin?callbackUrl=/admin');
    } else if (status === 'authenticated') {
      console.log('✅ [EDIT PAGE] Usuario autenticado como admin');
    }
  }, [status, session, router]);

  // Loading state
  if (status === 'loading') {
    console.log('⏳ [EDIT PAGE] Cargando sesión...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            style={{ borderTopColor: '#000000', borderBottomColor: '#000000' }}
          ></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no es admin, no mostrar nada
  if (
    status === 'unauthenticated' ||
    (status === 'authenticated' && session?.user?.role !== 'admin')
  ) {
    console.log('🚫 [EDIT PAGE] Acceso denegado, rendering null');
    return null;
  }

  // 🔍 DEBUG: Verificar que tenemos ID antes de renderizar wizard
  if (!id) {
    console.error('❌ [EDIT PAGE] NO HAY ID - ESTO ES UN PROBLEMA');
    console.error('   Params:', unwrappedParams);
    console.error('   ID:', id);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Error</div>
          <p className="text-gray-600">No se pudo obtener el ID del producto</p>
          <button
            onClick={() => router.push('/admin/products')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  // Render del wizard
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ [EDIT PAGE] Renderizando ProductWizard');
  console.log('📤 [EDIT PAGE] Props a enviar:', {
    isEdit: true,
    productId: id,
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return <ProductWizard isEdit={true} productId={id} />;
}
