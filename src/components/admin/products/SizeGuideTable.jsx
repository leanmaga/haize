// components/admin/products/SizeGuideTable.jsx - VERSION CORREGIDA
'use client';

import React, { useState } from 'react';
import { Info, Plus, Trash2 } from 'lucide-react';

// Definir plantillas de medidas según categoría de producto
const MEASUREMENT_TEMPLATES = {
  // PANTALONES
  pantalones: {
    name: 'Pantalones',
    defaultSizes: ['28', '30', '32', '34', '36', '38', '40', '42'],
    columns: [
      {
        key: 'length',
        label: 'Largo total',
        unit: 'cm',
        tooltip: 'Desde la cintura hasta el bajo',
      },
      {
        key: 'waist',
        label: 'Cintura',
        unit: 'cm',
        tooltip: 'Contorno de cintura',
      },
      {
        key: 'hip',
        label: 'Cadera',
        unit: 'cm',
        tooltip: 'Contorno de cadera',
      },
      {
        key: 'inseam',
        label: 'Tiro',
        unit: 'cm',
        tooltip: 'Desde la entrepierna hasta el bajo',
      },
      { key: 'thigh', label: 'Pierna', unit: 'cm', tooltip: 'Ancho de pierna' },
    ],
  },

  // REMERAS Y CAMISAS
  remeras: {
    name: 'Remeras/Camisas',
    defaultSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    columns: [
      {
        key: 'length',
        label: 'Largo total',
        unit: 'cm',
        tooltip: 'Desde el hombro hasta el bajo',
      },
      {
        key: 'chest',
        label: 'Ancho de pecho',
        unit: 'cm',
        tooltip: 'De axila a axila',
      },
      {
        key: 'shoulder',
        label: 'Ancho de hombro',
        unit: 'cm',
        tooltip: 'De hombro a hombro',
      },
      {
        key: 'sleeve',
        label: 'Largo de manga',
        unit: 'cm',
        tooltip: 'Desde el hombro',
      },
    ],
  },
};

const normalizeCategory = (category) => {
  if (!category || typeof category !== 'string') {
    return 'remeras';
  }

  const normalized = category.toLowerCase().trim();

  const categoryMap = {
    pantalon: 'pantalones',
    pantalones: 'pantalones',
    pants: 'pantalones',
    jean: 'pantalones',
    jeans: 'pantalones',
    remera: 'remeras',
    remeras: 'remeras',
    camisa: 'remeras',
    camisas: 'remeras',
    short: 'pantalones',
    shorts: 'pantalones',
    musculosa: 'remeras',
    musculosas: 'remeras',
  };

  return categoryMap[normalized] || 'remeras';
};

