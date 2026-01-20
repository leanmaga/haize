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
  });

  const [formErrors, setFormErrors] = useState({});
  const [useAutoTitle, setUseAutoTitle] = useState(!data.title);

  // Generar título automático basado en datos previos
  const generateAutoTitle = () => {
    const parts = [];

    if (data.brand) parts.push(data.brand);
    if (data.model) parts.push(data.model);
    if (data.gender) parts.push(`- ${data.gender}`);

    return parts.join(' ');
  };

  const autoTitle = generateAutoTitle();

  // Si está activo el título automático, actualizarlo cuando cambian los datos
  useEffect(() => {
    if (useAutoTitle) {
      setFormData((prev) => ({
        ...prev,
        title: autoTitle,
      }));
    }
  }, [useAutoTitle, autoTitle]);

  // Actualizar datos en el componente padre
  useEffect(() => {
    updateData(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Si editan el título manualmente, desactivar auto-título
    if (field === 'title' && useAutoTitle) {
      setUseAutoTitle(false);
    }

    // Limpiar errores
    setFormErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const toggleAutoTitle = () => {
    setUseAutoTitle((prev) => {
      const newValue = !prev;
      if (newValue) {
        // Activar: usar título automático
        setFormData((prev) => ({
          ...prev,
          title: autoTitle,
        }));
      }
      return newValue;
    });
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

  // Plantillas de descripción sugeridas
  const descriptionTemplates = {
    remeras: `Remera de alta calidad, perfecta para el día a día. Confeccionada con materiales premium que garantizan comodidad y durabilidad. Diseño versátil que combina con cualquier outfit.`,
    camisas: `Camisa elegante y moderna, ideal para cualquier ocasión. Tela de primera calidad con excelente caída. Diseño atemporal que nunca pasa de moda.`,
    pantalones: `Pantalón cómodo y resistente, pensado para acompañarte todo el día. Confección de calidad superior con atención al detalle. Ajuste perfecto y estilo inigualable.`,
    shorts: `Short deportivo de alto rendimiento. Material transpirable que te mantiene fresco. Diseño funcional con bolsillos estratégicos. Perfecto para entrenamiento o uso casual.`,
    musculosas: `Musculosa de máxima comodidad, ideal para entrenar o días de calor. Tela ligera y resistente. Diseño que favorece la libertad de movimiento.`,
    conjuntos: `Conjunto completo que combina estilo y comodidad. Prendas coordinadas con materiales de primera. Look completo listo para usar.`,
  };

  const getSuggestedDescription = () => {
    return descriptionTemplates[data.category] || descriptionTemplates.remeras;
  };

  const useSuggestedDescription = () => {
    setFormData((prev) => ({
      ...prev,
      description: getSuggestedDescription(),
    }));
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
            placeholder="Ej: Haize - Short Deportivo Negro - Hombre"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              formErrors.title
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            disabled={useAutoTitle}
          />

          {formErrors.title && (
            <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>
          )}

          {/* Checkbox para usar título automático */}
          <div className="mt-3 flex items-start">
            <input
              type="checkbox"
              id="useAutoTitle"
              checked={useAutoTitle}
              onChange={toggleAutoTitle}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useAutoTitle" className="ml-2">
              <span className="text-sm font-medium text-gray-700">
                Usar título automático
              </span>
              {useAutoTitle && (
                <p className="text-xs text-gray-500 mt-1">
                  El título se genera automáticamente:{' '}
                  <strong>{autoTitle}</strong>
                </p>
              )}
            </label>
          </div>

          {!useAutoTitle && (
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Incluye marca, modelo y características clave. Los buenos
              títulos ayudan a los clientes a encontrar tu producto.
            </p>
          )}
        </div>

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

          {/* Botón para usar descripción sugerida */}
          {!formData.description && (
            <button
              type="button"
              onClick={useSuggestedDescription}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              💡 Usar descripción sugerida
            </button>
          )}

          <p className="text-xs text-gray-500 mt-2">
            💡 Tips para una buena descripción:
          </p>
          <ul className="text-xs text-gray-500 mt-1 ml-4 space-y-1">
            <li>• Menciona los materiales y su calidad</li>
            <li>• Describe el ajuste y la comodidad</li>
            <li>• Incluye instrucciones de cuidado</li>
            <li>• Destaca características únicas</li>
            <li>• Usa viñetas para mejor legibilidad</li>
          </ul>
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

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-blue-600 text-xl mr-3">ℹ️</span>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                ¿Por qué son importantes el título y descripción?
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  • <strong>Título:</strong> Es lo primero que ven los clientes.
                  Debe ser claro y descriptivo.
                </li>
                <li>
                  • <strong>Descripción:</strong> Ayuda a los clientes a
                  decidir. Incluye detalles que fotos no pueden mostrar.
                </li>
                <li>
                  • <strong>SEO:</strong> Buenos textos mejoran tu
                  posicionamiento en búsquedas.
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

export default Step4TitleDescription;
