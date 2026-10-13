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
import { normalizeShippingAddress } from '@/lib/shipping-address';
import { normalizeMunicipality } from '@/lib/municipalities';
import AddressAutocomplete from './AddressAutocomplete';

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
  const [loadingShipping, setLoadingShipping] = useState(true);
  const [saveShippingInfo, setSaveShippingInfo] = useState(true);
  const [shippingNotice, setShippingNotice] = useState('');
  const [shippingQuote, setShippingQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [municipalities, setMunicipalities] = useState([]);
  const [municipalityError, setMunicipalityError] = useState('');
  const [showMunicipalities, setShowMunicipalities] = useState(false);
  const [localityCatalog, setLocalityCatalog] = useState({ municipalityId: '', items: [] });
  const [localitiesLoading, setLocalitiesLoading] = useState(false);
  const [localitiesError, setLocalitiesError] = useState('');
  const [shippingRetry, setShippingRetry] = useState(0);
  const editedFields = useRef({});
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
    clearErrors,
    formState: { errors, dirtyFields },
  } = useForm();
  editedFields.current = dirtyFields;
  const city = watch('city');
  const municipalityId = watch('municipalityId');
  const localityId = watch('localityId');
  const province = watch('province');
  const municipalityMatches = municipalities.filter((item) => normalizeMunicipality(item.name) === normalizeMunicipality(city));
  const selectedMunicipality = municipalityId
    ? municipalityMatches.find((item) => item.id === municipalityId)
    : municipalityMatches.length === 1 ? municipalityMatches[0] : null;
  const selectedMunicipalityId = selectedMunicipality?.id;
  const localities = localityCatalog.municipalityId === selectedMunicipalityId ? localityCatalog.items : [];
  const currentQuote = shippingQuote?.municipalityId === selectedMunicipalityId && shippingQuote?.localityId === localityId ? shippingQuote : null;
  const cityRegistration = register('city', {
    required: 'El municipio es obligatorio',
    validate: () => !!selectedMunicipality || 'Seleccioná un municipio válido de la lista',
  });
  const suggestions = municipalities.filter((item) => (!province || item.province === province) && normalizeMunicipality(item.name).includes(normalizeMunicipality(city))).slice(0, 8);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/municipalities', { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.municipalities)) throw new Error('No se pudieron cargar los municipios');
        if (!controller.signal.aborted) setMunicipalities(result.municipalities);
      })
      .catch((error) => { if (error.name !== 'AbortError') setMunicipalityError(error.message); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedMunicipalityId) {
      setLocalitiesLoading(false);
      setLocalitiesError('');
      return;
    }
    const controller = new AbortController();
    setLocalitiesLoading(true);
    setLocalitiesError('');
    fetch(`/api/localities?municipalityId=${encodeURIComponent(selectedMunicipalityId)}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.localities)) throw new Error(data.error || 'No se pudieron cargar las localidades');
        if (!controller.signal.aborted) setLocalityCatalog({ municipalityId: selectedMunicipalityId, items: data.localities });
      })
      .catch((error) => { if (!controller.signal.aborted) setLocalitiesError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLocalitiesLoading(false); });
    return () => controller.abort();
  }, [selectedMunicipalityId, shippingRetry]);

  useEffect(() => {
    if (!city?.trim() || !selectedMunicipalityId || !localityId) {
      setShippingQuote(null);
      setQuoteError('');
      setQuoteLoading(false);
      return;
    }
    const controller = new AbortController();
    setShippingQuote(null);
    setQuoteLoading(true);
    setQuoteError('');
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ city: city.trim() });
      params.set('municipalityId', selectedMunicipalityId);
      params.set('localityId', localityId);
      fetch(`/api/delivery-zones/quote?${params}`, { cache: 'no-store', signal: controller.signal })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'No se pudo calcular el envío');
          if (!controller.signal.aborted) { setShippingQuote(result); clearErrors(['city', 'localityId']); }
        })
        .catch((error) => { if (error.name !== 'AbortError') setQuoteError(error.message); })
        .finally(() => { if (!controller.signal.aborted) setQuoteLoading(false); });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [city, selectedMunicipalityId, localityId, clearErrors, shippingRetry]);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Restore account delivery details without replacing fields already edited.
  useEffect(() => {
    if (!session?.user?.email) return;
    const controller = new AbortController();
    setLoadingShipping(true);
    setShippingNotice('');
    fetch('/api/users/shipping', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('No se pudieron recuperar tus datos. Podés completarlos para este pedido.');
        const data = await response.json();
        if (controller.signal.aborted) return;
        for (const field of ['name', 'email', 'phone', 'street', 'streetNumber', 'apartment', 'province', 'city', 'municipalityId', 'localityId', 'postalCode']) {
          if (['municipalityId', 'localityId'].includes(field) && editedFields.current.city) continue;
          if (!editedFields.current[field]) setValue(field, data.shippingInfo?.[field] || '');
        }
      })
      .catch((error) => { if (error.name !== 'AbortError') setShippingNotice(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoadingShipping(false); });
    return () => controller.abort();
  }, [session?.user?.email, setValue]);

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
  const total = getTotalWithDiscount() + (currentQuote?.shippingCost || 0);
  const discountInfo = getDiscountInfo();
  // ==================================================

  // ========== SUBMIT PARA MERCADOPAGO ==========
  const onSubmit = async (data) => {
    if (isSubmitting || loadingShipping || localitiesLoading || localitiesError || quoteLoading || !currentQuote || quoteError) return;
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
        saveShippingInfo,
        shippingInfo: normalizeShippingAddress({
          name: data.name,
          email: data.email,
          phone: data.phone,
          street: data.street,
          streetNumber: data.streetNumber,
          apartment: data.apartment,
          province: selectedMunicipality?.province || data.province,
          city: currentQuote.city,
          municipalityId: currentQuote.municipalityId,
          localityId: currentQuote.localityId,
          locality: currentQuote.locality,
          postalCode: data.postalCode,
        }),
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
                {loadingShipping && <p role="status" className="mb-4 text-sm text-gray-600">Cargando tus datos de envío…</p>}
                {shippingNotice && <p role="status" className="mb-4 text-sm text-gray-600">{shippingNotice}</p>}
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
                    <label htmlFor="street" className="block text-sm mb-2">
                      Calle *
                    </label>
                    <AddressAutocomplete
                      error={errors.street}
                      registration={register('street', {
                        required: 'La calle es obligatoria',
                        validate: (value) => !!value.trim() || 'La calle es obligatoria',
                      })}
                      onEdit={() => {
                        setValue('localityId', '', { shouldDirty: true });
                        setShippingQuote(null);
                      }}
                      onSelect={(address) => {
                        for (const field of ['street', 'streetNumber', 'postalCode', 'city', 'municipalityId', 'localityId', 'province']) {
                          setValue(field, address[field] || '', { shouldDirty: true });
                        }
                        setShippingQuote(null);
                        setShowMunicipalities(false);
                        clearErrors(['street', 'streetNumber', 'city', 'localityId']);
                      }}
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label htmlFor="streetNumber" className="block text-sm mb-2">Número de la casa *</label>
                    <input
                      id="streetNumber"
                      type="text"
                      required
                      placeholder="Ej.: 1234"
                      aria-invalid={!!errors.streetNumber}
                      aria-describedby={errors.streetNumber ? 'streetNumber-error' : undefined}
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${errors.streetNumber ? 'border-red-500' : 'border-gray-300'}`}
                      {...register('streetNumber', {
                        required: 'El número de la casa es obligatorio',
                        validate: (value) => /^\d+[a-zA-Z]?$/.test(value.trim()) || 'Ingresá un número válido, por ejemplo 123 o 123A',
                      })}
                    />
                    {errors.streetNumber && <p id="streetNumber-error" role="alert" className="mt-1 text-sm text-red-500">{errors.streetNumber.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="province" className="block text-sm mb-2">Provincia</label>
                    <select id="province" className="w-full bg-white px-3 py-3 border border-gray-300 focus:outline-none focus:border-black" {...register('province')}
                      onChange={(event) => {
                        setValue('province', event.target.value, { shouldDirty: true });
                        setValue('city', '', { shouldDirty: true });
                        setValue('municipalityId', '');
                        setValue('localityId', '', { shouldDirty: true });
                        setShippingQuote(null);
                      }}>
                      <option value="">Seleccioná la provincia</option>
                      {[...new Set(municipalities.map((item) => item.province).filter(Boolean))].sort().map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </div>

                  <div className="relative">
                    <label htmlFor="city" className="block text-sm mb-2">
                      Municipio *
                    </label>
                    <input
                      id="city"
                      type="text"
                      autoComplete="off"
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={showMunicipalities && suggestions.length > 0}
                      aria-controls="municipality-suggestions"
                      aria-invalid={!!errors.city}
                      className={`w-full px-3 py-3 border focus:outline-none focus:border-black ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...cityRegistration}
                      onFocus={() => setShowMunicipalities(true)}
                      onChange={(event) => {
                        cityRegistration.onChange(event);
                        setValue('municipalityId', '');
                        setValue('localityId', '', { shouldDirty: true });
                        setShippingQuote(null);
                        setShowMunicipalities(true);
                      }}
                      onBlur={(event) => {
                        cityRegistration.onBlur(event);
                        setTimeout(() => setShowMunicipalities(false), 150);
                      }}
                    />
                    <input type="hidden" {...register('municipalityId')} />
                    {showMunicipalities && city?.trim() && suggestions.length > 0 && (
                      <div id="municipality-suggestions" role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto border border-gray-300 bg-white shadow-sm">
                        {suggestions.map((item) => (
                          <button key={item.id} type="button" role="option" aria-selected={municipalityId === item.id}
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setValue('city', item.name, { shouldValidate: false });
                              setValue('municipalityId', item.id);
                              setValue('province', item.province || '');
                              setValue('localityId', '', { shouldDirty: true });
                              setShippingQuote(null);
                              setShowMunicipalities(false);
                            }}>
                            {item.name} <span className="text-gray-500">· {item.province}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {municipalityError && <p role="status" className="mt-1 text-sm text-red-600">{municipalityError}</p>}
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="localityId" className="block text-sm mb-2">Localidad *</label>
                    <select
                      id="localityId"
                      disabled={!selectedMunicipalityId || localitiesLoading || !!localitiesError}
                      aria-required="true"
                      aria-invalid={!!errors.localityId}
                      aria-describedby="locality-help"
                      className={`w-full min-w-0 bg-white px-3 py-3 border focus:outline-none focus:border-black disabled:bg-gray-50 disabled:text-gray-500 ${errors.localityId ? 'border-red-500' : 'border-gray-300'}`}
                      {...register('localityId', {
                        required: 'Seleccioná una localidad',
                        validate: (value) => (localities.some((item) => item.id === value) && !!currentQuote && !quoteLoading && !quoteError) || 'Seleccioná una localidad y aguardá el cálculo del envío',
                      })}
                      value={localityId || ''}
                      onChange={(event) => {
                        setValue('localityId', event.target.value, { shouldDirty: true });
                        setShippingQuote(null);
                        clearErrors('localityId');
                      }}
                    >
                      <option value="">{localitiesLoading ? 'Cargando localidades…' : selectedMunicipalityId ? 'Seleccioná tu localidad' : 'Elegí primero el municipio'}</option>
                      {localities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                    <div id="locality-help" className="mt-2 text-sm" aria-live="polite">
                      {errors.localityId && <p className="text-red-600">{errors.localityId.message}</p>}
                      {localitiesError || quoteError ? (
                        <p className="text-red-600">{localitiesError || quoteError} <button type="button" onClick={() => setShippingRetry((value) => value + 1)} className="underline">Reintentar</button></p>
                      ) : quoteLoading ? <p className="text-gray-500">Calculando envío…</p> : currentQuote ? (
                        <div className="border-l-2 border-black pl-3 py-1">
                          <p className="font-nexa-bold text-black">{currentQuote.quoted ? currentQuote.shippingCost === 0 ? 'Envío sin cargo · $0' : `Envío: $${currentQuote.shippingCost.toLocaleString('es-AR')}` : 'Envío por coordinar'}</p>
                          <p className="mt-1 text-xs text-gray-500">{currentQuote.quoted ? currentQuote.shippingCost === 0 ? 'El vendedor cubre el costo del envío.' : 'Este importe se suma al total de tu compra.' : 'Coordinaremos el costo y la entrega con vos. El total no incluye envío.'}</p>
                          {currentQuote.note && <p className="mt-1 text-xs text-gray-500">{currentQuote.note}</p>}
                        </div>
                      ) : <p className="text-xs text-gray-500">Seleccioná tu localidad para ver el costo de envío.</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="apartment" className="block text-sm mb-2">Departamento (opcional)</label>
                    <input id="apartment" type="text" autoComplete="address-line2" maxLength={100}
                      placeholder="Ej.: Piso 2, departamento B"
                      className="w-full px-3 py-3 border border-gray-300 focus:outline-none focus:border-black"
                      {...register('apartment', { maxLength: { value: 100, message: 'Ingresá hasta 100 caracteres' } })} />
                    {errors.apartment && <p role="alert" className="mt-1 text-sm text-red-500">{errors.apartment.message}</p>}
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
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" checked={saveShippingInfo} disabled={loadingShipping || isSubmitting} onChange={(event) => setSaveShippingInfo(event.target.checked)} className="mt-1" />
                    <span>Guardar estos datos de envío para mis próximas compras.
                      <span className="mt-1 block text-xs text-gray-500">Si enviás a otro domicilio solo esta vez, dejá esta opción desmarcada. Tus datos habituales se conservarán.</span>
                    </span>
                  </label>
                  {/* Botón de MercadoPago */}
                  <button
                    type="submit"
                    disabled={isSubmitting || loadingShipping}
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
                  <span>{quoteLoading ? 'Calculando...' : quoteError ? 'No disponible' : currentQuote?.quoted ? currentQuote.shippingCost === 0 ? 'Sin cargo' : `$${currentQuote.shippingCost.toLocaleString('es-AR')}` : currentQuote ? 'Por coordinar' : 'Seleccioná localidad'}</span>
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
