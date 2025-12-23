'use client';

import { useCartStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import DiscountCodeInput from '@/modules/admin/cupon/components/DiscountCodeInput';

const CartSummary = () => {
  const {
    items,
    getTotal,
    getTotalWithDiscount,
    getDiscountInfo,
    recalculateDiscount,
  } = useCartStore();

  const router = useRouter();
  const { data: session } = useSession();

  const subtotal = getTotal();
  const discountInfo = getDiscountInfo();
  const total = getTotalWithDiscount();

  const taxRate = 0.21; // 21% IVA
  const subtotalWithoutTax = subtotal / (1 + taxRate);
  const tax = subtotal - subtotalWithoutTax;
  const freeShippingThreshold = 150000; // $150.000 para envío gratis
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - total);

  const isEmpty = items.length === 0;

  // Recalcular descuento cuando cambian los items del carrito
  useEffect(() => {
    if (discountInfo) {
      recalculateDiscount();
    }
  }, [items.length, subtotal]);

  const handleCheckout = () => {
    if (!session) {
      router.push('/auth/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-300 sticky top-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-sora-regular">RESUMEN DE COMPRA</h2>
          <p className="text-sm text-gray-600 mt-1">
            ({items.length} producto{items.length !== 1 ? 's' : ''})
          </p>
        </div>

        {/* Summary details */}
        <div className="p-6">
          {/* Subtotal */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-sora-regular">
              ${subtotal.toLocaleString('es-AR')}
            </span>
          </div>

          {/* Descuento aplicado */}
          {discountInfo && (
            <div className="flex justify-between items-center mb-3">
              <span className="text-green-600">
                Descuento ({discountInfo.code})
              </span>
              <span className="font-sora-regular text-green-600">
                -${discountInfo.amount.toLocaleString('es-AR')}
              </span>
            </div>
          )}

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

          {/* Discount Code Input */}
          <DiscountCodeInput />

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-6 mt-4">
            <span className="text-lg font-semibold">TOTAL</span>
            <span className="text-lg font-semibold">
              ${total.toLocaleString('es-AR')}
            </span>
          </div>

          {/* Checkout button */}
          <button
            onClick={handleCheckout}
            className="cursor-pointer w-full bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors mb-3 font-sora-regular"
            disabled={isEmpty}
          >
            Iniciar Compra
          </button>

          {/* Free shipping message */}
          {remainingForFreeShipping > 0 ? (
            <div className="text-sm text-center text-gray-600">
              Te faltan ${remainingForFreeShipping.toLocaleString('es-AR')} para
              <span className="font-semibold"> envío gratis</span>
            </div>
          ) : (
            <div className="text-sm text-center text-green-600 font-semibold">
              ¡Envío gratis en tu compra!
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSummary;
