import ArrayFieldManager from './ArrayFieldManager';

/**
 * Sección colapsable para información adicional del producto
 * @param {Object} props
 * @param {boolean} props.show - Si la sección está expandida
 * @param {Function} props.onToggle - Función para expandir/colapsar
 * @param {Object} props.register - Función register de react-hook-form
 * @param {Array<string>} props.composition - Array de composición
 * @param {Function} props.onCompositionAdd - Función para agregar composición
 * @param {Function} props.onCompositionRemove - Función para eliminar composición
 * @param {Array<string>} props.careInstructions - Array de instrucciones de cuidado
 * @param {Function} props.onCareAdd - Función para agregar cuidado
 * @param {Function} props.onCareRemove - Función para eliminar cuidado
 * @param {Array<string>} props.tags - Array de tags
 * @param {Function} props.onTagAdd - Función para agregar tag
 * @param {Function} props.onTagRemove - Función para eliminar tag
 * @returns {JSX.Element}
 */
const AdditionalInfoSection = ({
  show,
  onToggle,
  register,
  composition,
  onCompositionAdd,
  onCompositionRemove,
  careInstructions,
  onCareAdd,
  onCareRemove,
  tags,
  onTagAdd,
  onTagRemove,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Header colapsable */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
      >
        <span className="text-lg font-medium text-gray-800">
          Información adicional (opcional)
        </span>
        <svg
          className={`h-5 w-5 transform transition-transform ${
            show ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Contenido */}
      {show && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
          {/* Campos simples */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="brand"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Marca
              </label>
              <input
                type="text"
                id="brand"
                placeholder="Ej: Nike, Adidas..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                {...register('brand')}
              />
            </div>

            <div>
              <label
                htmlFor="material"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Material
              </label>
              <input
                type="text"
                id="material"
                placeholder="Ej: Algodón, Poliéster..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                {...register('material')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="origin"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Origen
              </label>
              <input
                type="text"
                id="origin"
                placeholder="Ej: Argentina, China..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                {...register('origin')}
              />
            </div>

            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Peso (gramos)
              </label>
              <input
                type="number"
                id="weight"
                min="0"
                placeholder="Para cálculo de envío"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                {...register('weight')}
              />
            </div>
          </div>

          {/* Composición */}
          <ArrayFieldManager
            label="Composición"
            items={composition}
            onAdd={onCompositionAdd}
            onRemove={onCompositionRemove}
            variant="default"
          />

          {/* Instrucciones de cuidado */}
          <ArrayFieldManager
            label="Instrucciones de cuidado"
            items={careInstructions}
            onAdd={onCareAdd}
            onRemove={onCareRemove}
            variant="default"
          />

          {/* Tags */}
          <ArrayFieldManager
            label="Etiquetas (para búsqueda)"
            items={tags}
            onAdd={onTagAdd}
            onRemove={onTagRemove}
            variant="tags"
          />
        </div>
      )}
    </div>
  );
};

export default AdditionalInfoSection;
