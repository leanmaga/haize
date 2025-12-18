/**
 * Componente para gestionar colores del producto
 * @param {Object} props
 * @param {Array} props.colors - Array de colores
 * @param {Function} props.onAdd - Función para agregar color
 * @param {Function} props.onRemove - Función para eliminar color
 * @param {Function} props.onUpdate - Función para actualizar color
 * @returns {JSX.Element}
 */
const ColorsManager = ({ colors, onAdd, onRemove, onUpdate }) => {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">Colores</h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          + Agregar color
        </button>
      </div>

      {/* Lista de colores */}
      <div className="space-y-2">
        {colors.map((color, index) => (
          <div key={index} className="flex gap-2 items-center">
            {/* Input de nombre */}
            <input
              type="text"
              placeholder="Nombre"
              value={color.name}
              onChange={(e) => onUpdate(index, 'name', e.target.value)}
              className="max-sm:w-20 flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />

            {/* Selector de color */}
            <input
              type="color"
              value={color.hexCode || '#000000'}
              onChange={(e) => onUpdate(index, 'hexCode', e.target.value)}
              className="w-12 h-10 border rounded-lg cursor-pointer"
            />

            {/* Input de stock */}
            <input
              type="number"
              placeholder="Stock"
              min="0"
              value={color.stock}
              onChange={(e) => onUpdate(index, 'stock', e.target.value)}
              className="w-24 max-sm:w-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />

            {/* Botón eliminar */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay colores */}
      {colors.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No hay colores agregados. Haz clic en &quot;+ Agregar color&quot; para
          comenzar.
        </p>
      )}
    </div>
  );
};

export default ColorsManager;
