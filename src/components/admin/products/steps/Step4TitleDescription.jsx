// components/admin/products/steps/Step4TitleDescription.jsx
'use client';

import React, { useState, useEffect } from 'react';

const Step4TitleDescription = ({
  data,
  onNext,
  onBack,
  onCancel,
  updateData,
  loading,
  errors,
}) => {
  const [formData, setFormData] = useState({
    title: data.title || '',
    description: data.description || '',
    featured: Boolean(data.featured),
  });

  const [formErrors, setFormErrors] = useState({});
  // Actualizar datos en el componente padre
  useEffect(() => {
    updateData(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar errores
    setFormErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const toggleFeatured = () => {
    setFormData((prev) => ({
      ...prev,
      featured: !prev.featured,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar título
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.length < 10) {
      newErrors.title = 'El título debe tener al menos 10 caracteres';
    } else if (formData.title.length > 150) {
      newErrors.title = 'El título no puede exceder 150 caracteres';
    }

    // Validar descripción (opcional pero con límites)
    if (formData.description.trim()) {
      if (formData.description.length < 20) {
        newErrors.description =
          'Si incluyes descripción, debe tener al menos 20 caracteres';
      } else if (formData.description.length > 2000) {
        newErrors.description =
          'La descripción no puede exceder 2000 caracteres';
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    await onNext(formData);
  };

  const titleCharCount = formData.title.length;
  const descCharCount = formData.description.length;

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Título y Descripción
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Define cómo se verá tu producto en la tienda
        </p>
      </div>

      {/* Contenido */}
      <div className="px-6 py-6 space-y-6">
        {/* Título del producto */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Título del producto *
            </label>
            <span
              className={`text-xs ${
                titleCharCount > 150
                  ? 'text-red-600'
                  : titleCharCount > 130
                    ? 'text-yellow-600'
                    : 'text-gray-500'
              }`}
            >
              {titleCharCount}/150 caracteres
            </span>
          </div>

          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ej: Short Deportivo Negro"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              formErrors.title
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />

          {formErrors.title && (
            <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>
          )}

        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={toggleFeatured}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Producto destacado
          </span>
        </label>

        {/* Descripción del producto */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción (opcional)
            </label>
            <span
              className={`text-xs ${
                descCharCount > 2000
                  ? 'text-red-600'
                  : descCharCount > 1800
                    ? 'text-yellow-600'
                    : 'text-gray-500'
              }`}
            >
              {descCharCount}/2000 caracteres
            </span>
          </div>

          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe las características, materiales, beneficios y usos del producto..."
            rows={8}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-y ${
              formErrors.description
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />

          {formErrors.description && (
            <p className="text-sm text-red-600 mt-1">
              {formErrors.description}
            </p>
          )}

        </div>

        {/* Vista previa */}
        {formData.title && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">
              VISTA PREVIA:
            </p>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {formData.title}
              </h3>

              {formData.description && (
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {formData.description}
                </p>
              )}

              {!formData.description && (
                <p className="text-sm text-gray-400 italic">Sin descripción</p>
              )}
            </div>
          </div>
        )}

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

export default Step4TitleDescription;
