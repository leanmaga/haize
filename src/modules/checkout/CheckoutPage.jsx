'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/lib/store';
import toast, { Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import { LockClosedIcon, TagIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

// ========== FUNCIÓN HELPER PARA EXTRAER PRODUCT ID ==========
const extractProductId = (item) => {
  if (item.productId) return item.productId;

  if (item.id) {
    const id = item.id.toString();

    // Si tiene guiones, es un ID compuesto: "6930da3d2abbbd71b0df30a3-L-Negro"
    if (id.includes('-')) {
      return id.split('-')[0]; // Extraer solo la primera parte
    }

    // Si es un ObjectId válido (24 caracteres), retornarlo
    if (id.length === 24) {
      return id;
    }

    // Si es más largo, tomar los primeros 24 caracteres
    if (id.length > 24) {
      return id.substring(0, 24);
    }
  }

  return item._id || item.id;
};
// ===========================================================

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const idempotencyKey = useRef(
    `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
  );

  const router = useRouter();
  const { data: session, status } = useSession();

  // ========== OBTENER MÉTODOS DEL STORE CON CUPONES ==========
  const { items, getTotal, getTotalWithDiscount, getDiscountInfo, clearCart } =
    useCartStore();
  // ===========================================================

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar datos del usuario
  useEffect(() => {
    if (session?.user) {
      setValue('name', session.user.name || '');
      setValue('email', session.user.email || '');
      setValue('phone', session.user.phone || '');

      if (session.user.needsPhoneUpdate && !session.user.phone) {
        toast(
          'Por favor, ingresa tu número de teléfono para completar tu perfil',
          {
            duration: 6000,
            icon: '🔔',
          },
        );
      }
    }
  }, [session, setValue]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [status, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (mounted && items.length === 0) {
      toast.error('Tu carrito está vacío');
      router.push('/products');
    }
  }, [mounted, items, router]);

  if (!mounted || status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // ========== CALCULAR TOTALES CON CUPONES ==========
  const subtotal = getTotal();
  const total = getTotalWithDiscount();
  const discountInfo = getDiscountInfo();
  // ==================================================

  // ========== SUBMIT PARA MERCADOPAGO ==========
  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // ========== MAPEAR ITEMS CON PRODUCT ID LIMPIO ==========
      const orderItems = items.map((item) => {
        const productId = extractProductId(item);

        return {
          product: productId, // ✅ ProductId limpio
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.image,
          size: item.variant?.size || undefined,
          color: item.variant?.color || undefined,
        };
      });
      // =======================================================

      const orderData = {
        items: orderItems,
        subtotal: subtotal, // ✅ Subtotal sin descuento
        discountAmount: discountInfo ? discountInfo.amount : 0, // ✅ Descuento
        totalAmount: total, // ✅ Total con descuento
        paymentMethod: 'mercadopago',
        shippingInfo: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
        },
        appliedCoupon: discountInfo
          ? {
              code: discountInfo.code,
              discountAmount: discountInfo.amount,
            }
          : null,
        idempotencyKey: idempotencyKey.current,
      };

      console.log('📦 MercadoPago - Enviando orden:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar la orden');
      }

      const result = await response.json();
      console.log('✅ MercadoPago - Orden creada:', result.orderId);

      // Redirigir a MercadoPago
      if (result.paymentInfo?.init_point) {
        const redirectUrl =
          process.env.NODE_ENV === 'development'
            ? result.paymentInfo.sandbox_init_point ||
              result.paymentInfo.init_point
            : result.paymentInfo.init_point ||
              result.paymentInfo.sandbox_init_point;

        if (!redirectUrl) {
          throw new Error('No se recibió URL de MercadoPago');
        }

        toast.success('Redirigiendo a MercadoPago...');

        // Redirigir directamente
        window.location.href = redirectUrl;
      } else {
        throw new Error('No se recibió información de pago de MercadoPago');
      }
    } catch (error) {
      console.error('❌ Error en MercadoPago:', error);
      toast.error(error.message || 'Error al procesar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };
  // ===========================================

  return (
    <div className="bg-white min-h-screen py-12 mt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-nexa-bold mb-8 text-center">
          Finalizar Compra
        </h1>

        <div className="lg:flex lg:gap-12">
          {/* Formulario de Checkout */}
          <div className="lg:w-2/3 mb-8 lg:mb-0">
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-nexa-bold mb-6 pb-4 border-b border-gray-200">
                Información de Envío
              </h2>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Nombre */}
                  <div>
                    <label htmlFor="name" className="block text-sm mb-2">
                      Nombre Completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('name', {
                        required: 'El nombre es requerido',
                      })}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('email', {
                        required: 'El correo electrónico es requerido',
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: 'Correo electrónico inválido',
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label htmlFor="phone" className="block text-sm mb-2">
                      Teléfono
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('phone', {
                        required: 'El teléfono es requerido',
                      })}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Dirección */}
                  <div>
                    <label htmlFor="address" className="block text-sm mb-2">
                      Dirección
                    </label>
                    <input
                      id="address"
                      type="text"
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('address', {
                        required: 'La dirección es requerida',
                      })}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label htmlFor="city" className="block text-sm mb-2">
                      Ciudad
                    </label>
                    <input
                      id="city"
                      type="text"
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('city', {
                        required: 'La ciudad es requerida',
                      })}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  {/* Código Postal */}
                  <div>
                    <label htmlFor="postalCode" className="block text-sm mb-2">
                      Código Postal
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('postalCode', {
                        required: 'El código postal es requerido',
                      })}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {/* Botón de MercadoPago */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-drop py-3 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        <span>Pagar con MercadoPago - ${total.toFixed(2)}</span>
                      </>
                    )}
                  </button>

                  {/* Botón de WhatsApp */}
                  {/* <WhatsAppButton
                    userData={watch()}
                    isDisabled={isSubmitting}
                    handleBeforeSubmit={() => {
                      const isValid = Object.keys(errors).length === 0;
                      if (!isValid) {
                        toast.error(
                          'Por favor completa correctamente todos los campos',
                        );
                      }
                      return isValid;
                    }}
                  /> */}
                </div>
              </form>
            </div>
          </div>

          {/* Resumen de la Orden */}
          <div className="lg:w-1/3">
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-nexa-bold mb-4 pb-4 border-b border-gray-200">
                Resumen de la Orden
              </h2>

              <div className="max-h-80 overflow-y-auto mb-4">
                {items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.variant?.variantId || index}`}
                    className="flex items-center py-3 border-b"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title || 'Producto'}
                        fill
                        sizes="64px"
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium">{item.title}</h3>

                      {/* Mostrar talla y color */}
                      {item.variant && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.variant.size && `Talle: ${item.variant.size}`}
                          {item.variant.size && item.variant.color && ' | '}
                          {item.variant.color && `Color: ${item.variant.color}`}
                        </p>
                      )}

                      <p className="text-sm text-gray-500 mt-1">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totales con cupón */}
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {/* Mostrar descuento si existe */}
                {discountInfo && (
                  <div className="flex justify-between py-2 text-green-600">
                    <span className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-1" />
                      Descuento ({discountInfo.code})
                    </span>
                    <span>-${discountInfo.amount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Envío</span>
                  <span>Por coordinar</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="flex justify-between font-sora-regular text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  {/* Mensaje de ahorro */}
                  {discountInfo && (
                    <div className="mt-2 text-sm text-green-600 text-right">
                      ¡Ahorrás ${discountInfo.amount.toFixed(2)}!
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4">
                <Link
                  href="/cart"
                  className="text-black hover:underline flex items-center font-medium"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Volver al Carrito
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
