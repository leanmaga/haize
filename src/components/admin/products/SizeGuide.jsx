// components/admin/products/SizeGuide.jsx
'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Info, Save } from 'lucide-react';

const SizeGuide = ({
  productId = null,
  productName = '',
  onSave,
  initialData = null,
}) => {
  const [guideName, setGuideName] = useState(initialData?.name || '');
  const [measurementMethod, setMeasurementMethod] = useState(
    initialData?.method || '',
  );
  const [sizes, setSizes] = useState(initialData?.sizes || []);
  const [saving, setSaving] = useState(false);

  // Opciones de equivalencias comunes
  const commonEquivalencies = {
    XS: ['XS', 'Extra Small'],
    S: ['S', 'Small', 'Chico'],
    M: ['M', 'Medium', 'Mediano'],
    L: ['L', 'Large', 'Grande'],
    XL: ['XL', 'Extra Large'],
    XXL: ['XXL', '2XL'],
    XXXL: ['XXXL', '3XL'],
    36: ['36', 'S'],
    38: ['38', 'M'],
    40: ['40', 'L'],
    42: ['42', 'XL'],
  };

  // Campos según el método seleccionado
  const measurementFields = {
    corporales: [
      {
        key: 'bustCircumference',
        label: 'Contorno del pecho (cm)',
        required: true,
      },
      {
        key: 'waistCircumference',
        label: 'Contorno de la cintura (cm)',
        required: false,
      },
      { key: 'height', label: 'Altura de la persona (cm)', required: false },
      {
        key: 'hipCircumference',
        label: 'Contorno de la cadera (cm)',
        required: false,
      },
      {
        key: 'neckCircumference',
        label: 'Contorno del cuello (cm)',
        required: false,
      },
    ],
    prenda: [
      {
        key: 'chestWidth',
        label: 'Ancho de pecho de la prenda (cm)',
        required: true,
      },
      { key: 'length', label: 'Largo de la prenda (cm)', required: false },
      {
        key: 'shoulderWidth',
        label: 'Ancho del hombro de la prenda (cm)',
        required: false,
      },
      {
        key: 'sleeveLength',
        label: 'Largo de la manga de la prenda (cm)',
        required: false,
      },
    ],
    ambas: [
      {
        key: 'bustCircumference',
        label: 'Contorno del pecho (cm)',
        required: true,
      },
      {
        key: 'waistCircumference',
        label: 'Contorno de la cintura (cm)',
        required: false,
      },
      { key: 'height', label: 'Altura de la persona (cm)', required: false },
      {
        key: 'hipCircumference',
        label: 'Contorno de la cadera (cm)',
        required: false,
      },
      {
        key: 'neckCircumference',
        label: 'Contorno del cuello (cm)',
        required: false,
      },
      {
        key: 'chestWidth',
        label: 'Ancho de pecho de la prenda (cm)',
        required: true,
      },
      { key: 'length', label: 'Largo de la prenda (cm)', required: false },
      {
        key: 'shoulderWidth',
        label: 'Ancho del hombro de la prenda (cm)',
        required: false,
      },
      {
        key: 'sleeveLength',
        label: 'Largo de la manga de la prenda (cm)',
        required: false,
      },
    ],
  };

  const addNewSize = () => {
    const newSize = {
      id: Date.now(),
      labelSize: '',
      equivalencies: [],
      bodyMeasurements: {},
      garmentMeasurements: {},
    };
    setSizes([...sizes, newSize]);
  };

  const removeSize = (id) => {
    if (sizes.length === 1) {
      alert('Debe haber al menos un talle');
      return;
    }
    setSizes(sizes.filter((size) => size.id !== id));
  };

  const updateSize = (id, field, value) => {
    setSizes(
      sizes.map((size) => {
        if (size.id === id) {
          if (field === 'labelSize') {
            return {
              ...size,
              labelSize: value,
              equivalencies: commonEquivalencies[value] || [value],
            };
          } else if (field.startsWith('body_')) {
            const measurementKey = field.replace('body_', '');
            return {
              ...size,
              bodyMeasurements: {
                ...size.bodyMeasurements,
                [measurementKey]: parseFloat(value) || 0,
              },
            };
          } else if (field.startsWith('garment_')) {
            const measurementKey = field.replace('garment_', '');
            return {
              ...size,
              garmentMeasurements: {
                ...size.garmentMeasurements,
                [measurementKey]: parseFloat(value) || 0,
              },
            };
          }
        }
        return size;
      }),
    );
  };

  const validateForm = () => {
    if (!guideName.trim()) {
      alert('El nombre de la guía es requerido');
      return false;
    }

    if (!measurementMethod) {
      alert('Selecciona un método de medición');
      return false;
    }

    if (sizes.length === 0) {
      alert('Agrega al menos un talle');
      return false;
    }

    // Validar que todos los talles tengan labelSize
    const invalidSizes = sizes.filter((size) => !size.labelSize.trim());
    if (invalidSizes.length > 0) {
      alert('Todos los talles deben tener una etiqueta');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const sizeGuideData = {
        productId,
        name: guideName,
        method: measurementMethod,
        sizes: sizes.map((size) => ({
          labelSize: size.labelSize,
          equivalencies: size.equivalencies,
          bodyMeasurements: size.bodyMeasurements || {},
          garmentMeasurements: size.garmentMeasurements || {},
        })),
      };

      const url = initialData?._id
        ? `/api/size-guides/${initialData._id}`
        : '/api/size-guides';

      const method = initialData?._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sizeGuideData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error guardando guía de talles');
      }

      const result = await response.json();

      alert(
        initialData?._id
          ? 'Guía de talles actualizada exitosamente'
          : 'Guía de talles creada exitosamente',
      );

      if (onSave) {
        onSave(result.sizeGuide);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const activeFields = measurementFields[measurementMethod] || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Guía de Talles</h2>
        <p className="text-sm text-gray-600 mt-1">
          {productName
            ? `Crear guía de talles para: ${productName}`
            : 'Crear una nueva guía de talles'}
        </p>
      </div>

      {/* Nombre de la guía */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de la guía <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={guideName}
          onChange={(e) => setGuideName(e.target.value)}
          placeholder="Ej: Remeras Haize Hombre"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Método de medición */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de medición <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="corporales"
              checked={measurementMethod === 'corporales'}
              onChange={(e) => setMeasurementMethod(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Medidas corporales</span>
            <Info className="w-4 h-4 ml-2 text-gray-400" />
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="prenda"
              checked={measurementMethod === 'prenda'}
              onChange={(e) => setMeasurementMethod(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Medidas de la prenda</span>
            <Info className="w-4 h-4 ml-2 text-gray-400" />
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="ambas"
              checked={measurementMethod === 'ambas'}
              onChange={(e) => setMeasurementMethod(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">Ambas</span>
            <Info className="w-4 h-4 ml-2 text-gray-400" />
          </label>
        </div>
      </div>

      {/* Talles */}
      {measurementMethod && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Talles</h3>
            <button
              onClick={addNewSize}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Talle
            </button>
          </div>

          {sizes.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No hay talles agregados</p>
              <button
                onClick={addNewSize}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Agregar el primer talle
              </button>
            </div>
          )}

          <div className="space-y-4">
            {sizes.map((size, index) => (
              <div
                key={size.id}
                className="border border-gray-300 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">
                    Talle {index + 1}
                  </h4>
                  <button
                    onClick={() => removeSize(size.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Etiqueta del talle */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Talle <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={size.labelSize}
                    onChange={(e) =>
                      updateSize(size.id, 'labelSize', e.target.value)
                    }
                    placeholder="Ej: S, M, L, 38, 40"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {size.equivalencies.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Equivalencias: {size.equivalencies.join(', ')}
                    </p>
                  )}
                </div>

                {/* Medidas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={
                          field.key.includes('bust') ||
                          field.key.includes('waist') ||
                          field.key.includes('hip') ||
                          field.key.includes('neck') ||
                          field.key.includes('height')
                            ? size.bodyMeasurements?.[field.key] || ''
                            : size.garmentMeasurements?.[field.key] || ''
                        }
                        onChange={(e) =>
                          updateSize(
                            size.id,
                            field.key.includes('bust') ||
                              field.key.includes('waist') ||
                              field.key.includes('hip') ||
                              field.key.includes('neck') ||
                              field.key.includes('height')
                              ? `body_${field.key}`
                              : `garment_${field.key}`,
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving
            ? 'Guardando...'
            : initialData?._id
              ? 'Actualizar Guía'
              : 'Guardar Guía'}
        </button>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">
              Consejos para crear una buena guía de talles:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Usa medidas precisas y consistentes</li>
              <li>Agrega todos los talles que ofreces</li>
              <li>Las equivalencias ayudan a los compradores a elegir mejor</li>
              <li>Puedes editar esta guía después de crearla</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
