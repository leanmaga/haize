import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const FilterSidebar = ({
  isOpen,
  onClose,
  products = [],
  onFiltersApply,
  currentFilters = {},
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedSection, setExpandedSection] = useState(null);

  const [priceRange, setPriceRange] = useState(
    currentFilters.priceRange || { min: 0, max: 100000 },
  );
  const [selectedCategory, setSelectedCategory] = useState(
    currentFilters.category || 'all',
  );
  const [selectedSizes, setSelectedSizes] = useState(
    currentFilters.sizes || [],
  );
  const [selectedColors, setSelectedColors] = useState(
    currentFilters.colors || [],
  );
  // Sincronizar con filtros externos cuando cambien
  /*useEffect(() => {
    if (currentFilters.category) setSelectedCategory(currentFilters.category);
    if (currentFilters.sizes) setSelectedSizes(currentFilters.sizes);
    if (currentFilters.colors) setSelectedColors(currentFilters.colors);
    if (currentFilters.priceRange) setPriceRange(currentFilters.priceRange);
  }, [currentFilters]);*/

  useEffect(() => {
    let appliedFromUrl = false;
    const initialFilters = {
      category: searchParams.get('category') || selectedCategory,
      sizes:
        searchParams.getAll('sizes').length > 0
          ? searchParams.getAll('sizes')
          : selectedSizes,
      colors:
        searchParams.getAll('colors').length > 0
          ? searchParams.getAll('colors')
          : selectedColors,
      priceRange: {
        min: Number(searchParams.get('minPrice')) || priceRange.min,
        max: Number(searchParams.get('maxPrice')) || priceRange.max,
      },
    };

    // Si la categoría de la URL es diferente a la inicial O si hay otros filtros
    if (
      initialFilters.category !== selectedCategory ||
      initialFilters.sizes.length > 0 ||
      initialFilters.colors.length > 0 ||
      initialFilters.priceRange.min > priceRange.min ||
      initialFilters.priceRange.max < priceRange.max
    ) {
      // Actualiza los estados internos
      setSelectedCategory(initialFilters.category);
      setSelectedSizes(initialFilters.sizes);
      setSelectedColors(initialFilters.colors);
      setPriceRange(initialFilters.priceRange);

      // Aplica los filtros leídos de la URL
      onFiltersApply(initialFilters);
      appliedFromUrl = true;
    }

    if (
      !appliedFromUrl &&
      (selectedCategory ||
        selectedSizes.length > 0 ||
        selectedColors.length > 0 ||
        priceRange.min > 0 ||
        priceRange.max < 100000)
    ) {
      onFiltersApply({
        category: selectedCategory,
        priceRange,
        sizes: selectedSizes,
        colors: selectedColors,
      });
    }
  }, [searchParams.toString()]);

  const categories = [
    { key: 'all', label: 'Todos' },
    { key: 'camisas', label: 'Camisas' },
    { key: 'remeras', label: 'Remeras' },
    { key: 'musculosas', label: 'Musculosas' },
    { key: 'conjuntos', label: 'Conjuntos' },
    { key: 'shorts', label: 'Shorts' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  // Extraer colores únicos de los productos disponibles
  const availableColors = React.useMemo(() => {
    const colorsMap = new Map();
    products.forEach((product) => {
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach((color) => {
          if (color.name && !colorsMap.has(color.name)) {
            colorsMap.set(color.name, {
              name: color.name,
              hex: color.hexCode || '#000000',
            });
          }
        });
      }
    });
    return Array.from(colorsMap.values());
  }, [products]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const toggleColor = (colorName) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName],
    );
  };

  const handleCategoryClick = (categoryKey) => {
    setSelectedCategory(categoryKey);
  };

  const handlePriceChange = (type, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: Number(value) || 0,
    }));
  };

  const applyFilters = () => {
    const filters = {
      category: selectedCategory,
      priceRange,
      sizes: selectedSizes,
      colors: selectedColors,
    };

    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }

    // --- PRECIO ---
    // Usamos rangos específicos (asumiendo 0 y 100000 son los valores por defecto)
    if (priceRange.min > 0 || priceRange.max < 100000) {
      params.set('minPrice', priceRange.min.toString());
      params.set('maxPrice', priceRange.max.toString());
    } else {
      params.delete('minPrice');
      params.delete('maxPrice');
    }

    // --- TALLES y COLORES (manejo de arrays) ---
    // Si hay selecciones, las unimos con coma. Si no, borramos el parámetro.
    if (selectedSizes.length > 0) {
      params.set('sizes', selectedSizes.join(','));
    } else {
      params.delete('sizes');
    }

    if (selectedColors.length > 0) {
      params.set('colors', selectedColors.join(','));
    } else {
      params.delete('colors');
    }

    // 4. Actualiza la URL usando router.push()
    // Obtenemos la ruta actual (pathname) y le concatenamos el nuevo query string.
    router.push(`?${params.toString()}`);

    // Opcional: Notificar al componente padre que los filtros han sido aplicados.
    if (onFiltersApply) {
      onFiltersApply(currentFilters);
    }

    //onFiltersApply(filters);
    onClose();
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange({ min: 0, max: 100000 });
    setSelectedSizes([]);
    setSelectedColors([]);

    const params = new URLSearchParams();
    router.push(`?${params.toString()}`);

    onFiltersApply({
      category: 'all',
      priceRange: { min: 0, max: 100000 },
      sizes: [],
      colors: [],
    });
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    priceRange.min > 0 ||
    priceRange.max < 100000;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`
        px-5 py-8 fixed top-0 left-0 h-full bg-white z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-[320px] md:w-100 overflow-y-auto shadow-2xl max-md:w-full
      `}
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-sm uppercase font-nexa-bold tracking-wider">
              Filtros
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-black mt-1 transition-colors"
              >
                Limpiar todo
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters Content */}
        <div className="space-y-6">
          {/* CATEGORIAS */}
          <div className="border-b border-gray-200 pb-6">
            <button
              onClick={() => toggleSection('categorias')}
              className="w-full flex items-center justify-between pb-3 hover:bg-gray-50 transition-colors cursor-pointer rounded px-2"
            >
              <span className="font-nexa-bold text-sm uppercase tracking-wide">
                Categorías
              </span>
              {expandedSection === 'categorias' ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden
             ${
               expandedSection === 'categorias'
                 ? 'max-h-100 opacity-100 mt-3'
                 : 'max-h-0 opacity-0'
             }`}
            >
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => handleCategoryClick(category.key)}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded transition-all ${
                      selectedCategory === category.key
                        ? 'bg-black text-white font-nexa-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PRECIO */}
          <div className="border-b border-gray-200 pb-6">
            <button
              onClick={() => toggleSection('precio')}
              className="w-full flex items-center justify-between pb-3 hover:bg-gray-50 transition-colors cursor-pointer rounded px-2"
            >
              <span className="font-nexa-bold text-sm uppercase tracking-wide">
                Precio
              </span>
              {expandedSection === 'precio' ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden
             ${
               expandedSection === 'precio'
                 ? 'max-h-50 opacity-100 mt-3'
                 : 'max-h-0 opacity-0'
             }`}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2 font-nexa-bold">
                    Mínimo
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 font-nexa-bold">
                    Máximo
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none text-sm"
                      placeholder="100000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TALLE */}
          <div className="border-b border-gray-200 pb-6">
            <button
              onClick={() => toggleSection('talle')}
              className="w-full flex items-center justify-between pb-3 hover:bg-gray-50 transition-colors rounded px-2"
            >
              <span className="font-nexa-bold text-sm uppercase tracking-wide">
                Talle
              </span>
              {expandedSection === 'talle' ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden
             ${
               expandedSection === 'talle'
                 ? 'max-h-50 opacity-100 mt-3'
                 : 'max-h-0 opacity-0'
             }`}
            >
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`
                        py-2.5 border text-sm font-nexa-bold transition-all rounded
                        ${
                          selectedSizes.includes(size)
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                        }
                      `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COLOR */}
          {availableColors.length > 0 && (
            <div className="pb-6">
              <button
                onClick={() => toggleSection('color')}
                className="w-full flex items-center justify-between pb-3 hover:bg-gray-50 transition-colors rounded px-2"
              >
                <span className="font-nexa-bold text-sm uppercase tracking-wide">
                  Color
                </span>
                {expandedSection === 'color' ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden
             ${
               expandedSection === 'color'
                 ? 'max-h-100 opacity-100 mt-3'
                 : 'max-h-0 opacity-0'
             }`}
              >
                <div className="grid grid-cols-4 gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className="flex flex-col items-center gap-2 group"
                      title={color.name}
                    >
                      <div
                        className={`
                          w-12 h-12 rounded-sm transition-all border
                          ${
                            selectedColors.includes(color.name)
                              ? 'ring-2 ring-black ring-offset-2 scale-110'
                              : 'hover:scale-105 border-gray-300'
                          }
                        `}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs text-center leading-tight text-gray-700">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón aplicar - sticky */}
        <div className="sticky bottom-0 bg-white pt-6 pb-2 border-t border-gray-200 mt-6">
          <button
            onClick={applyFilters}
            className="w-full bg-black text-white py-3 px-4 text-sm font-nexa-bold hover:bg-gray-800 transition-colors rounded"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
