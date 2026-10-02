'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProductWizard from '@/components/admin/products/ProductWizard';

export default function EditProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    if (status === 'unauthenticated' ||
      (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.replace('/auth/signin?callbackUrl=/admin/products');
    }
  }, [status, session, router]);

  if (status === 'loading') return <div className="p-6 text-center">Cargando...</div>;

  if (status !== 'authenticated' || session?.user?.role !== 'admin') return null;

  return id ? <ProductWizard isEdit productId={id} /> : null;
}