const SizeGuideTable = ({
  category = 'remeras',
  productName = '',
  productCategory = '',
  onSave,
  initialData = null,
}) => {
  // ✅ NORMALIZAR CATEGORÍA ANTES DE USAR
  const normalizedCategory = normalizeCategory(category);
  const template = MEASUREMENT_TEMPLATES[normalizedCategory];

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎨 [SIZE GUIDE TABLE] Inicializando');
  console.log('📋 Props recibidas:', {
    category,
    productCategory,
    productName,
  });
  console.log('🔍 [CRÍTICO] category original:', category);
  console.log('🔍 [CRÍTICO] category normalizada:', normalizedCategory);
  console.log('📐 Template seleccionado:', template.name);
  console.log(
    '📊 Columnas del template:',
    template.columns.map((c) => `${c.key} (${c.label})`),
  );
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Estado inicial: crear filas con los talles por defecto
  const [guideName, setGuideName] = useState(
    initialData?.name || `Guía ${template.name} - ${productName}`,
  );

  const [rows, setRows] = useState(() => {
    if (initialData?.sizes && initialData.sizes.length > 0) {
      return initialData.sizes.map((size) => ({
        id: size.id || Date.now() + Math.random(),
        labelSize: size.labelSize,
        measurements: size.garmentMeasurements || {},
      }));
    }

    // Crear filas vacías con los talles por defecto
    return template.defaultSizes.map((size, index) => ({
      id: Date.now() + index,
      labelSize: size,
      measurements: {},
    }));
  });

  const [equivalenciesEnabled, setEquivalenciesEnabled] = useState(false);

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: Date.now(),
        labelSize: '',
        measurements: {},
      },
    ]);
  };

  const removeRow = (id) => {
    if (rows.length <= 1) {
      alert('Debe haber al menos un talle');
      return;
    }
    setRows(rows.filter((row) => row.id !== id));
  };

  const updateRow = (id, field, value) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✏️ [UPDATE ROW] Actualizando fila');
    console.log('   ID:', id);
    console.log('   Campo:', field);
    console.log('   Valor:', value);
    console.log('   Tipo:', typeof value);

    setRows(
      rows.map((row) => {
        if (row.id === id) {
          if (field === 'labelSize') {
            console.log('   → Actualizando labelSize');
            return { ...row, labelSize: value };
          } else {
            // Es una medida
            // ✅ FIX: Manejar correctamente valores vacíos
            const parsedValue =
              value === '' || value === null || value === undefined
                ? null
                : parseFloat(value);

            console.log('   → Actualizando medida:', field);
            console.log('   → Valor parseado:', parsedValue);

            const newMeasurements = {
              ...row.measurements,
              [field]: parsedValue,
            };

            console.log('   → Nuevas medidas completas:', newMeasurements);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            return {
              ...row,
              measurements: newMeasurements,
            };
          }
        }
        return row;
      }),
    );
  };

  const handleSave = () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💾 [SAVE] Iniciando guardado');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Validar
    if (!guideName.trim()) {
      alert('Por favor ingresa un nombre para la guía');
      return;
    }

    const invalidRow = rows.find((r) => !r.labelSize.trim());
    if (invalidRow) {
      alert('Todos los talles deben tener un nombre');
      return;
    }

    console.log('📊 Estado actual de rows:', rows);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Convertir a formato del backend
    const sizes = rows.map((row) => {
      console.log('🔄 Procesando fila:', {
        labelSize: row.labelSize,
        measurements: row.measurements,
        measurementsKeys: Object.keys(row.measurements),
        measurementsValues: Object.values(row.measurements),
      });

      // ✅ FILTRAR valores null/undefined pero MANTENER 0 y números válidos
      const cleanedMeasurements = {};
      Object.keys(row.measurements).forEach((key) => {
        const value = row.measurements[key];
        // Solo incluir si es un número válido (incluyendo 0)
        if (typeof value === 'number' && !isNaN(value)) {
          cleanedMeasurements[key] = value;
        }
      });

      console.log('✨ Medidas limpiadas:', cleanedMeasurements);

      return {
        labelSize: row.labelSize,
        equivalencies: [row.labelSize],
        garmentMeasurements: cleanedMeasurements,
        bodyMeasurements: {},
      };
    });

    const sizeGuideData = {
      name: guideName.trim(),
      method: 'prenda',
      category: normalizedCategory, // ✅ Usar categoría normalizada
      sizes: sizes,
    };

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 Payload completo a enviar:');
    console.log(JSON.stringify(sizeGuideData, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Verificación de sizes[0]:');
    if (sizes[0]) {
      console.log('   labelSize:', sizes[0].labelSize);
      console.log('   garmentMeasurements:', sizes[0].garmentMeasurements);
      console.log(
        '   Keys en garmentMeasurements:',
        Object.keys(sizes[0].garmentMeasurements),
      );
      console.log(
        '   Values en garmentMeasurements:',
        Object.values(sizes[0].garmentMeasurements),
      );
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    onSave(sizeGuideData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tabla de Medidas: {template.name}
        </h3>
        <p className="text-sm text-gray-600">
          Completa las medidas en centímetros para cada talle
        </p>
      </div>

      {/* ✅ INDICADOR VISUAL DE CATEGORÍA */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-blue-900">
            Categoría detectada:
          </span>
          <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
            {normalizedCategory}
          </span>
          <span className="text-blue-700">→ {template.name}</span>
        </div>
      </div>

      {/* Nombre de la guía */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la guía *
        </label>
        <input
          type="text"
          value={guideName}
          onChange={(e) => setGuideName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Remeras Haize Hombre"
        />
      </div>

      {/* Tabla de medidas */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header de la tabla */}
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">
                  Talle
                  <div className="text-[10px] text-blue-600 font-normal normal-case mt-0.5">
                    TALLE PRINCIPAL
                  </div>
                </th>

                {equivalenciesEnabled && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-40">
                    Equivalencias
                  </th>
                )}

                {template.columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.tooltip && (
                        <div className="group relative">
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                          <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg bottom-full left-1/2 -translate-x-1/2 mb-1">
                            {col.tooltip}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 font-normal normal-case mt-0.5">
                      ({col.unit}) - key: {col.key}
                    </div>
                  </th>
                ))}

                <th className="px-3 py-3 w-12"></th>
              </tr>
            </thead>

            {/* Body de la tabla */}
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row, rowIndex) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {/* Talle */}
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.labelSize}
                      onChange={(e) =>
                        updateRow(row.id, 'labelSize', e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      placeholder="Ej: M"
                    />
                  </td>

                  {/* Equivalencias (si está habilitado) */}
                  {equivalenciesEnabled && (
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        placeholder="Ej: Medium, 38"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  )}

                  {/* Medidas */}
                  {template.columns.map((col) => (
                    <td key={col.key} className="px-3 py-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={row.measurements[col.key] ?? ''}
                        onChange={(e) =>
                          updateRow(row.id, col.key, e.target.value)
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        placeholder="0"
                      />
                      <div className="text-[9px] text-gray-400 mt-0.5">
                        {row.measurements[col.key] != null ? '✓' : '-'}
                      </div>
                    </td>
                  ))}

                  {/* Eliminar */}
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar fila"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Agregar talle */}
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-300">
          <button
            type="button"
            onClick={addRow}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
          >
            <Plus className="h-4 w-4" />
            Agregar talle
          </button>
        </div>
      </div>

      {/* Info y opciones */}
      <div className="space-y-3">
        {/* Toggle equivalencias */}
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={equivalenciesEnabled}
            onChange={(e) => setEquivalenciesEnabled(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Agregar equivalencias (ej: M = Medium = 38)</span>
        </label>

        {/* Ayuda */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Consejos para medir:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Mide la prenda extendida sobre una superficie plana</li>
                <li>Usa una cinta métrica flexible</li>
                <li>Las medidas son en centímetros</li>
                <li>Puedes dejar campos vacíos si no aplican</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Debug actual state */}
        <details className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <summary className="text-xs font-medium cursor-pointer">
            🐛 Debug - Estado Actual
          </summary>
          <div className="mt-2 space-y-2">
            <div className="text-xs">
              <strong>Categoría original:</strong> {category}
            </div>
            <div className="text-xs">
              <strong>Categoría normalizada:</strong> {normalizedCategory}
            </div>
            <div className="text-xs">
              <strong>Template usado:</strong> {template.name}
            </div>
            <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
              {JSON.stringify(rows, null, 2)}
            </pre>
          </div>
        </details>
      </div>

      {/* Botón guardar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
        >
          Guardar Guía de Talles
        </button>
      </div>
    </div>
  );
};

export default SizeGuideTable;
