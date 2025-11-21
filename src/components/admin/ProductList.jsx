'use client';

import { PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

/**
 * ProductList - Estilo Premium Minimalista
 * Grid de productos con diseño elegante tipo catálogo de moda
 */
export default function ProductList({
  products,
  onEdit,
  onDelete,
  deleteLoading,
}) {
  if (!products || products.length === 0) {
    return (
      <div className="border border-gray-200 bg-white p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 border border-gray-200 flex items-center justify-center">
          <span className="text-2xl text-gray-300">+</span>
        </div>
        <p className="text-gray-600 mb-1">Sin productos</p>
        <p className="text-sm text-gray-400">
          Comenzá agregando tu primer producto
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-gray-200">
      {products.map((product) => (
        <div key={product._id} className="bg-white group">
          {/* Imagen */}
          <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].url}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-300 text-sm">Sin imagen</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.featured && (
                <span className="bg-gray-900 text-white px-2 py-1 text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <StarSolid className="h-3 w-3" />
                  Destacado
                </span>
              )}
              {product.offerPrice && (
                <span className="bg-white text-gray-900 px-2 py-1 text-[10px] uppercase tracking-wider border border-gray-900">
                  Oferta
                </span>
              )}
              {product.stock === 0 && (
                <span className="bg-gray-100 text-gray-500 px-2 py-1 text-[10px] uppercase tracking-wider">
                  Sin stock
                </span>
              )}
            </div>

            {/* Actions overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => onEdit(product)}
                className="bg-white text-gray-900 p-3 hover:bg-gray-100 transition-colors"
                title="Editar"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(product._id)}
                disabled={deleteLoading}
                className="bg-white text-gray-900 p-3 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Eliminar"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            {/* Categoría */}
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
              {product.category}
            </p>

            {/* Título */}
            <h3 className="text-sm font-medium text-gray-900 mb-3 line-clamp-1">
              {product.title}
            </h3>

            {/* Precios */}
            <div className="flex items-baseline gap-2 mb-3">
              {product.offerPrice ? (
                <>
                  <span className="text-lg font-light text-gray-900">
                    ${product.offerPrice.toLocaleString('es-AR')}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ${product.salePrice.toLocaleString('es-AR')}
                  </span>
                </>
              ) : (
                <span className="text-lg font-light text-gray-900">
                  ${product.salePrice.toLocaleString('es-AR')}
                </span>
              )}
            </div>

            {/* Meta info */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Costo: ${product.costPrice.toLocaleString('es-AR')}
              </span>
              <span
                className={`text-xs ${
                  product.stock > 0 ? 'text-gray-600' : 'text-red-500'
                }`}
              >
                {product.stock} unidades
              </span>
            </div>

            {/* Variantes */}
            {(product.sizes?.length > 0 || product.colors?.length > 0) && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                {/* Talles */}
                {product.sizes?.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {product.sizes.slice(0, 5).map((size) => (
                      <span
                        key={size}
                        className="text-[10px] text-gray-500 border border-gray-200 px-1.5 py-0.5"
                      >
                        {size}
                      </span>
                    ))}
                    {product.sizes.length > 5 && (
                      <span className="text-[10px] text-gray-400">
                        +{product.sizes.length - 5}
                      </span>
                    )}
                  </div>
                )}

                {/* Colores */}
                {product.colors?.length > 0 && (
                  <div className="flex items-center gap-1">
                    {product.colors.slice(0, 5).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 border border-gray-200"
                        style={{ backgroundColor: color.hexCode }}
                        title={color.name}
                      />
                    ))}
                    {product.colors.length > 5 && (
                      <span className="text-[10px] text-gray-400 ml-1">
                        +{product.colors.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
