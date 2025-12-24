'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { TagIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function DiscountCodeInput() {
  const [code, setCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const { appliedCoupon, discountAmount, applyCoupon, removeCoupon } =
    useCartStore();

  const handleApply = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      return;
    }

    setIsApplying(true);
    await applyCoupon(code.trim().toUpperCase());
    setIsApplying(false);
  };

  const handleRemove = () => {
    removeCoupon();
    setCode('');
  };

  // Si ya hay un cupón aplicado, mostrar info del cupón
  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <TagIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Cupón aplicado: {appliedCoupon.code}
              </p>
              {appliedCoupon.description && (
                <p className="text-sm text-green-700 mt-1">
                  {appliedCoupon.description}
                </p>
              )}
              <p className="text-sm font-semibold text-green-800 mt-2">
                Descuento: -${discountAmount.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="shrink-0 text-green-700 hover:text-green-900 transition-colors"
            aria-label="Remover cupón"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Si no hay cupón aplicado, mostrar formulario
  return (
    <div className="border-t border-gray-200 pt-4">
      <form onSubmit={handleApply} className="space-y-3">
        <div className="flex items-center gap-2 text-gray-700">
          <TagIcon className="h-5 w-5" />
          <label htmlFor="discount-code" className="text-sm font-medium">
            Código de descuento
          </label>
        </div>

        <div className="flex gap-2">
          <input
            id="discount-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ingresá tu código"
            className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm uppercase"
            disabled={isApplying}
          />
          <button
            type="submit"
            disabled={!code.trim() || isApplying}
            className="cursor-pointer px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isApplying ? 'Validando...' : 'Aplicar'}
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Si tenés un código de descuento, ingresalo aquí
        </p>
      </form>
    </div>
  );
}
