// app/products/[id]/ProductDetails.jsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/data';
import ProductReviews from '@/components/ProductReviews';
import StarRating from '@/components/ui/StarRating';
import RelatedProducts from '@/components/product/RelatedProducts';
import ProductImageSlider from '@/components/product/ProductImageSlider';
import VariantSelector from '@/components/product/VariantSelector';
import SameDayShipping from './components/SameDayShipping';
import SizeGuideTable from '@/components/product/SizeGuideTable';

export async function generateMetadata({ params }) {
  const { id } = params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const url = `${baseUrl}/products/${id}`;
  const product = await getProductById(id);

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      url,
      images: [{ url: product.imageUrl }],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: [product.imageUrl],
    },
  };
}

export default async function ProductDetails({ params }) {
  // Extract id from params
  const { id } = params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // ============================================
  // LÓGICA DE PRECIOS SIMPLIFICADA
  // ============================================

  // Precio de venta normal (siempre debe existir)
  const normalPrice = product.salePrice || 0;

  // Precio promocional (puede ser 0 o null)
  const promotionalPrice = product.promoPrice || 0;

  // Hay descuento solo si promoPrice existe, es mayor a 0 Y menor al precio normal
  const hasDiscount = promotionalPrice > 0 && promotionalPrice < normalPrice;

  // El precio a mostrar es el promocional si hay descuento, sino el normal
  const displayPrice = hasDiscount ? promotionalPrice : normalPrice;

  // Calcular porcentaje de descuento
  const discountPercentage = hasDiscount
    ? Math.round(((normalPrice - promotionalPrice) / normalPrice) * 100)
    : 0;

  // Process images for slider
  let productImages = [];

  // Add main image if it exists
  if (product.imageUrl) {
    productImages.push(product.imageUrl);
  }

  // Add additional images if they exist
  if (product.additionalImages && Array.isArray(product.additionalImages)) {
    product.additionalImages.forEach((img) => {
      if (img && img.imageUrl) {
        productImages.push(img.imageUrl);
      }
    });
  }
  // En ProductDetails.jsx, después de obtener el product
  console.log('📦 PRODUCT DATA:', {
    id: product._id,
    title: product.title,
    hasVariants: !!product.variants,
    variants: product.variants,
    hasSizes: !!product.sizes,
    sizes: product.sizes,
    hasColors: !!product.colors,
    colors: product.colors,
    stock: product.stock,
  });
  return (
    <div className="container mx-auto px-4 py-6 max-w-[1400px] mt-[80px]">
      {/* Breadcrumb - Alineado a la derecha como en la imagen */}
      <div className="mb-4 text-xs text-gray-600 text-right uppercase tracking-wide">
        <Link href="/" className="hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:underline">
          Productos
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/products?category=${product.category}`}
          className="hover:underline"
        >
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </Link>
        {product.sku && (
          <span className="ml-10 text-gray-400">{product.sku}</span>
        )}
      </div>

      {/* Layout Principal - Grid 50/50 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Columna Izquierda - Imagen (Sticky) */}
        <div className="relative lg:sticky lg:top-6 lg:h-fit">
          <ProductImageSlider images={productImages} product={product} />
        </div>

        {/* Columna Derecha - Detalles CENTRADO CON MAX 500PX */}
        <div className="flex flex-col pt-2 mx-auto w-full max-w-[500px]">
          {/* Badge Nuevo y Botón Favorito (desactivado temporalmente) en la misma línea */}
          <div className="flex items-center justify-between mb-4">
            {/* Badge Nuevo (si el producto es destacado) */}
            {product.featured && (
              <div className="inline-block bg-black text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                NUEVO!
              </div>
            )}

            {/* Botón Favorito */}
            {/* 
              <button
                className="w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Agregar a favoritos"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  ></path>
                </svg>
              </button>
            */}
          </div>

          {/* Título del producto */}
          <h1 className="text-3xl lg:text-4xl font-nexa-bold text-gray-900 mb-4 uppercase tracking-wide">
            {product.title}
          </h1>

          {/* Rating y Reviews */}
          <div className="flex items-center gap-4 mb-6">
            <StarRating rating={product.rating || 0} size="md" />
            <span className="text-sm text-gray-600">
              {product.numReviews || 0}{' '}
              {(product.numReviews || 0) === 1 ? 'reseña' : 'reseñas'}
            </span>
          </div>

          {/* ============================================ */}
          {/* SECCIÓN DE PRECIO - NUEVA LÓGICA */}
          {/* ============================================ */}
          {displayPrice > 0 && (
            <div className="mb-6">
              {/* Precio principal */}
              <div className="text-4xl font-nexa-bold text-gray-900 mb-2">
                ${displayPrice.toFixed(2)}
              </div>

              {/* Información de cuotas */}
              {/* <div className="text-sm text-gray-600">
                6 cuotas sin interés de{' '}
                <strong className="text-gray-900">
                  ${(displayPrice / 6).toFixed(2)}*
                </strong>
              </div> */}

              {/* Precio sin impuestos (mockeado - 19% de impuestos) */}
              {/* <div className="text-xs text-gray-500 mt-1">
                Precio sin impuestos nacionales{' '}
                <strong>${(displayPrice * 0.81).toFixed(2)}</strong>
              </div> */}

              {/* SOLO SI HAY DESCUENTO: mostrar precio original tachado y badge */}
              {hasDiscount && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-lg text-gray-500 line-through">
                    ${normalPrice.toFixed(2)}
                  </span>
                  <span className="bg-red-500 text-white px-2 py-1 text-xs font-nexa-bold rounded">
                    {discountPercentage}% OFF
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Descripción */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock info */}
          <div className="mb-6">
            {product.stock > 5 ? (
              <div className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-green-100 text-green-700">
                ✓ En stock - {product.stock} unidades disponibles
              </div>
            ) : product.stock > 0 ? (
              <div className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700">
                ⚠ Quedan pocas unidades - {product.stock} disponibles
              </div>
            ) : (
              <div className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-red-100 text-red-700">
                ✕ Agotado
              </div>
            )}
          </div>

          {/* SELECTOR DE VARIANTES - NUEVO COMPONENTE */}
          <VariantSelector product={product} />

          {/* Secciones Expandibles con nuevo diseño */}
          <div className="space-y-0 border-t border-gray-200 mt-4">
            {/* Guía de Talles */}
            <details className="group border-b border-gray-200">
              <summary className="py-5 flex justify-between items-center cursor-pointer hover:opacity-70 transition-opacity list-none">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Guía de Talles</span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </summary>
              <div className="pb-5">
                <SizeGuideTable category={product.category} />
              </div>
            </details>

            {/* Especificaciones */}
            <details className="group border-b border-gray-200">
              <summary className="py-5 flex justify-between items-center cursor-pointer hover:opacity-70 transition-opacity list-none">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">
                    Descripción y cuidados
                  </span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </summary>
              <div className="pb-5 text-sm text-gray-600 leading-relaxed">
                <ul className="space-y-2 pl-4">
                  <li>
                    Categoría:{' '}
                    {product.category.charAt(0).toUpperCase() +
                      product.category.slice(1)}
                  </li>
                  {product.material && <li>Material: {product.material}</li>}
                  {product.brand && <li>Marca: {product.brand}</li>}
                  {product.origin && <li>Origen: {product.origin}</li>}
                  {product.composition && product.composition.length > 0 && (
                    <li>Composición: {product.composition.join(', ')}</li>
                  )}
                </ul>
                <p className="text-xs text-gray-500 mt-4">
                  <strong>Cuidados:</strong> Lavar a mano o en ciclo delicado
                  con agua fría. No usar blanqueador. Planchar a temperatura
                  baja.
                </p>
              </div>
            </details>

            {/* Formas de Pago */}
            <details className="group border-b border-gray-200">
              <summary className="py-5 flex justify-between items-center cursor-pointer hover:opacity-70 transition-opacity list-none">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">
                    Formas de pago, promociones y reintegros
                  </span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </summary>
              <div className="pb-5 text-sm text-gray-600 leading-relaxed space-y-2">
                <p>
                  <strong>Tarjetas de crédito:</strong> Todas las tarjetas
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Promociones bancarias vigentes. Consultá por beneficios
                  exclusivos con tu banco.
                </p>
              </div>
            </details>

            {/* Información de entrega */}
            <details className="group border-b border-gray-200">
              <summary className="py-5 flex justify-between items-center cursor-pointer hover:opacity-70 transition-opacity list-none">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">Entrega y Zonas</span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </summary>
              <div className="pb-5 text-sm text-gray-600 leading-relaxed space-y-2">
                <p>
                  <strong>Tiempo de entrega:</strong> Máximo 24 horas en CABA
                </p>
                <p>
                  <strong>Zonas de cobertura:</strong> Envios a todo el país.
                </p>
              </div>
            </details>

            {/* Cambios y Devoluciones */}
            <details className="group border-b border-gray-200">
              <summary className="py-5 flex justify-between items-center cursor-pointer hover:opacity-70 transition-opacity list-none">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">
                    Cambios y devoluciones
                  </span>
                </div>
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </summary>
              <div className="pb-5 text-sm text-gray-600 leading-relaxed">
                <p className="mb-3">
                  Tenés <strong>30 días</strong> para realizar cambios o
                  devoluciones desde la fecha de recepción del producto.
                </p>
                <p className="mb-2">
                  <strong>Condiciones:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    El producto debe estar sin uso, con todas sus etiquetas
                    originales
                  </li>
                  <li>Incluir la factura de compra</li>
                  <li>El empaque debe estar en perfectas condiciones</li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  <strong>Cambios gratuitos:</strong> Primer cambio sin cargo
                  <br />
                  <strong>Devoluciones:</strong> Reintegro del 100% del valor
                  pagado
                </p>
              </div>
            </details>
          </div>

          {/* Información de Envío Same Day */}
          <SameDayShipping />
        </div>
      </div>

      {/* Productos relacionados */}
      <div className="mt-16">
        <RelatedProducts />
      </div>

      {/* Sección de Reviews */}
      <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
        <ProductReviews productId={id} />
      </div>
    </div>
  );
}
