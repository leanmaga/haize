"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store";
import { toast } from "react-hot-toast";

export default function AddToCartButton({ product }) {
  const addToCart = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const price =
    product.promoPrice && product.promoPrice > 0
      ? product.promoPrice
      : product.salePrice !== undefined
      ? product.salePrice
      : product.price;

  const hasVariants = product.variants && product.variants.length > 0;

  const hasStock = hasVariants
    ? selectedVariant
      ? selectedVariant.stock > 0
      : product.stock > 0
    : product.stock > 0;

  const incrementQuantity = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      setQuantity(quantity + 1);
    } else if (!selectedVariant && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) {
      toast.error("Por favor selecciona talle y color");
      return;
    }

    if (!hasStock) {
      toast.error("Producto agotado");
      return;
    }

    setIsAdding(true);

    const cartItem = {
      id: product._id,
      title: product.title,
      price: price,
      image: product.imageUrl,
      quantity: quantity,
      ...(selectedVariant && {
        variant: {
          size: selectedVariant.size,
          color: selectedVariant.color,
          variantId: `${selectedVariant.size}-${selectedVariant.color}`,
        },
      }),
    };

    addToCart(cartItem);
    toast.success("Producto agregado al carrito");

    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const handleWhatsAppOrder = () => {
    if (hasVariants && !selectedVariant) {
      toast.error("Por favor selecciona talle y color");
      return;
    }

    if (!hasStock) {
      toast.error("Producto agotado");
      return;
    }

    const variantText = selectedVariant
      ? ` - Talle: ${selectedVariant.size}, Color: ${selectedVariant.color}`
      : "";

    const message = `Hola, quiero pedir el siguiente producto:\n${product.title}${variantText}\nCantidad: ${quantity}\nPrecio: $${price}`;
    const phone = "+5491125528131";
    const url = `https://wa.me/${phone.replace(
      /\D/g,
      ""
    )}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Selector de cantidad mejorado */}
      <div className="bg-[#F1ECE8] p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Cantidad:</label>
          <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-sm">
            <button
              type="button"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-[#E8DFD6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
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
                hasVariants
                  ? selectedVariant
                    ? quantity >= selectedVariant.stock
                    : true
                  : quantity >= product.stock
              }
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-[#E8DFD6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
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
      </div>

      {/* Botón de agregar al carrito con icono */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding || !hasStock || (hasVariants && !selectedVariant)}
        className={`w-full py-4 font-semibold text-center rounded-lg transition-all duration-200 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 shadow-md
          ${
            isAdding
              ? "opacity-70 text-white bg-[#F6C343]"
              : !hasStock || (hasVariants && !selectedVariant)
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "text-white bg-[#F6C343] hover:bg-[#D4A63A] active:bg-[#C19A34] hover:shadow-lg"
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
        ) : hasVariants && !selectedVariant ? (
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
            Selecciona una variante
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

      {/* Botón de pedido por WhatsApp con icono */}
      <button
        type="button"
        onClick={handleWhatsAppOrder}
        disabled={!hasStock || (hasVariants && !selectedVariant)}
        className={`w-full py-4 font-semibold text-center rounded-lg transition-all duration-200 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 shadow-md
          ${
            !hasStock || (hasVariants && !selectedVariant)
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "text-white bg-[#25D366] hover:bg-[#1EA856] active:bg-[#1C9A50] hover:shadow-lg"
          }`}
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
        </svg>
        Pedir por WhatsApp
      </button>

      {/* Información adicional */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
        <div className="flex items-center gap-2 text-green-700 text-sm">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-medium">Entrega garantizada en 24 horas</span>
        </div>
        <p className="text-green-600 text-xs mt-1 ml-6">
          Belgrano, Palermo, Las Cañitas, Colegiales y Núñez
        </p>
      </div>
    </div>
  );
}
