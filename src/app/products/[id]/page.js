// app/products/[id]/page.js
import { Suspense } from 'react';
import { getProductById } from '@/lib/data';
import ProductDetails from '@/modules/products/product-details/ProductDetails';
import ProductDetailsSkeleton from '@/modules/products/product-details/ProductSkeleton';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    return {
      title: 'Producto no encontrado | HAIZE',
      description: 'El producto que buscas no está disponible',
    };
  }

  return {
    title: `${product.title} | HAIZE`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  // Await params before accessing its properties
  const resolvedParams = await params;

  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetails params={resolvedParams} />
    </Suspense>
  );
}
