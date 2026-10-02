'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ProductForm from '@/modules/products/form/ProductForm';

export default function EditProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' ||
      (status === 'authenticated' && session?.user?.role !== 'admin')) {
      router.replace('/auth/signin?callbackUrl=/admin/products');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'admin' || !id) return;
    let cancelled = false;

    const loadProduct = async () => {
      try {
        setError('');
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'No se pudo cargar el producto');
        if (!cancelled) setProduct(data);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || 'No se pudo cargar el producto');
      }
    };

    loadProduct();
    return () => { cancelled = true; };
  }, [id, session?.user?.role, status]);

  if (status === 'loading' || (status === 'authenticated' && !product && !error)) {
    return <div className="p-6 text-center">Cargando producto...</div>;
  }

  if (status !== 'authenticated' || session?.user?.role !== 'admin') return null;

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button type="button" onClick={() => router.push('/admin/products')} className="mt-4 rounded bg-black px-4 py-2 text-white">
          Volver a productos
        </button>
      </div>
    );
  }

  return <ProductForm product={product} />;
}
