// components/admin/products/steps/Step5Price.jsx
'use client';

import React, { useState, useEffect } from 'react';

const Step5Price = ({
  data,
  onNext,
  onBack,
  onCancel,
  updateData,
  loading,
  errors,
}) => {
  const [formData, setFormData] = useState({
    salePrice: data.salePrice || '',
    promoPrice: data.promoPrice || '',
    cost: data.cost || '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Actualizar datos en el componente padre
  useEffect(() => {
    updateData(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    // Permitir solo números y punto decimal
    const cleanValue = value.replace(/[^\d.]/g, '');

    setFormData((prev) => ({
      ...prev,
      [field]: cleanValue,
    }));

    // Limpiar errores
    setFormErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const salePrice = parseFloat(formData.salePrice);
    const promoPrice = parseFloat(formData.promoPrice);
    const cost = parseFloat(formData.cost);

    // Validar precio de venta (requerido)
    if (!formData.salePrice || formData.salePrice === '') {
      newErrors.salePrice = 'El precio de venta es requerido';
    } else if (isNaN(salePrice) || salePrice <= 0) {
      newErrors.salePrice = 'El precio debe ser mayor a 0';
    } else if (salePrice > 1000000) {
      newErrors.salePrice = 'El precio no puede exceder $1.000.000';
    }

    // Validar precio promocional (opcional)
    if (formData.promoPrice && formData.promoPrice !== '') {
      if (isNaN(promoPrice) || promoPrice <= 0) {
        newErrors.promoPrice = 'El precio promocional debe ser mayor a 0';
      } else if (promoPrice >= salePrice) {
        newErrors.promoPrice =
          'El precio promocional debe ser menor al precio de venta';
      }
    }

    // Validar costo (opcional pero con validaciones)
    if (formData.cost && formData.cost !== '') {
      if (isNaN(cost) || cost < 0) {
        newErrors.cost = 'El costo no puede ser negativo';
      } else if (cost > salePrice) {
        newErrors.cost = 'Advertencia: El costo es mayor al precio de venta';
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    // Convertir a números antes de guardar
    const priceData = {
      salePrice: parseFloat(formData.salePrice) || 0,
      promoPrice: parseFloat(formData.promoPrice) || 0,
      cost: parseFloat(formData.cost) || 0,
    };

    await onNext(priceData);
  };

  // Cálculos
  const salePrice = parseFloat(formData.salePrice) || 0;
  const promoPrice = parseFloat(formData.promoPrice) || 0;
  const cost = parseFloat(formData.cost) || 0;

  const hasPromo = promoPrice > 0 && promoPrice < salePrice;
  const finalPrice = hasPromo ? promoPrice : salePrice;
  const discount = hasPromo
    ? (((salePrice - promoPrice) / salePrice) * 100).toFixed(0)
    : 0;
  const savings = hasPromo ? (salePrice - promoPrice).toFixed(2) : 0;

  const profit =
    cost > 0 && finalPrice > cost ? (finalPrice - cost).toFixed(2) : 0;
  const profitMargin =
    cost > 0 && finalPrice > cost
      ? (((finalPrice - cost) / finalPrice) * 100).toFixed(1)
      : 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Precio del Producto
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Define el precio de venta y opcionalmente un precio promocional
        </p>
      </div>

      {/* Contenido */}
      <div className="px-6 py-6 space-y-6">
        {/* Precio de Venta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio de venta *
            <span className="text-xs text-gray-500 font-normal ml-2">
              (Precio regular del producto)
            </span>
          </label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="text"
              value={formData.salePrice}
              onChange={(e) => handleChange('salePrice', e.target.value)}
              placeholder="0.00"
              className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-lg font-medium ${
                formErrors.salePrice
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>

          {formErrors.salePrice && (
            <p className="text-sm text-red-600 mt-1">{formErrors.salePrice}</p>
          )}

          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Investiga precios de productos similares en el mercado
          </p>
        </div>

        {/* Precio Promocional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio promocional (opcional)
            <span className="text-xs text-gray-500 font-normal ml-2">
              (Precio de oferta si aplica)
            </span>
          </label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="text"
              value={formData.promoPrice}
              onChange={(e) => handleChange('promoPrice', e.target.value)}
              placeholder="0.00"
              className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-lg font-medium ${
                formErrors.promoPrice
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>

          {formErrors.promoPrice && (
            <p className="text-sm text-red-600 mt-1">{formErrors.promoPrice}</p>
          )}

          {hasPromo && (
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {discount}% OFF
              </span>
              <span className="text-sm text-gray-600">
                Ahorro: {formatPrice(savings)}
              </span>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Los precios promocionales aumentan las conversiones
          </p>
        </div>

        {/* Costo (Opcional - Para cálculo de margen) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Costo del producto (opcional)
            <span className="text-xs text-gray-500 font-normal ml-2">
              (Para calcular margen de ganancia)
            </span>
          </label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="text"
              value={formData.cost}
              onChange={(e) => handleChange('cost', e.target.value)}
              placeholder="0.00"
              className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-lg font-medium ${
                formErrors.cost
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>

          {formErrors.cost && (
            <p className="text-sm text-red-600 mt-1">{formErrors.cost}</p>
          )}

          {profit > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Ganancia por unidad:{' '}
                <strong className="text-green-600">
                  {formatPrice(profit)}
                </strong>
              </span>
              <span className="text-sm text-gray-600">
                ({profitMargin}% de margen)
              </span>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            🔒 Este dato es privado, no se muestra a los clientes
          </p>
        </div>

        {/* Vista Previa del Precio */}
        {salePrice > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-3">
              VISTA PREVIA EN LA TIENDA:
            </p>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-baseline gap-3">
                {hasPromo ? (
                  <>
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(promoPrice)}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(salePrice)}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-red-500 text-white">
                      {discount}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(salePrice)}
                  </span>
                )}
              </div>

              {hasPromo && (
                <p className="text-sm text-green-600 font-medium mt-2">
                  ¡Ahorrás {formatPrice(savings)}!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Análisis de Precios */}
        {salePrice > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Precio Final */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-medium text-blue-600 mb-1">
                PRECIO FINAL
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {formatPrice(finalPrice)}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {hasPromo ? 'Con descuento aplicado' : 'Precio regular'}
              </p>
            </div>

            {/* Ganancia */}
            {cost > 0 && profit > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-medium text-green-600 mb-1">
                  GANANCIA
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatPrice(profit)}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Margen: {profitMargin}%
                </p>
              </div>
            )}

            {/* Descuento */}
            {hasPromo && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs font-medium text-red-600 mb-1">
                  DESCUENTO
                </p>
                <p className="text-2xl font-bold text-red-900">{discount}%</p>
                <p className="text-xs text-red-700 mt-1">
                  Ahorro: {formatPrice(savings)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Información importante */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-yellow-600 text-xl mr-3">💡</span>
            <div>
              <h4 className="text-sm font-medium text-yellow-900 mb-1">
                Importante sobre precios
              </h4>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>
                  • Este es el <strong>precio base</strong> del producto
                </li>
                <li>
                  • En el Paso 3 (Variantes), algunos talles/colores pueden
                  tener <strong>ajustes de precio</strong>
                </li>
                <li>
                  • Por ejemplo: XL puede costar $500 más, o color premium +$300
                </li>
                <li>• El precio final = Precio base + Ajustes de variante</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tips de pricing */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-blue-600 text-xl mr-3">📊</span>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Tips de precios
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  • <strong>Precio psicológico:</strong> Usa precios terminados
                  en .99 o .95
                </li>
                <li>
                  • <strong>Competencia:</strong> Investiga precios similares en
                  el mercado
                </li>
                <li>
                  • <strong>Margen saludable:</strong> Apunta a 40-60% de margen
                  para cubrir gastos
                </li>
                <li>
                  • <strong>Descuentos:</strong> Los descuentos del 20-30%
                  generan más ventas
                </li>
                <li>
                  • <strong>Costo:</strong> Incluye material, producción y
                  gastos operativos
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-6 py-4 bg-gray-50 flex justify-between items-center rounded-b-lg">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium transition-colors"
        >
          ← Atrás
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Guardando...' : 'Continuar →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step5Price;
