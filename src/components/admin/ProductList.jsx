'use client';

export default function ProductList({
  products,
  onEdit,
  onDelete,
  deleteLoading,
}) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-lg">No hay productos disponibles</p>
        <p className="text-gray-400 text-sm mt-2">
          Crea tu primer producto para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product._id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
        >
          {/* Imagen */}
          <div className="relative h-64 bg-gray-200">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Sin imagen
              </div>
            )}
            {product.featured && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                ⭐ Destacado
              </div>
            )}
            {product.offerPrice && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                OFERTA
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 truncate">{product.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>

            {/* Categoría */}
            <div className="mb-3">
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                {product.category}
              </span>
            </div>

            {/* Precios */}
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Costo:</span>
                <span className="text-sm font-medium">
                  ${product.costPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Venta:</span>
                <span className="text-lg font-bold">
                  ${product.salePrice.toFixed(2)}
                </span>
                {product.offerPrice && (
                  <span className="text-sm text-red-500 font-bold">
                    ${product.offerPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="mb-3 text-sm">
              <span className="text-gray-500">Stock: </span>
              <span
                className={`font-medium ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {product.stock} unidades
              </span>
            </div>

            {/* Talles */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-3">
                <span className="text-xs text-gray-500 mb-1 block">
                  Talles:
                </span>
                <div className="flex gap-1 flex-wrap">
                  {product.sizes.map((size) => (
                    <span
                      key={size}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Colores */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-3">
                <span className="text-xs text-gray-500 mb-1 block">
                  Colores:
                </span>
                <div className="flex gap-2">
                  {product.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color.hexCode }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <button
                onClick={() => onEdit(product)}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(product._id)}
                disabled={deleteLoading}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
