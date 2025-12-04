/**
 * Componente para opciones finales del producto (SKU, Featured, IsNew)
 * @param {Object} props
 * @param {Object} props.register - Función register de react-hook-form
 * @returns {JSX.Element}
 */
const ProductOptions = ({ register }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* SKU */}
      <div>
        <label
          htmlFor="sku"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          SKU (Código de producto)
        </label>
        <input
          type="text"
          id="sku"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
          placeholder="Se generará automáticamente si se deja vacío"
          {...register('sku')}
        />
      </div>

      {/* Checkboxes */}
      <div className="flex items-center gap-6">
        {/* Featured */}
        <div className="flex items-center">
          <input
            id="featured"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            {...register('featured')}
          />
          <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
            Producto destacado
          </label>
        </div>

        {/* Is New */}
        <div className="flex items-center">
          <input
            id="isNew"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            {...register('isNew')}
          />
          <label htmlFor="isNew" className="ml-2 text-sm text-gray-700">
            Producto nuevo
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductOptions;
