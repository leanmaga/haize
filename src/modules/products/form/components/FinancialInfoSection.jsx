/**
 * Sección colapsable para información financiera del producto
 * @param {Object} props
 * @param {boolean} props.show - Si la sección está expandida
 * @param {Function} props.onToggle - Función para expandir/colapsar
 * @param {Object} props.register - Función register de react-hook-form
 * @param {Object} props.validationErrors - Errores de validación
 * @param {boolean} props.autoCalculateMargin - Si el margen se calcula automáticamente
 * @param {Function} props.onAutoCalculateToggle - Función para toggle de auto-cálculo
 * @returns {JSX.Element}
 */
const FinancialInfoSection = ({
  show,
  onToggle,
  register,
  validationErrors,
  autoCalculateMargin,
  onAutoCalculateToggle,
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
          Información financiera (opcional)
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
          {/* Costo */}
          <div>
            <label
              htmlFor="cost"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Costo (ARS)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                className={`w-full pl-7 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  validationErrors.cost ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('cost')}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Costo interno del producto (no visible para clientes)
            </p>
          </div>

          {/* Margen de ganancia */}
          <div>
            <div className="flex justify-between">
              <label
                htmlFor="profitMargin"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Margen de ganancia (%)
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoCalculate"
                  checked={autoCalculateMargin}
                  onChange={onAutoCalculateToggle}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="autoCalculate"
                  className="ml-2 text-xs text-gray-600"
                >
                  Calcular automáticamente
                </label>
              </div>
            </div>
            <input
              type="number"
              id="profitMargin"
              step="0.01"
              min="0"
              max="100"
              disabled={autoCalculateMargin}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                autoCalculateMargin ? 'bg-gray-100' : ''
              }`}
              {...register('profitMargin')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialInfoSection;
