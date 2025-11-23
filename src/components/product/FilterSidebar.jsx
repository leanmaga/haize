import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const FilterSidebar = ({ isOpen, onClose }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const categories = [
    { key: 'all', label: 'Todos' },

    // Ropa superior
    { key: 'camisas', label: 'Camisas' },
    { key: 'remeras', label: 'Remeras' },
    { key: 'musculosas', label: 'Musculosas' },
    { key: 'conjuntos', label: 'Conjuntos' },

    // Ropa inferior
    { key: 'shorts', label: 'Shorts' },
  ];

  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

  const colors = [
    { name: 'Blanco', hex: '#FFFFFF', label: 'Blanco' },
    { name: 'Negro', hex: '#000000', label: 'Negro' },
    { name: 'Beige', hex: '#e4dabb', label: 'Beige' },
    { name: 'Verde', hex: '#90a88f', label: 'Verde' },
  ];

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  const handlePriceChange = (type, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: Number(value),
    }));
  };

  const applyFilters = () => {
    console.log('Filters applied:', {
      priceRange,
      selectedSizes,
      selectedColors,
    });
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        px-5 py-8 fixed top-0 left-0 h-full bg-white z-80
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        min-w-[600px] overflow-y-auto
      `}
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-sm uppercase font-medium">Filtros</h2>
          <button onClick={onClose} className="cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Filters Content */}
        <div className="divide-y">
          {/* CATEGORIAS */}
          <div className="border-b border-black/15">
            <button
              onClick={() => toggleSection('categorias')}
              className="w-full flex items-center justify-between pb-2 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span className="font-medium text-sm uppercase tracking-wide">
                CATEGORIAS
              </span>
              {expandedSection === 'categorias' ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            <div
              className={`ml-4 border-none transition-all duration-600 ease-in-out overflow-hidden transform
             ${
               expandedSection === 'categorias'
                 ? 'max-h-[350px] py-2'
                 : 'max-h-0 p-0'
             } pt-0 cursor-pointer`}
            >
              <div className="space-y-2">
                {categories.map((category) => (
                  <p
                    key={category.key}
                    className="m-0 py-2 text-md text-gray-500 hover:bg-gray-100"
                  >
                    {category.label}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* PRECIO */}
          <div className="border-b border-black/15">
            <button
              onClick={() => toggleSection('precio')}
              className="w-full flex items-center justify-between py-2 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span className="font-medium text-md uppercase tracking-wide">
                PRECIO
              </span>
              {expandedSection === 'precio' ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            <div
              className={`space-y-4 border-none transition-all duration-500 ease-in-out overflow-hidden transform
             ${
               expandedSection === 'precio'
                 ? 'max-h-[160px] py-4'
                 : 'max-h-0 py-0'
             }`}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Min
                  </label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-300 focus:border-black outline-none text-sm"
                    placeholder="$0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Max
                  </label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-full px-3 py-2 border-b border-gray-300 focus:border-black outline-none text-sm"
                    placeholder="$1,0000"
                  />
                </div>
              </div>
              <button
                onClick={applyFilters}
                className="w-full bg-black text-white py-2 px-4 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                APLICAR
              </button>
            </div>
          </div>

          {/* TALLE */}
          <div className="border-b border-black/15">
            <button
              onClick={() => toggleSection('talle')}
              className="w-full flex items-center justify-between py-2 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-md uppercase tracking-wide">
                TALLE
              </span>
              {expandedSection === 'talle' ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            <div
              className={`border-none transition-all duration-500 ease-in-out overflow-hidden transform
             ${
               expandedSection === 'talle'
                 ? 'max-h-[180px] py-4'
                 : 'max-h-0 py-0'
             }`}
            >
              <div className="grid grid-cols-3 gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`
                        py-3 border text-sm font-medium transition-all
                        ${
                          selectedSizes.includes(size)
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-gray-400'
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
          <div className="border-b border-black/15">
            <button
              onClick={() => toggleSection('color')}
              className="w-full flex items-center justify-between py-2 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-md uppercase tracking-wide">
                COLOR
              </span>
              {expandedSection === 'color' ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            <div
              className={`space-y-4 border-none transition-all duration-500 ease-in-out overflow-hidden transform
             ${
               expandedSection === 'color'
                 ? 'max-h-[350px] py-4'
                 : 'max-h-0 py-0'
             }`}
            >
              <div className="grid grid-cols-5 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => toggleColor(color.name)}
                    className="flex flex-col items-center gap-2 group"
                    title={color.label}
                  >
                    <div
                      className={`
                          w-12 h-12 rounded-sm transition-all
                          ${
                            color.name === 'Blanco'
                              ? 'border border-gray-300'
                              : ''
                          }
                          ${
                            selectedColors.includes(color.name)
                              ? 'ring-2 ring-black ring-offset-2'
                              : 'hover:scale-105'
                          }
                        `}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs text-center leading-tight">
                      {color.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
