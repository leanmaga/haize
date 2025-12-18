/**
 * Componente para gestionar variantes combinadas del producto
 * Cada variante es: Talle + Color + Stock
 *
 * @param {Object} props
 * @param {Array} props.variants - Array de variantes
 * @param {Function} props.onAdd - Función para agregar variante
 * @param {Function} props.onRemove - Función para eliminar variante
 * @param {Function} props.onUpdate - Función para actualizar variante
 * @param {Function} props.onDuplicate - Función para duplicar variante
 * @returns {JSX.Element}
 */
const VariantsManager = ({
  variants,
  onAdd,
  onRemove,
  onUpdate,
  onDuplicate,
}) => {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            Variantes (Talle + Color + Stock)
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Crea variantes combinando talle y color para control preciso del
            stock
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition"
        >
          + Agregar variante
        </button>
      </div>

      {/* Lista de variantes */}
      {variants.length > 0 ? (
        <div className="space-y-3">
          {/* Header de tabla (solo en desktop) */}
          <div className="hidden md:grid md:grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-2">
            <div className="col-span-2">Talle</div>
            <div className="col-span-3">Color</div>
            <div className="col-span-1">Hex</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-3">SKU (opcional)</div>
            <div className="col-span-1">Acciones</div>
          </div>

          {/* Variantes */}
          {variants.map((variant, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition"
            >
              {/* Mobile/Tablet layout */}
              <div className="md:hidden space-y-3">
                {/* Fila 1: Talle y Color */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Talle
                    </label>
                    <select
                      value={variant.size}
                      onChange={(e) => onUpdate(index, 'size', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="">Seleccionar</option>
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
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Negro, Blanco..."
                      value={variant.color}
                      onChange={(e) => onUpdate(index, 'color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                {/* Fila 2: Color Hex y Stock */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Color Hex
                    </label>
                    <input
                      type="color"
                      value={variant.colorHex || '#000000'}
                      onChange={(e) =>
                        onUpdate(index, 'colorHex', e.target.value)
                      }
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => onUpdate(index, 'stock', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                {/* Fila 3: SKU */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    SKU (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: M-NEG-001"
                    value={variant.sku}
                    onChange={(e) => onUpdate(index, 'sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => onDuplicate(index)}
                    className="flex-1 px-3 py-2 text-xs text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                    title="Duplicar variante"
                  >
                    📋 Duplicar
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="px-3 py-2 text-xs text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden md:grid md:grid-cols-12 gap-2 items-center">
                {/* Talle */}
                <div className="col-span-2">
                  <select
                    value={variant.size}
                    onChange={(e) => onUpdate(index, 'size', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">-</option>
                    <optgroup label="Letras">
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="XXXL">XXXL</option>
                    </optgroup>
                    <optgroup label="Números">
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
                </div>

                {/* Color nombre */}
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="Ej: Negro"
                    value={variant.color}
                    onChange={(e) => onUpdate(index, 'color', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Color hex */}
                <div className="col-span-1">
                  <input
                    type="color"
                    value={variant.colorHex || '#000000'}
                    onChange={(e) =>
                      onUpdate(index, 'colorHex', e.target.value)
                    }
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Stock */}
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={variant.stock}
                    onChange={(e) => onUpdate(index, 'stock', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* SKU */}
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="Ej: M-NEG"
                    value={variant.sku}
                    onChange={(e) => onUpdate(index, 'sku', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Acciones */}
                <div className="col-span-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => onDuplicate(index)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition"
                    title="Duplicar"
                  >
                    📋
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Mensaje cuando no hay variantes
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            No hay variantes agregadas
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Las variantes te permiten gestionar stock por combinación de talle y
            color
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Agregar primera variante
          </button>
        </div>
      )}

      {/* Resumen de stock total */}
      {variants.length > 0 && (
        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-indigo-700 font-medium">
              Total de variantes:
            </span>
            <span className="text-indigo-900 font-bold">{variants.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-indigo-700 font-medium">Stock total:</span>
            <span className="text-indigo-900 font-bold">
              {variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)}{' '}
              unidades
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantsManager;
