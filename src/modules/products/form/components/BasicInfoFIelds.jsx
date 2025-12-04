import FormInputOptions from '../FormInputOptions';

/**
 * Componente para campos básicos de información del producto
 * @param {Object} props
 * @param {Object} props.register - Función register de react-hook-form
 * @param {Object} props.validationErrors - Errores de validación
 * @returns {JSX.Element}
 */
const BasicInfoFields = ({ register, validationErrors }) => {
  return (
    <div className="space-y-6">
      {/* Nombre del producto */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nombre del Producto <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            validationErrors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ej: Camisa Slim Fit Oxford, Remera Básica..."
          {...register('title')}
        />
        {validationErrors.title && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Descripción
        </label>
        <textarea
          id="description"
          rows="4"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
          placeholder="Descripción detallada del producto..."
          {...register('description')}
        />
      </div>

      {/* Categoría */}
      <FormInputOptions
        id="category"
        name="Categoría"
        inputError={validationErrors.category}
        register={register}
        options={[
          { value: 'camisas', name: 'Camisas' },
          { value: 'remeras', name: 'Remeras' },
          { value: 'musculosas', name: 'Musculosas' },
          { value: 'conjuntos', name: 'Conjuntos' },
          { value: 'shorts', name: 'Shorts' },
        ]}
      />

      {/* Precio de venta y Precio promocional - JUNTOS */}
      <div className="grid grid-cols-2 gap-4">
        {/* Precio de venta */}
        <div>
          <label
            htmlFor="salePrice"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Precio de venta (ARS) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              $
            </span>
            <input
              id="salePrice"
              type="number"
              step="0.01"
              min="0"
              className={`w-full pl-7 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                validationErrors.salePrice
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              {...register('salePrice')}
            />
          </div>
          {validationErrors.salePrice && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.salePrice}
            </p>
          )}
        </div>

        {/* Precio promocional */}
        <div>
          <label
            htmlFor="promoPrice"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Precio promocional (ARS)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              $
            </span>
            <input
              id="promoPrice"
              type="number"
              step="0.01"
              min="0"
              className={`w-full pl-7 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                validationErrors.promoPrice
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder="Opcional"
              {...register('promoPrice')}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Dejar vacío si no aplica</p>
          {validationErrors.promoPrice && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.promoPrice}
            </p>
          )}
        </div>
      </div>

      {/* Stock total */}
      <div>
        <label
          htmlFor="stock"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Stock total
        </label>
        <input
          type="number"
          id="stock"
          min="0"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            validationErrors.stock ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Se calcula auto si hay variantes"
          {...register('stock')}
        />
        {validationErrors.stock && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.stock}</p>
        )}
      </div>

      {/* Temporada */}
      <div>
        <label
          htmlFor="season"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Temporada
        </label>
        <select
          id="season"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
          {...register('season')}
        >
          <option value="todo-el-año">Todo el año</option>
          <option value="primavera-verano">Primavera-Verano</option>
          <option value="otoño-invierno">Otoño-Invierno</option>
        </select>
      </div>
    </div>
  );
};

export default BasicInfoFields;
