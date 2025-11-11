// app/products/[id]/ProductDetails.jsx (or wherever this component is)
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/data';
import AddToCartButton from '@/components/product/AddToCartButton';
import ProductReviews from '@/components/ProductReviews';
import StarRating from '@/components/ui/StarRating';
import RelatedProducts from '@/components/product/RelatedProducts';
import ProductImageSlider from '@/components/product/ProductImageSlider';

export default async function ProductDetails({ params }) {
  // Extract id from params
  const { id } = params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Determinar el precio a mostrar (precio regular y promocional si existe)
  const regularPrice =
    product.salePrice !== undefined
      ? product.salePrice
      : product.price !== undefined
      ? product.price
      : 0;

  const hasPromotion = product.promoPrice && product.promoPrice > 0;
  const displayPrice = hasPromotion ? product.promoPrice : regularPrice;

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-500 flex items-center space-x-2">
        <Link href="/" className="hover:text-[#D4A63A] transition-colors">
          Inicio
        </Link>
        <span>/</span>
        <Link
          href="/products"
          className="hover:text-[#D4A63A] transition-colors"
        >
          Productos
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category}`}
          className="hover:text-[#D4A63A] transition-colors"
        >
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="md:flex">
          {/* Imagen del producto - 50% en desktop */}
          <div className="md:w-1/2 p-6">
            <ProductImageSlider images={productImages} product={product} />
          </div>

          {/* Detalles del producto - 50% en desktop */}
          <div className="md:w-1/2 p-8 flex flex-col">
            {/* Categoría */}
            <div className="mb-2">
              <Link
                href={`/products?category=${product.category}`}
                className="text-sm font-medium text-[#F6C343] hover:text-[#D4A63A] transition-colors"
              >
                {product.category.charAt(0).toUpperCase() +
                  product.category.slice(1)}
              </Link>
            </div>

            {/* Título del producto */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 uppercase">
              {product.title}
            </h1>

            {/* Rating y Reviews */}
            <div className="flex items-center gap-4 mb-6">
              <StarRating rating={product.rating || 0} size="md" />
              <span className="text-gray-600">
                {product.numReviews || 0}{' '}
                {(product.numReviews || 0) === 1 ? 'reseña' : 'reseñas'}
              </span>
            </div>

            {/* Precio */}
            <div className="mb-8">
              {hasPromotion ? (
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-black">
                    ${displayPrice.toFixed(2)}
                  </p>
                  <p className="ml-3 text-lg text-gray-500 line-through">
                    ${regularPrice.toFixed(2)}
                  </p>
                  <span
                    className="ml-3 px-2 py-1 text-white text-xs font-semibold rounded-md"
                    style={{ backgroundColor: '#F6C343' }}
                  >
                    {Math.round((1 - product.promoPrice / regularPrice) * 100)}%
                    OFF
                  </span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-black">
                  ${displayPrice.toFixed(2)}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="mb-8">
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Stock info */}
            <div className="mb-6 text-sm text-gray-600">
              Stock disponible: {product.stock} unidades
              {product.stock > 5 ? (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Disponible
                </span>
              ) : product.stock > 0 ? (
                <span
                  className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: '#F6C343' }}
                >
                  Quedan pocas unidades
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Agotado
                </span>
              )}
            </div>

            {/* Selector de variantes */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8">
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Peso/Tamaño
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size, idx) => (
                        <button
                          key={idx}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-[#F1ECE8] hover:bg-[#E8DFD6] hover:border-[#D4A63A] hover:text-[#D4A63A] focus:outline-none focus:ring-2 focus:ring-[#F6C343] transition-all duration-200"
                        >
                          {size.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Tipo
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color, idx) => (
                        <button
                          key={idx}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-[#F1ECE8] hover:bg-[#E8DFD6] hover:border-[#D4A63A] hover:text-[#D4A63A] focus:outline-none focus:ring-2 focus:ring-[#F6C343] transition-all duration-200"
                        >
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botón de pedir por WhatsApp */}
            <div className="mb-8">
              <AddToCartButton product={product} />
            </div>

            {/* Especificaciones - Expandible/Colapsable */}
            <div className="mt-2 pt-6 border-t border-gray-200">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                  <span className="text-lg font-semibold text-gray-700">
                    Especificaciones
                  </span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shapeRendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <ul className="text-gray-600 mt-3 group-open:animate-fadeIn space-y-2 pl-4">
                  <li>
                    Categoría:{' '}
                    {product.category.charAt(0).toUpperCase() +
                      product.category.slice(1)}
                  </li>
                  <li>
                    Disponibilidad:{' '}
                    {product.stock > 0 ? 'Disponible' : 'Agotado'}
                  </li>
                  {product.material && <li>Material: {product.material}</li>}
                  {product.brand && <li>Marca: {product.brand}</li>}
                  {product.origin && <li>Origen: {product.origin}</li>}
                  {product.composition && product.composition.length > 0 && (
                    <li>Composición: {product.composition.join(', ')}</li>
                  )}
                </ul>
              </details>
            </div>

            {/* Información de entrega */}
            <div className="mt-2 pt-4 border-t border-gray-200">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                  <span className="text-lg font-semibold text-gray-700">
                    Entrega y Zonas
                  </span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shapeRendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <div className="text-gray-600 mt-3 group-open:animate-fadeIn space-y-2">
                  <p>
                    <strong>Tiempo de entrega:</strong> Máximo 24 horas
                  </p>
                  <p>
                    <strong>Zonas de cobertura:</strong> Belgrano, Palermo, Las
                    Cañitas, Colegiales y Núñez
                  </p>
                  <p>
                    <strong>Pedidos:</strong> Por WhatsApp (+54 9 11 2552-8131)
                  </p>
                  <p>
                    <strong>Horarios:</strong> Lunes a Viernes 10:00-20:00,
                    Sábados 10:00-14:00
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      <RelatedProducts />

      {/* Sección de Reviews */}
      <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
        <ProductReviews productId={id} />
      </div>
    </div>
  );
}
