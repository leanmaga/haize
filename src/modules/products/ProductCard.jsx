import Image from 'next/image';
import Link from 'next/link';
import { Heart as HeartIcon } from 'lucide-react';

export default function ProductCard({ product }) {
  // ============================================
  // LÓGICA DE PRECIOS (igual que en ProductDetails)
  // ============================================
  const normalPrice = product.salePrice || 0;
  const promotionalPrice = product.promoPrice || 0;
  const hasDiscount = promotionalPrice > 0 && promotionalPrice < normalPrice;
  const displayPrice = hasDiscount ? promotionalPrice : normalPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((normalPrice - promotionalPrice) / normalPrice) * 100)
    : 0;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="w-full max-w-xs flex justify-center items-center flex-wrap bg-zinc-200 rounded-sm overflow-hidden shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.08)] hover:shadow-[0px_4px_8px_0px_rgba(0,_0,_0,_0.2)] transition-all ease-in-out duration-500 cursor-pointer group">
        {/* Imagen del producto */}
        <div className="relative w-full h-[340px]">
          <Image
            src={product.imageUrl || '/assets/placeholder.jpg'}
            alt={product.title}
            fill
            className="object-cover object-center"
          />

          {/* Badge de descuento si hay */}
          {hasDiscount && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded shadow-md">
              {discountPercentage}% OFF
            </div>
          )}

          {/* Badge NUEVO si es destacado */}
          {product.featured && (
            <div className="absolute top-3 left-3 bg-black text-white px-2 py-1 text-xs font-semibold uppercase tracking-wider">
              NUEVO!
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-4 flex justify-start items-start flex-wrap w-full">
          <h2 className="text-sm mb-2 font-sora-regular uppercase text-black line-clamp-2 group-hover:text-gray-700 transition-colors">
            {product.title}
          </h2>

          {/* Precios */}
          <div className="w-full mb-2">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-black">
                ${displayPrice.toFixed(2)}
              </p>
              {hasDiscount && (
                <p className="text-sm text-gray-500 line-through">
                  ${normalPrice.toFixed(2)}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              6 cuotas sin interés de ${(displayPrice / 6).toFixed(2)}
            </p>
          </div>

          {/* Stock info */}
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-xs text-gray-600 font-sora-regular mb-2">
              ⚠ Quedan {product.stock} unidades
            </p>
          )}
          {product.stock === 0 && (
            <p className="text-xs text-red-600 font-sora-regular mb-2">
              ✕ Agotado
            </p>
          )}

          {/* Botón favoritos */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Aquí puedes agregar la lógica de favoritos
              console.log('Agregar a favoritos:', product.id);
            }}
            className="mt-1 flex justify-center items-center uppercase text-black text-xs hover:text-red-600 transition-colors"
          >
            <HeartIcon className="mr-1 inline-block size-4 transition-all ease-in-out duration-200" />
            Agregar a favoritos
          </button>
        </div>
      </div>
    </Link>
  );
}
