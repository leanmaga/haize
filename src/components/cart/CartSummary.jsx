'use client';

import { useCartStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const CartSummary = () => {
  const { items, getTotal } = useCartStore();
  const router = useRouter();
  const { data: session } = useSession();
  const [discountCode, setDiscountCode] = useState('');

  const subtotal = getTotal();
  const taxRate = 0.21; // 21% IVA
  const subtotalWithoutTax = subtotal / (1 + taxRate);
  const tax = subtotal - subtotalWithoutTax;
  const freeShippingThreshold = 150000; // $150.000 para envío gratis
  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - subtotal
  );

  const isEmpty = items.length === 0;

  const handleCheckout = () => {
    if (!session) {
      router.push('/auth/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  const handleApplyDiscount = (e) => {
    e.preventDefault();
    // Aquí implementarías la lógica del código de descuento
    console.log('Applying discount code:', discountCode);
  };

  return (
    <div className="bg-white border border-gray-300 sticky top-4">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-medium">RESUMEN DE COMPRA</h2>
        <p className="text-sm text-gray-600 mt-1">
          ({items.length} producto{items.length !== 1 ? 's' : ''})
        </p>
      </div>

      {/* Summary details */}
      <div className="p-6">
        {/* Subtotal */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-700">Subtotal</span>
          <span className="font-medium">
            ${subtotal.toLocaleString('es-AR')}
          </span>
        </div>

        {/* Subtotal without taxes */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            Subtotal sin impuestos nacionales
          </span>
          <span className="text-sm text-gray-500">
            $
            {subtotalWithoutTax.toLocaleString('es-AR', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-6">
          <span className="text-lg font-semibold">TOTAL</span>
          <span className="text-lg font-semibold">
            ${subtotal.toLocaleString('es-AR')}
          </span>
        </div>

        {/* Checkout button */}
        <button
          onClick={handleCheckout}
          className="w-full bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors mb-6 font-medium"
          disabled={isEmpty}
        >
          Iniciar Compra
        </button>

        {/* Free shipping message */}
        {remainingForFreeShipping > 0 ? (
          <div className="mb-6">
            <div className="mb-2">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (subtotal / freeShippingThreshold) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-700">
              ¡Te faltan{' '}
              <span className="font-semibold">
                ${remainingForFreeShipping.toLocaleString('es-AR')}
              </span>{' '}
              para tener <span className="font-semibold">envío gratis!</span>
            </p>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-green-50 border border-green-200">
            <p className="text-sm text-green-800 font-medium">
              ¡Tienes envío gratis! 🎉
            </p>
          </div>
        )}

        {/* Discount code section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-medium mb-3">CÓDIGO DE DESCUENTO</h3>
          <form onSubmit={handleApplyDiscount} className="space-y-3">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Tipeá el código"
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 border border-black bg-white text-black hover:bg-gray-50 transition-colors font-medium"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
