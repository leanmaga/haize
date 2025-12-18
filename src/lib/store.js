'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // ========== NUEVOS CAMPOS PARA CUPONES ==========
      appliedCoupon: null,
      discountAmount: 0,
      // ================================================

      // ✅ SIMPLIFICADO: Buscar solo por ID único
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);

        if (existingItem) {
          // Si el item ya existe, actualizar la cantidad
          const updatedItems = currentItems.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          );
          set({ items: updatedItems });
        } else {
          // Si es un nuevo item, añadirlo al carrito
          set({ items: [...currentItems, item] });
        }

        // Recalcular descuento si hay cupón aplicado
        const { appliedCoupon } = get();
        if (appliedCoupon) {
          get().recalculateDiscount();
        }
      },

      // Actualizar la cantidad de un item en el carrito
      updateQuantity: (id, quantity) => {
        const currentItems = get().items;
        if (quantity <= 0) {
          // Si la cantidad es 0 o menor, remover el item
          set({ items: currentItems.filter((i) => i.id !== id) });
        } else {
          // Actualizar la cantidad del item
          const updatedItems = currentItems.map((i) =>
            i.id === id ? { ...i, quantity } : i,
          );
          set({ items: updatedItems });
        }

        // Recalcular descuento si hay cupón aplicado
        const { appliedCoupon } = get();
        if (appliedCoupon) {
          get().recalculateDiscount();
        }
      },

      // Remover un item del carrito
      removeItem: (id) => {
        const currentItems = get().items;
        set({ items: currentItems.filter((i) => i.id !== id) });
        toast.success('Producto eliminado del carrito');

        // Recalcular descuento si hay cupón aplicado
        const { appliedCoupon } = get();
        if (appliedCoupon) {
          get().recalculateDiscount();
        }
      },

      // Vaciar el carrito
      clearCart: () => {
        set({ items: [], appliedCoupon: null, discountAmount: 0 });
        toast.success('Carrito vaciado');
      },

      // Calcular el total del carrito
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      // Calcular el número total de items en el carrito
      getItemsCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      // ========== MÉTODOS DE CUPONES ==========

      // Aplicar cupón al carrito
      applyCoupon: async (couponCode) => {
        const currentTotal = get().getTotal();

        try {
          const response = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: couponCode,
              subtotal: currentTotal,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            toast.error(data.message || 'Cupón inválido');
            return { success: false, error: data.message };
          }

          if (data.valid) {
            set({
              appliedCoupon: {
                id: data.coupon.id,
                code: data.coupon.code,
                description: data.coupon.description,
                discountType: data.coupon.discountType,
                discountValue: data.coupon.discountValue,
              },
              discountAmount: data.discount.amount,
            });

            toast.success(data.message, {
              icon: '🎉',
              duration: 4000,
            });

            return { success: true, discount: data.discount };
          }
        } catch (error) {
          console.error('Error al aplicar cupón:', error);
          toast.error('Error al validar el cupón');
          return { success: false, error: 'Error de conexión' };
        }
      },

      // Remover cupón aplicado
      removeCoupon: () => {
        set({
          appliedCoupon: null,
          discountAmount: 0,
        });
        toast.success('Cupón removido');
      },

      // Calcular total con descuento
      getTotalWithDiscount: () => {
        const subtotal = get().getTotal();
        const discount = get().discountAmount;
        return Math.max(0, subtotal - discount); // No puede ser negativo
      },

      // Obtener información del descuento aplicado
      getDiscountInfo: () => {
        const { appliedCoupon, discountAmount } = get();
        if (!appliedCoupon) {
          return null;
        }

        return {
          code: appliedCoupon.code,
          amount: discountAmount,
          type: appliedCoupon.discountType,
          value: appliedCoupon.discountValue,
          description: appliedCoupon.description,
        };
      },

      // Recalcular descuento cuando cambia el carrito
      recalculateDiscount: async () => {
        const { appliedCoupon } = get();

        // Si no hay cupón aplicado, no hacer nada
        if (!appliedCoupon) return;

        const currentTotal = get().getTotal();

        // Si el carrito está vacío, remover cupón
        if (currentTotal === 0) {
          set({
            appliedCoupon: null,
            discountAmount: 0,
          });
          return;
        }

        try {
          const response = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: appliedCoupon.code,
              subtotal: currentTotal,
            }),
          });

          const data = await response.json();

          if (data.valid) {
            // Actualizar solo el monto del descuento
            set({ discountAmount: data.discount.amount });
          } else {
            // Si el cupón ya no es válido, removerlo
            set({
              appliedCoupon: null,
              discountAmount: 0,
            });
            toast.error('El cupón ya no es válido y fue removido');
          }
        } catch (error) {
          console.error('Error al recalcular descuento:', error);
          // En caso de error, mantener el cupón pero advertir
          toast.error('No se pudo validar el cupón', { duration: 2000 });
        }
      },

      // ========================================
    }),
    {
      name: 'cart-storage', // nombre para localStorage
    },
  ),
);
