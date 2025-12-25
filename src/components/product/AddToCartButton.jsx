'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

/**
 * AddToCartButton actualizado para variantes combinadas
 * Usa Zustand store y valida selección obligatoria de talle + color
 */
export default function AddToCartButton({
  product,
  selectedSize,
  selectedColor,
  selectedVariant, // ← NUEVO: Variante completa seleccionada
  disabled = false,
}) {
  const addToCart = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Precio a mostrar (promocional o normal)
  const price =
    product.promoPrice && product.promoPrice > 0
      ? product.promoPrice
      : product.salePrice;

  // ========== DETECCIÓN DE VARIANTES ==========

  // Sistema NUEVO: Variantes combinadas
  const hasVariantsCombined = product.variants && product.variants.length > 0;

  // Sistema ANTIGUO: Sizes y colors separados (backward compatibility)
  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasColors = product.colors && product.colors.length > 0;
  const hasVariantsSeparated = hasSizes || hasColors;

  // Determinar qué sistema usar
  const hasVariants = hasVariantsCombined || hasVariantsSeparated;

  // ========== VALIDACIÓN ==========

  let needsSize = false;
  let needsColor = false;
  let canAddToCart = true;
  let hasStock = true;

  if (hasVariantsCombined) {
    // Sistema NUEVO: Verificar que se haya seleccionado variante completa
    needsSize = !selectedSize;
    needsColor = !selectedColor;
    canAddToCart = selectedSize && selectedColor && selectedVariant;

    // Verificar stock de la variante específica
    hasStock = selectedVariant ? selectedVariant.stock > 0 : product.stock > 0;

    // Limitar cantidad al stock de la variante
    const maxQuantity = selectedVariant ? selectedVariant.stock : product.stock;
    if (quantity > maxQuantity) {
      setQuantity(maxQuantity);
    }
  } else if (hasVariantsSeparated) {
    // Sistema ANTIGUO: Backward compatibility
    needsSize = hasSizes && !selectedSize;
    needsColor = hasColors && !selectedColor;
    canAddToCart = !needsSize && !needsColor;
    hasStock = product.stock > 0;
  } else {
    // Sin variantes: producto simple
    canAddToCart = true;
    hasStock = product.stock > 0;
  }

  // ========== FUNCIONES DE CANTIDAD ==========

  const incrementQuantity = () => {
    const maxStock = selectedVariant ? selectedVariant.stock : product.stock;
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // ========== AGREGAR AL CARRITO ==========

  const handleAddToCart = () => {
    // Validar variantes
    if (needsSize || needsColor) {
      const missing = [];
      if (needsSize) missing.push('talle');
      if (needsColor) missing.push('color');
      toast.error(`Por favor seleccioná: ${missing.join(' y ')}`, {
        icon: '⚠️',
        duration: 3000,
      });
      return;
    }

    // Validar stock
    if (!hasStock) {
      toast.error('Producto agotado', {
        icon: '😔',
        duration: 3000,
      });
      return;
    }

    // Validar variante específica
    if (hasVariantsCombined && selectedVariant && selectedVariant.stock === 0) {
      toast.error(
        `${selectedSize} en ${selectedColor} está agotado. Por favor elegí otra combinación.`,
        {
          icon: '😔',
          duration: 4000,
        },
      );
      return;
    }

    setIsAdding(true);

    // ✅ CREAR ID ÚNICO PARA CADA VARIANTE
    const uniqueId = hasVariants
      ? `${product._id}-${selectedSize || 'no-size'}-${selectedColor || 'no-color'}`
      : product._id;

    // Construir objeto del carrito
    const cartItem = {
      id: uniqueId, // ← ID único por variante
      productId: product._id, // ← ID original del producto
      title: product.title,
      price: price,
      image: product.imageUrl,
      quantity: quantity,
    };

    // Agregar información de variante si existe
    if (hasVariants && (selectedSize || selectedColor)) {
      cartItem.variant = {
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        variantId: `${selectedSize || 'no-size'}-${selectedColor || 'no-color'}`,
      };

      // Si es sistema nuevo, agregar stock y SKU
      if (selectedVariant) {
        cartItem.variant.stock = selectedVariant.stock;
        cartItem.variant.sku = selectedVariant.sku;
      }
    }

    // Agregar al carrito (Zustand)
    addToCart(cartItem);

    // Toast de éxito personalizado
    toast.success(
      <div className="flex flex-col">
        <span className="font-semibold">¡Agregado al carrito!</span>
        <span className="text-sm text-gray-600">
          {product.title}
          {selectedSize && ` · Talle ${selectedSize}`}
          {selectedColor && ` · ${selectedColor}`}
          {quantity > 1 && ` · ${quantity} unidades`}
        </span>
      </div>,
      {
        icon: '✅',
        duration: 3000,
      },
    );

    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  // ========== PEDIDO POR WHATSAPP ==========

  const handleWhatsAppOrder = () => {
    // Validar variantes
    if (needsSize || needsColor) {
      const missing = [];
      if (needsSize) missing.push('talle');
      if (needsColor) missing.push('color');
      toast.error(`Por favor seleccioná: ${missing.join(' y ')}`, {
        icon: '⚠️',
        duration: 3000,
      });
      return;
    }

    // Validar stock
    if (!hasStock) {
      toast.error('Producto agotado', {
        icon: '😔',
        duration: 3000,
      });
      return;
    }

    // Construir mensaje de WhatsApp
    let variantText = '';
    if (selectedSize) variantText += ` - Talle: ${selectedSize}`;
    if (selectedColor) variantText += ` - Color: ${selectedColor}`;

    const message = `Hola, quiero pedir el siguiente producto:\n${product.title}${variantText}\nCantidad: ${quantity}\nPrecio: $${price}`;
    const phone = '+5491126205030';
    const url = `https://wa.me/${phone.replace(
      /\D/g,
      '',
    )}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  // ========== RENDER ==========

  return (
    <div className="space-y-4">
      {/* Selector de cantidad */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Cantidad:</label>
          <div className="flex items-center border border-gray-300 rounded-lg bg-white">
            <button
              type="button"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="w-16 h-10 flex items-center justify-center border-x border-gray-300 font-medium">
              {quantity}
            </span>
            <button
              type="button"
              onClick={incrementQuantity}
              disabled={
                quantity >=
                (selectedVariant ? selectedVariant.stock : product.stock)
              }
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Indicador de stock máximo */}
        {selectedVariant && (
          <div className="text-xs text-gray-500 text-right mt-2">
            Stock disponible: {selectedVariant.stock} unidades
          </div>
        )}
      </div>

      {/* Botón de agregar al carrito */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding || !hasStock || !canAddToCart || disabled}
        className={`w-full md:w-125 md:h-12 py-4 md:py-0 font-semibold text-center rounded-full transition-all duration-300 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border-2
          ${
            isAdding
              ? 'opacity-70 text-white bg-black border-black'
              : !hasStock || !canAddToCart || disabled
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300'
                : 'text-white bg-black border-black hover:bg-black/70'
          }`}
      >
        {isAdding ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Agregando...
          </>
        ) : !hasStock ? (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Agotado
          </>
        ) : !canAddToCart ? (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Seleccioná variante
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0V9"
              />
            </svg>
            Agregar al carrito
          </>
        )}
      </button>

      {/* Botón de pedido por WhatsApp */}
      <button
        type="button"
        onClick={handleWhatsAppOrder}
        disabled={!hasStock || !canAddToCart || disabled}
        className={`w-full md:w-125 md:h-12 py-4 md:py-0 font-semibold text-center rounded-full transition-all duration-300 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 border-2
          ${
            !hasStock || !canAddToCart || disabled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300'
              : 'text-black bg-white border-black hover:bg-black/70 hover:text-white'
          }`}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
        </svg>
        Pedir por WhatsApp
      </button>
    </div>
  );
}
