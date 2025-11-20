'use client';

import { useState } from 'react';
import AddToCartButton from './AddToCartButton';

export default function VariantSelector({ product }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasColors = product.colors && product.colors.length > 0;

  if (!hasSizes && !hasColors) {
    return <AddToCartButton product={product} />;
  }

  return (
    <>
      {/* Selector de variantes */}
      <div className="mb-6 space-y-6">
        {/* Talles */}
        {hasSizes && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Talle</span>
              {!selectedSize && (
                <span className="text-xs text-red-500">
                  * Selecciona un talle
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSize(size.size)}
                  className={`px-4 py-2 border-2 text-sm font-medium transition-all hover:border-black
                    ${
                      selectedSize === size.size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-900'
                    }
                    ${
                      size.stock === 0
                        ? 'opacity-50 cursor-not-allowed line-through'
                        : ''
                    }`}
                  disabled={size.stock === 0}
                >
                  {size.size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colores */}
        {hasColors && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Color</span>
              <span className="text-sm text-gray-600">
                {selectedColor || 'Seleccionar'}
              </span>
            </div>
            <div className="flex gap-2">
              {product.colors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-12 h-12 border-2 rounded transition-all relative
                    ${
                      selectedColor === color.name
                        ? 'border-black ring-2 ring-black ring-offset-2'
                        : 'border-gray-300 hover:border-black'
                    }
                    ${
                      color.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  style={{
                    backgroundColor: color.hexCode || '#e5e7eb',
                  }}
                  title={color.name}
                  disabled={color.stock === 0}
                >
                  {color.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <AddToCartButton
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
      />
    </>
  );
}
