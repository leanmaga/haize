'use client';

import { useCartStore } from '@/lib/store';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CartItem = ({ item }) => {
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity >= 1) {
      updateQuantity(item.id, newQuantity); // ← Usar solo ID
    }
  };

  const handleRemove = () => {
    removeItem(item.id); // ← Usar solo ID
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className="border-b border-gray-200 p-6 flex gap-6">
      {/* Product Image */}
      <div className="shrink-0 w-24 h-32">
        <div className="relative w-full h-full bg-gray-100">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title || 'Producto en carrito'}
              fill
              style={{ objectFit: 'cover' }}
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <span className="text-xs">Sin imagen</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium text-base mb-2">{item.title}</h3>

            {/* Mostrar talle y color si existen */}
            {item.variant && (
              <div className="text-sm text-gray-600 space-y-1">
                {item.variant.size && (
                  <p className="uppercase">
                    <span className="font-medium">Talle:</span>{' '}
                    {item.variant.size}
                  </p>
                )}
                {item.variant.color && (
                  <p className="uppercase">
                    <span className="font-medium">Color:</span>{' '}
                    {item.variant.color}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-3">
              <label className="text-sm text-gray-600 uppercase">
                Cantidad:
              </label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={handleQuantityChange}
                className="cursor-pointer w-16 px-2 py-1 border border-gray-300 text-center focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-black transition-colors cursor-pointer"
            aria-label="Eliminar producto"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Price info */}
        <div className="mt-auto">
          <div className="text-base font-medium mb-1">
            ${itemTotal.toLocaleString('es-AR')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
