/**
 * Componente para gestionar talles del producto
 * @param {Object} props
 * @param {Array} props.sizes - Array de talles
 * @param {Function} props.onAdd - Función para agregar talle
 * @param {Function} props.onRemove - Función para eliminar talle
 * @param {Function} props.onUpdate - Función para actualizar talle
 * @returns {JSX.Element}
 */
const SizesManager = ({ sizes, onAdd, onRemove, onUpdate }) => {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">Talles</h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          + Agregar talle
        </button>
      </div>

      {/* Lista de talles */}
      <div className="space-y-2">
        {sizes.map((size, index) => (
          <div key={index} className="flex gap-2">
            {/* Selector de talle */}
            <select
              value={size.size}
              onChange={(e) => onUpdate(index, 'size', e.target.value)}
              className="max-sm:w-15 flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar talle</option>
              <optgroup label="Letras">
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
              </optgroup>
              <optgroup label="Números (Ropa)">
                <option value="36">36</option>
                <option value="38">38</option>
                <option value="40">40</option>
                <option value="42">42</option>
                <option value="44">44</option>
                <option value="46">46</option>
                <option value="48">48</option>
                <option value="50">50</option>
                <option value="52">52</option>
              </optgroup>
              <optgroup label="Calzado">
                <option value="39">39</option>
                <option value="40">40</option>
                <option value="41">41</option>
                <option value="42">42</option>
                <option value="43">43</option>
                <option value="44">44</option>
                <option value="45">45</option>
                <option value="46">46</option>
              </optgroup>
              <option value="UNICO">Único</option>
            </select>

            {/* Input de stock */}
            <input
              type="number"
              placeholder="Stock"
              min="0"
              value={size.stock}
              onChange={(e) => onUpdate(index, 'stock', e.target.value)}
              className="w-24 max-sm:w-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />

            {/* Input de SKU */}
            <input
              type="text"
              placeholder="SKU (opcional)"
              value={size.sku}
              onChange={(e) => onUpdate(index, 'sku', e.target.value)}
              className="w-32 max-sm:w-14 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />

            {/* Botón eliminar */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-3 max-sm:px-0 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay talles */}
      {sizes.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No hay talles agregados. Haz clic en &quot;+ Agregar talle&quot; para
          comenzar.
        </p>
      )}
    </div>
  );
};

export default SizesManager;
