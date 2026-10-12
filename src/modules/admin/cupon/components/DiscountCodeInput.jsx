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
      <div className="border-y border-gray-200 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <TagIcon className="h-4 w-4 shrink-0 text-gray-500" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">
                Cupón <span className="font-nexa-bold">{appliedCoupon.code}</span>
              </p>
              {appliedCoupon.description && (
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {appliedCoupon.description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
            aria-label="Remover cupón"
            title="Remover cupón"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex justify-between gap-3 text-sm">
          <span className="text-gray-500">Descuento</span>
          <span className="font-medium text-gray-950">
            −${discountAmount.toLocaleString('es-AR')}
          </span>
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
          <label htmlFor="discount-code" className="text-sm font-medium text-gray-800">
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
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm uppercase focus:border-black focus:outline-none"
            disabled={isApplying}
          />
          <button
            type="submit"
            disabled={!code.trim() || isApplying}
            className="cursor-pointer rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
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
