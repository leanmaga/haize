'use client';

import { useState } from 'react';
import AddToCartButton from './AddToCartButton';

/**
 * VariantSelector para sistema de variantes combinadas
 * Requiere que el usuario seleccione TALLE + COLOR para agregar al carrito
 *
 * @param {Object} props
 * @param {Object} props.product - Producto con variantes combinadas
 * @returns {JSX.Element}
 */
export default function VariantSelector({ product }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // Verificar si tiene variantes combinadas
  const hasVariants = product.variants && product.variants.length > 0;

  // Si no tiene variantes, mostrar botón normal (producto simple)
  if (!hasVariants) {
    return <AddToCartButton product={product} />;
  }

  // ========== FUNCIONES DE UTILIDAD ==========

  /**
   * Obtiene todos los talles únicos que tienen al menos una variante con stock
   */
  const getAvailableSizes = () => {
    const uniqueSizes = [...new Set(product.variants.map((v) => v.size))];
    // Filtrar solo talles que tengan al menos una variante con stock > 0
    return uniqueSizes.filter((size) => {
      return product.variants.some((v) => v.size === size && v.stock > 0);
    });
  };

  /**
   * Obtiene todos los colores únicos
   */
  const getAllColors = () => {
    return [...new Set(product.variants.map((v) => v.color))];
  };

  /**
   * Obtiene colores disponibles para el talle seleccionado
   * Si no hay talle seleccionado, retorna todos los colores
   */
  const getColorsForSize = (size) => {
    if (!size) return getAllColors();

    return product.variants
      .filter((v) => v.size === size && v.stock > 0)
      .map((v) => v.color);
  };

  /**
   * Verifica si una combinación talle-color está disponible (tiene stock)
   */
  const isVariantAvailable = (size, color) => {
    const variant = product.variants.find(
      (v) => v.size === size && v.color === color,
    );
    return variant && variant.stock > 0;
  };

  /**
   * Obtiene la variante específica seleccionada
   */
  const getSelectedVariant = () => {
    if (!selectedSize || !selectedColor) return null;

    return product.variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor,
    );
  };

  /**
   * Verifica si un talle tiene al menos un color disponible
   */
  const sizeHasStock = (size) => {
    return product.variants.some((v) => v.size === size && v.stock > 0);
  };

  // ========== DATOS CALCULADOS ==========

  const availableSizes = getAvailableSizes();
  const colorsForSelectedSize = getColorsForSize(selectedSize);
  const selectedVariant = getSelectedVariant();

  // ========== HANDLERS ==========

  const handleSizeSelect = (size) => {
    setSelectedSize(size);

    // Si el color seleccionado no está disponible para este talle, resetear
    if (selectedColor && !isVariantAvailable(size, selectedColor)) {
      setSelectedColor(null);
    }
  };

  const handleColorSelect = (color) => {
    // Solo permitir seleccionar si hay talle seleccionado y la combinación está disponible
    if (selectedSize && isVariantAvailable(selectedSize, color)) {
      setSelectedColor(color);
    }
  };
  // Ver qué tiene el producto
  console.log('Product:', product);
  console.log('Has variants?', product.variants);
  console.log('Has sizes?', product.sizes);
  console.log('Has colors?', product.colors);
  console.log('🔍 DEBUG - Product data:', {
    hasVariants: product.variants?.length > 0,
    variants: product.variants,
    hasSizes: product.sizes?.length > 0,
    sizes: product.sizes,
    hasColors: product.colors?.length > 0,
    colors: product.colors,
  });
  // ========== RENDER ==========

  return (
    <>
      <div className="mb-6 space-y-6">
        {/* ========== SELECTOR DE TALLE ========== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold uppercase tracking-wide">
              Talle
            </span>
            {!selectedSize && (
              <span className="text-xs text-red-500 font-medium">
                * Seleccioná un talle
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const hasStock = sizeHasStock(size);
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  disabled={!hasStock}
                  className={`
                    px-4 py-2 border-2 text-sm font-medium transition-all
                    ${
                      isSelected
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-900 hover:border-black'
                    }
                    ${
                      !hasStock
                        ? 'opacity-30 cursor-not-allowed line-through'
                        : ''
                    }
                  `}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* Mensaje si no hay talles disponibles */}
          {availableSizes.length === 0 && (
            <div className="text-sm text-red-600 mt-2">
              No hay talles disponibles en este momento
            </div>
          )}
        </div>

        {/* ========== SELECTOR DE COLOR ========== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold uppercase tracking-wide">
              Color
            </span>
            <div className="flex items-center gap-2">
              {selectedColor ? (
                <span className="text-sm text-gray-900 font-medium">
                  {selectedColor}
                </span>
              ) : (
                <span className="text-xs text-gray-500">
                  Seleccioná un color
                </span>
              )}
              {selectedSize && !selectedColor && (
                <span className="text-xs text-red-500 font-medium">*</span>
              )}
            </div>
          </div>

          {/* Mostrar mensaje si no se ha seleccionado talle */}
          {!selectedSize ? (
            <div className="text-sm text-gray-500 italic py-4">
              Primero seleccioná un talle para ver los colores disponibles
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {colorsForSelectedSize.map((color) => {
                const variant = product.variants.find(
                  (v) => v.size === selectedSize && v.color === color,
                );
                const isAvailable = variant && variant.stock > 0;
                const isSelected = selectedColor === color;

                return (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    disabled={!isAvailable}
                    className={`
                      relative group
                      ${!isAvailable ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                    title={`${color}${!isAvailable ? ' - Agotado' : ''}`}
                  >
                    {/* Cuadrado de color */}
                    <div
                      className={`
                        w-12 h-12 border-2 rounded transition-all
                        ${
                          isSelected
                            ? 'border-black ring-2 ring-black ring-offset-2'
                            : 'border-gray-300 hover:border-black'
                        }
                      `}
                      style={{
                        backgroundColor: variant?.colorHex || '#808080',
                      }}
                    />

                    {/* Línea de agotado */}
                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                      </div>
                    )}

                    {/* Nombre del color debajo */}
                    <span className="block text-xs mt-1 text-center text-gray-600">
                      {color}
                    </span>

                    {/* Tooltip con stock al hacer hover */}
                    {isAvailable && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                          Stock: {variant?.stock}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Mensaje si no hay colores disponibles para el talle seleccionado */}
          {selectedSize && colorsForSelectedSize.length === 0 && (
            <div className="text-sm text-red-600 mt-2">
              No hay colores disponibles para el talle {selectedSize}
            </div>
          )}
        </div>

        {/* ========== INFORMACIÓN DE STOCK DE LA VARIANTE SELECCIONADA ========== */}
        {selectedVariant && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  Disponible
                </span>
              </div>
              <span className="text-sm text-green-700">
                <strong>{selectedVariant.stock}</strong>{' '}
                {selectedVariant.stock === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>

            {/* Información adicional */}
            <div className="mt-2 text-xs text-green-700">
              Talle <strong>{selectedVariant.size}</strong> · Color{' '}
              <strong>{selectedVariant.color}</strong>
              {selectedVariant.sku && (
                <span className="ml-2 text-green-600">
                  SKU: {selectedVariant.sku}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ========== MENSAJE DE VALIDACIÓN ========== */}
        {(!selectedSize || !selectedColor) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Selección requerida</p>
                <p className="text-yellow-700">
                  Debés seleccionar un talle y un color para agregar el producto
                  al carrito
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== BOTÓN AGREGAR AL CARRITO ========== */}
      <AddToCartButton
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        selectedVariant={selectedVariant}
        disabled={!selectedSize || !selectedColor || !selectedVariant}
      />
    </>
  );
}
