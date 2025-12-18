/**
 * Componente reutilizable para manejar arrays de strings
 * Se usa para: composición, instrucciones de cuidado, tags
 *
 * @param {Object} props
 * @param {string} props.label - Etiqueta del campo
 * @param {Array<string>} props.items - Array de items
 * @param {Function} props.onAdd - Función para agregar item
 * @param {Function} props.onRemove - Función para eliminar item
 * @param {string} props.variant - Variante de visualización ('default', 'tags')
 * @returns {JSX.Element}
 */
const ArrayFieldManager = ({
  label,
  items,
  onAdd,
  onRemove,
  variant = 'default',
}) => {
  return (
    <div>
      {/* Header con botón agregar */}
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          + Agregar
        </button>
      </div>

      {/* Lista de items */}
      {variant === 'tags' ? (
        // Visualización para tags (badges)
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="hover:text-indigo-600"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : (
        // Visualización default (lista)
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1 px-3 py-1 bg-white border rounded text-sm">
                {item}
              </span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje cuando está vacío */}
      {items.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No hay items agregados. Haz clic en &quot;+ Agregar&quot; para
          comenzar.
        </p>
      )}
    </div>
  );
};

export default ArrayFieldManager;
