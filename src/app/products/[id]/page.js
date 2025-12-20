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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const url = `${baseUrl}/products/${resolvedParams.id}`;
  const shareImageUrl = product.imageUrl.replace(
    '/upload/',
    '/upload/c_pad,w_1200,h_630,b_gen_fill:blur,f_jpg/',
  );

  return {
    title: `${product.title} | HAIZE`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      url,
      images: [
        { url: shareImageUrl, width: 1200, height: 630, alt: product.title },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: [shareImageUrl],
    },
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
