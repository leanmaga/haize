const ProductDetailsSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="md:flex">
          {/* Skeleton para la imagen */}
          <div className="md:w-1/2 p-6">
            <div className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="flex mt-4 space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-gray-200 animate-pulse rounded-md"
                ></div>
              ))}
            </div>
          </div>

          {/* Skeleton para el contenido */}
          <div className="md:w-1/2 p-8">
            <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-2 mb-8">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-full mb-8"></div>
            <div className="h-px bg-gray-200 w-full my-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton para productos relacionados */}
      <div className="mt-12">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg h-64 animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Skeleton para reviews */}
      <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-px bg-gray-200 w-full my-4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
