// components/admin/products/steps/Step6Review.jsx - VERSION CORREGIDA FINAL
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Step6Review = ({ data, onBack, onCancel, loading, errors }) => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleCreateProduct = async () => {
    try {
      setIsCreating(true); // ✅ CORREGIDO: era setCreating

      console.log('🎯 Guardando producto en MongoDB:', data);

      // ✅ DETECTAR MODO EDICIÓN
      const isEdit = !!data._id;
      const productId = data._id;

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Modo:', isEdit ? 'EDICIÓN ✏️' : 'CREACIÓN ✨');
      console.log('🆔 Product ID:', productId || 'N/A');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Construir payload
      const payload = {
        brand: data.brand,
        model: data.model,
        gender: data.gender,
        category: data.category,
        sizeGuide: data.sizeGuide,
        hasSizeGuide: data.hasSizeGuide,
        variants: data.variants,
        images: Array.isArray(data.images)
          ? data.images.map((img) =>
              typeof img === 'string' ? img : img.url || img,
            )
          : [],
        title: data.title,
        description: data.description,
        salePrice: data.salePrice,
        promoPrice: data.promoPrice,
        cost: data.cost,
        imageUrl: data.images?.[0]?.url || data.images?.[0] || data.imageUrl,
        season: data.season || 'todo-el-año',
        featured: data.featured || false,
        isNew: data.isNew || false,
        isActive: true,
        isComplete: true,
      };

      console.log('📦 Payload construido:', payload);

      // ✅ DETERMINAR URL Y MÉTODO DINÁMICAMENTE
      const url =
        isEdit && productId
          ? `/api/products/${productId}` // ← PUT con ID
          : '/api/products'; // ← POST sin ID

      const method = isEdit && productId ? 'PUT' : 'POST';

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 Request configuración:');
      console.log('   URL:', url);
      console.log('   Method:', method);
      console.log('   Incluye ID:', url.includes(productId || 'NO'));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ Error del servidor:', error);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        throw new Error(
          error.message || error.error || 'Error guardando producto',
        );
      }

      const result = await response.json();

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Producto guardado exitosamente');
      console.log('📦 Result:', result);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const successMessage = isEdit
        ? '✅ Producto actualizado exitosamente!'
        : '✅ Producto creado exitosamente!';

      alert(successMessage);
      router.push('/admin/products');
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ Error fatal:', error);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      setCreateError(error.message);
      alert('Error: ' + error.message);
    } finally {
      setIsCreating(false); // ✅ CORREGIDO: era setCreating
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price || 0);
  };

  const hasPromo = data.promoPrice > 0 && data.promoPrice < data.salePrice;
  const finalPrice = hasPromo ? data.promoPrice : data.salePrice;

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Revisión Final</h2>
        <p className="text-sm text-gray-600 mt-1">
          Revisa toda la información antes de crear el producto
        </p>
      </div>

      {/* Contenido */}
      <div className="px-6 py-6 space-y-6">
        {/* Resumen Visual */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{data.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {data.brand} • {data.gender} • {data.category}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                {hasPromo ? (
                  <>
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(data.promoPrice)}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(data.salePrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(data.salePrice)}
                  </span>
                )}
              </div>
              {hasPromo && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-red-500 text-white mt-2">
                  {Math.round(
                    ((data.salePrice - data.promoPrice) / data.salePrice) * 100,
                  )}
                  % OFF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Paso 1: Características */}
        <div className="border rounded-lg p-5">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
              ✓
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Paso 1: Características Principales
            </h3>
          </div>
          <div className="ml-11 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Marca</p>
              <p className="text-base font-medium text-gray-900">
                {data.brand}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Modelo</p>
              <p className="text-base font-medium text-gray-900">
                {data.model}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Género</p>
              <p className="text-base font-medium text-gray-900">
                {data.gender}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Categoría</p>
              <p className="text-base font-medium text-gray-900 capitalize">
                {data.category}
              </p>
            </div>
          </div>
        </div>

        {/* Paso 2: Guía de Talles */}
        <div className="border rounded-lg p-5">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
              ✓
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Paso 2: Guía de Talles
            </h3>
          </div>
          <div className="ml-11">
            {data.hasSizeGuide && data.sizeGuide ? (
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="text-base font-medium text-green-600">
                  ✓ Guía de talles configurada
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {data.sizeGuide}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="text-base font-medium text-gray-500">
                  Sin guía de talles
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Paso 3: Variantes */}
        <div className="border rounded-lg p-5">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
              ✓
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Paso 3: Variantes y Fotos
            </h3>
          </div>
          <div className="ml-11">
            {data.variants && data.variants.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  {data.variants.length} variante
                  {data.variants.length > 1 ? 's' : ''} creada
                  {data.variants.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-2">
                  {data.variants.map((variant, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300"
                          style={{
                            backgroundColor:
                              variant.color?.toLowerCase() || '#ccc',
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {variant.colorName || variant.color}
                          </p>
                          <p className="text-xs text-gray-600">
                            {variant.sizes?.length || 0} talle
                            {variant.sizes?.length !== 1 ? 's' : ''}
                            {variant.sizes && `: ${variant.sizes.join(', ')}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Stock total</p>
                        <p className="font-bold text-gray-900">
                          {variant.sizes?.reduce(
                            (sum, size) => sum + (size.stock || 0),
                            0,
                          ) || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-base text-gray-500">
                Sin variantes configuradas
              </p>
            )}
          </div>
        </div>

        {/* Paso 4: Título y Descripción */}
        <div className="border rounded-lg p-5">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
              ✓
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Paso 4: Título y Descripción
            </h3>
          </div>
          <div className="ml-11 space-y-3">
            <div>
              <p className="text-sm text-gray-600">Título</p>
              <p className="text-base font-medium text-gray-900">
                {data.title}
              </p>
            </div>
            {data.description && (
              <div>
                <p className="text-sm text-gray-600">Descripción</p>
                <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-3">
                  {data.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Paso 5: Precio */}
        <div className="border rounded-lg p-5">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
              ✓
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Paso 5: Precio
            </h3>
          </div>
          <div className="ml-11 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Precio de venta</p>
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(data.salePrice)}
              </p>
            </div>
            {data.promoPrice > 0 && (
              <div>
                <p className="text-sm text-gray-600">Precio promocional</p>
                <p className="text-lg font-bold text-green-600">
                  {formatPrice(data.promoPrice)}
                </p>
              </div>
            )}
            {data.cost > 0 && (
              <div>
                <p className="text-sm text-gray-600">Costo (privado)</p>
                <p className="text-lg font-bold text-gray-700">
                  {formatPrice(data.cost)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error si existe */}
        {createError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-red-600 text-xl mr-3">❌</span>
              <div>
                <h4 className="text-sm font-medium text-red-900 mb-1">
                  Error al crear producto
                </h4>
                <p className="text-sm text-red-700">{createError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Información importante antes de crear */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-yellow-600 text-xl mr-3">⚠️</span>
            <div>
              <h4 className="text-sm font-medium text-yellow-900 mb-2">
                Antes de crear el producto
              </h4>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• Verifica que toda la información sea correcta</li>
                <li>• Puedes volver atrás a cualquier paso para editar</li>
                <li>
                  • El producto se creará como <strong>ACTIVO</strong> y visible
                  en la tienda
                </li>
                <li>
                  • Después de crear, podrás editar el producto desde la lista
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botón de acción principal */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full mb-3">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¡Todo listo para crear tu producto!
              </h3>
              <p className="text-sm text-gray-600">
                Al hacer clic en "Crear Producto", se guardará en la base de
                datos y será visible en la tienda.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateProduct}
              disabled={isCreating}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none"
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creando producto...
                </span>
              ) : (
                '✅ Crear Producto'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-6 py-4 bg-gray-50 flex justify-between items-center rounded-b-lg">
        <button
          type="button"
          onClick={onBack}
          disabled={isCreating}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Atrás
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isCreating}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default Step6Review;
