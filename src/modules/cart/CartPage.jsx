'use client';

import { useCartStore } from '@/lib/store';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import ClearCartModal from '@/components/cart/ClearCartModal';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isEmpty = items.length === 0;

  const handleClearCart = () => {
    clearCart();
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen mt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {isEmpty ? (
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="bg-white p-6 mb-6">
                <div className="flex items-start gap-3 border border-gray-300 p-4">
                  <div className="shrink-0">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path
                        strokeLinecap="round"
                        strokeWidth="2"
                        d="M12 16v-4m0-4h.01"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700">
                    Algunos de los productos más populares no pueden ser
                    guardados en tu carrito por más de dos horas.
                  </p>
                </div>
              </div>

              {/* Empty state */}
              <div className="bg-white p-12 text-center">
                <h2 className="text-2xl font-sora-regular mb-8">
                  No hay productos en tu carrito
                </h2>
                <Link
                  href="/products"
                  className="font-sora-regular inline-block bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors"
                >
                  Explorar Productos
                </Link>
              </div>
            </div>
          ) : (
            <div className="lg:flex lg:gap-8">
              {/* Left column - Cart items */}
              <div className="lg:w-2/3 mb-8 lg:mb-0">
                {/* Header */}
                <div className="bg-white p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-nexa-bold">
                      RESUMEN DE COMPRA ({items.length} producto
                      {items.length !== 1 ? 's' : ''})
                    </h1>
                    {/* Botón Vaciar Carrito */}
                    <button
                      onClick={() => setShowClearModal(true)}
                      className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                      Vaciar carrito
                    </button>
                  </div>
                  <div className="flex items-start gap-3 border border-gray-300 p-4">
                    <div className="shrink-0">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <path
                          strokeLinecap="round"
                          strokeWidth="2"
                          d="M12 16v-4m0-4h.01"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700">
                      Algunos de los productos más populares no pueden ser
                      guardados en tu carrito por más de dos horas.
                    </p>
                  </div>
                </div>

                {/* Cart items */}
                <div className="bg-white">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Right column - Summary */}
              <div className="lg:w-1/3">
                <CartSummary />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ClearCartModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearCart}
      />
    </>
  );
}
