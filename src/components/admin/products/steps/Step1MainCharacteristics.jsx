// components/admin/products/steps/Step1MainCharacteristics.jsx
'use client';

import React, { useState, useEffect } from 'react';

const Step1MainCharacteristics = ({
  data,
  onNext,
  onBack,
  onCancel,
  updateData,
  loading,
  errors,
  isFirstStep,
}) => {
  const [formData, setFormData] = useState({
    brand: data.brand || 'Haize',
    model: data.model || '',
    gender: data.gender || '',
    category: data.category || '', // NUEVO: Categoría de producto
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    updateData(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo
    setFormErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.model.trim()) {
      newErrors.model = 'El modelo es requerido';
    } else if (formData.model.length < 2 || formData.model.length > 100) {
      newErrors.model = 'El modelo debe tener entre 2 y 100 caracteres';
    }

    if (!formData.gender) {
      newErrors.gender = 'El género es requerido';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    const success = await onNext(formData);
  };

  const genderOptions = [
    { value: 'Hombre', label: 'Hombre' },
    { value: 'Mujer', label: 'Mujer' },
    { value: 'Unisex', label: 'Unisex' },
    { value: 'Niño', label: 'Niño' },
    { value: 'Niña', label: 'Niña' },
  ];

  // NUEVO: Opciones de categoría
  const categoryOptions = [
    { value: 'remeras', label: 'Remeras', icon: '👕' },
    { value: 'camisas', label: 'Camisas', icon: '👔' },
    { value: 'pantalones', label: 'Pantalones', icon: '👖' },
    { value: 'shorts', label: 'Shorts', icon: '🩳' },
    { value: 'musculosas', label: 'Musculosas', icon: '🎽' },
    { value: 'conjuntos', label: 'Conjuntos', icon: '🧥' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Características principales
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Ingresa los datos básicos del producto
        </p>
      </div>

      {/* Contenido */}
      <div className="px-6 py-6 space-y-6">
        {/* Marca (fijo) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marca *
          </label>
          <input
            type="text"
            value={formData.brand}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">La marca es fija: Haize</p>
        </div>

        {/* NUEVO: Categoría de producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de prenda *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('category', option.value)}
                className={`
                  relative p-4 border-2 rounded-lg text-left transition-all
                  ${
                    formData.category === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium text-gray-900">
                    {option.label}
                  </span>
                </div>
                {formData.category === option.value && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ✓
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          {formErrors.category && (
            <p className="text-sm text-red-600 mt-1">{formErrors.category}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Esto determinará la tabla de medidas en el siguiente paso
          </p>
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modelo del producto *
          </label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="Ej: Short Deportivo"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              formErrors.model
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {formErrors.model && (
            <p className="text-sm text-red-600 mt-1">{formErrors.model}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Nombre específico del modelo (2-100 caracteres)
          </p>
        </div>

        {/* Género */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Género *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('gender', option.value)}
                className={`
                  px-4 py-2 border-2 rounded-md font-medium transition-all
                  ${
                    formData.gender === option.value
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-blue-300'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
          {formErrors.gender && (
            <p className="text-sm text-red-600 mt-1">{formErrors.gender}</p>
          )}
        </div>

        {/* Vista previa */}
        {formData.model && formData.gender && formData.category && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Vista previa:
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {categoryOptions.find((c) => c.value === formData.category)?.icon}{' '}
              {formData.brand} - {formData.model} ({formData.gender})
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Categoría:{' '}
              {
                categoryOptions.find((c) => c.value === formData.category)
                  ?.label
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-6 py-4 bg-gray-50 flex justify-between items-center rounded-b-lg">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Guardando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
};

export default Step1MainCharacteristics;
