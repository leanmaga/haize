import VariantsManager from './VariantsManager';

/**
 * Sección colapsable para gestionar variantes combinadas (talle + color + stock)
 * @param {Object} props
 * @param {boolean} props.show - Si la sección está expandida
 * @param {Function} props.onToggle - Función para expandir/colapsar
 * @param {Object} props.variantsProps - Props para VariantsManager
 * @returns {JSX.Element}
 */
const VariantsSection = ({ show, onToggle, variantsProps }) => {
  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Header colapsable */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 transition"
      >
        <div>
          <span className="text-lg font-medium text-gray-800">
            Variantes del Producto
          </span>
          <p className="text-xs text-gray-500 mt-1">
            Gestiona stock por combinación de talle y color
          </p>
        </div>
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
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <VariantsManager {...variantsProps} />
        </div>
      )}
    </div>
  );
};

export default VariantsSection;
