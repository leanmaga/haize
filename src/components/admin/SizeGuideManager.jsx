// src/components/admin/SizeGuideManager.jsx
'use client';

import { useState, useEffect } from 'react';

/**
 * Componente para gestionar las guías de talles desde el panel de administración
 * Permite editar medidas de cada categoría de productos
 */
export default function SizeGuideManager() {
  const [guides, setGuides] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingGuide, setEditingGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = [
    { value: 'remeras', label: 'Remeras' },
    { value: 'camisas', label: 'Camisas' },
    { value: 'musculosas', label: 'Musculosas' },
    { value: 'shorts', label: 'Shorts' },
    { value: 'conjuntos', label: 'Conjuntos' },
  ];

  const availableSizes = ['M', 'L', 'XL', 'XXL', 'XXXL'];

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const response = await fetch('/api/size-guides');
      const data = await response.json();

      if (data.success) {
        setGuides(data.guides);
      }
    } catch (error) {
      console.error('Error al cargar guías:', error);
      alert('Error al cargar las guías de talles');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (category) => {
    const guide = guides.find((g) => g.category === category);

    if (guide) {
      setEditingGuide({ ...guide });
    } else {
      // Crear nueva guía vacía
      setEditingGuide({
        category,
        description: 'Todas las medidas están en centímetros (cm)',
        measurements: [],
        notes: '',
        isActive: true,
      });
    }

    setSelectedCategory(category);
  };

  const handleAddSize = () => {
    if (!editingGuide) return;

    setEditingGuide({
      ...editingGuide,
      measurements: [
        ...editingGuide.measurements,
        { size: 'M', length: 0, width: 0, stretchedWidth: null },
      ],
    });
  };

  const handleRemoveSize = (index) => {
    if (!editingGuide) return;

    const newMeasurements = editingGuide.measurements.filter(
      (_, i) => i !== index,
    );
    setEditingGuide({
      ...editingGuide,
      measurements: newMeasurements,
    });
  };

  // Función removida - ahora se maneja directamente en los inputs

  const handleSaveGuide = async () => {
    if (!editingGuide) return;

    setSaving(true);

    try {
      const url = editingGuide._id
        ? `/api/size-guides/${editingGuide._id}`
        : '/api/size-guides';

      const method = editingGuide._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGuide),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Guía guardada exitosamente');
        await fetchGuides();
      } else {
        alert('❌ Error al guardar: ' + data.message);
      }
    } catch (error) {
      console.error('Error al guardar guía:', error);
      alert('Error al guardar la guía');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📏 Guías de Talles
        </h1>
        <p className="text-gray-600">
          Gestiona las medidas físicas de cada categoría de productos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar - Lista de categorías */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Categorías</h2>
            <div className="space-y-2">
              {categories.map((cat) => {
                const hasGuide = guides.some((g) => g.category === cat.value);
                const isSelected = selectedCategory === cat.value;

                return (
                  <button
                    key={cat.value}
                    onClick={() => handleSelectCategory(cat.value)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cat.label}</span>
                      {hasGuide && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          ✓
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content - Editor de medidas */}
        <div className="md:col-span-3">
          {!selectedCategory ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">
                Selecciona una categoría para editar sus medidas
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {getCategoryLabel(selectedCategory)}
                </h2>
                <button
                  onClick={handleSaveGuide}
                  disabled={saving}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
              </div>

              {editingGuide && (
                <>
                  {/* Descripción */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={editingGuide.description || ''}
                      onChange={(e) =>
                        setEditingGuide({
                          ...editingGuide,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ej: Todas las medidas están en centímetros"
                    />
                  </div>

                  {/* Tabla de medidas */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Medidas por Talle
                      </h3>
                      <button
                        onClick={handleAddSize}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        + Agregar Talle
                      </button>
                    </div>

                    {editingGuide.measurements.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 mb-2">
                          No hay talles agregados
                        </p>
                        <button
                          onClick={handleAddSize}
                          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                        >
                          + Agregar primer talle
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                Talle
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                Largo (cm)
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                Ancho (cm)
                              </th>
                              {selectedCategory === 'shorts' && (
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                  Ancho Estirado (cm)
                                </th>
                              )}
                              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {editingGuide.measurements.map(
                              (measurement, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3">
                                    <select
                                      value={measurement.size}
                                      onChange={(e) => {
                                        const newMeasurements = [
                                          ...editingGuide.measurements,
                                        ];
                                        newMeasurements[index].size =
                                          e.target.value;
                                        setEditingGuide({
                                          ...editingGuide,
                                          measurements: newMeasurements,
                                        });
                                      }}
                                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                      {availableSizes.map((size) => (
                                        <option key={size} value={size}>
                                          {size}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="number"
                                      value={measurement.length || ''}
                                      onChange={(e) => {
                                        const newMeasurements = [
                                          ...editingGuide.measurements,
                                        ];
                                        newMeasurements[index].length =
                                          e.target.value === ''
                                            ? 0
                                            : parseFloat(e.target.value) || 0;
                                        setEditingGuide({
                                          ...editingGuide,
                                          measurements: newMeasurements,
                                        });
                                      }}
                                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                      placeholder="70"
                                      min="0"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="number"
                                      value={measurement.width || ''}
                                      onChange={(e) => {
                                        const newMeasurements = [
                                          ...editingGuide.measurements,
                                        ];
                                        newMeasurements[index].width =
                                          e.target.value === ''
                                            ? 0
                                            : parseFloat(e.target.value) || 0;
                                        setEditingGuide({
                                          ...editingGuide,
                                          measurements: newMeasurements,
                                        });
                                      }}
                                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                      placeholder="52"
                                      min="0"
                                    />
                                  </td>
                                  {selectedCategory === 'shorts' && (
                                    <td className="px-4 py-3">
                                      <input
                                        type="number"
                                        value={measurement.stretchedWidth || ''}
                                        onChange={(e) => {
                                          const newMeasurements = [
                                            ...editingGuide.measurements,
                                          ];
                                          newMeasurements[
                                            index
                                          ].stretchedWidth =
                                            e.target.value === ''
                                              ? null
                                              : parseFloat(e.target.value) || 0;
                                          setEditingGuide({
                                            ...editingGuide,
                                            measurements: newMeasurements,
                                          });
                                        }}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="60"
                                        min="0"
                                      />
                                    </td>
                                  )}
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => handleRemoveSize(index)}
                                      className="text-red-600 hover:text-red-800 transition-colors"
                                      title="Eliminar talle"
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Notas adicionales */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas Adicionales
                    </label>
                    <textarea
                      value={editingGuide.notes || ''}
                      onChange={(e) =>
                        setEditingGuide({
                          ...editingGuide,
                          notes: e.target.value,
                        })
                      }
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ej: Medidas tomadas de forma recta sobre superficie plana"
                    />
                  </div>

                  {/* Estado activo/inactivo */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editingGuide.isActive}
                      onChange={(e) =>
                        setEditingGuide({
                          ...editingGuide,
                          isActive: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Mostrar esta guía en el sitio
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
