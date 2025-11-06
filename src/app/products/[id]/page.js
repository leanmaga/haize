import { Suspense } from 'react';
import ProductDetails from '@/modules/products/product-details/ProductDetails';
import ProductDetailsSkeleton from '@/products/product-details/ProductSkeleton';

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
  // AWAIT params before accessing its properties
  const resolvedParams = await params;

  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetails id={resolvedParams.id} />
    </Suspense>
  );
}
