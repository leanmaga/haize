// components/admin/products/steps/Step2SizeGuide.jsx - VERSIÓN CORREGIDA
'use client';

import React, { useState, useEffect } from 'react';
import { Check, Info, Search } from 'lucide-react';
import SizeGuideTable from '../SizeGuideTable';

const Step2SizeGuide = ({
  data,
  onNext,
  onBack,
  onCancel,
  updateData,
  loading,
  errors,
  isFirstStep,
}) => {
  const [option, setOption] = useState('');
  const [existingGuides, setExistingGuides] = useState([]);
  const [selectedGuideId, setSelectedGuideId] = useState(
    data.sizeGuide || null,
  );
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar guías existentes
  useEffect(() => {
    loadExistingGuides();
  }, []);

  useEffect(() => {
    if (data.sizeGuide) {
      setOption('select');
      setSelectedGuideId(data.sizeGuide);
    } else if (data.hasSizeGuide === false) {
      setOption('none');
    }
  }, [data.sizeGuide, data.hasSizeGuide]);

  const loadExistingGuides = async () => {
    try {
      setLoadingGuides(true);
      const response = await fetch('/api/size-guides');

      if (response.ok) {
        const result = await response.json();

        let guides = [];
        if (Array.isArray(result)) {
          guides = result;
        } else if (result.guides) {
          guides = result.guides;
        } else if (result.sizeGuides) {
          guides = result.sizeGuides;
        }

        const validGuides = guides.filter(
          (guide) =>
            guide &&
            guide._id &&
            typeof guide.name === 'string' &&
            guide.name.trim() !== '',
        );

        console.log('📏 Guías cargadas:', validGuides.length);
        setExistingGuides(validGuides);
      } else {
        setExistingGuides([]);
      }
    } catch (error) {
      console.error('Error cargando guías:', error);
      setExistingGuides([]);
    } finally {
      setLoadingGuides(false);
    }
  };

  // ✅ FUNCIÓN CORREGIDA COMPLETA
  const handleSaveNewGuide = async (sizeGuideData) => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💾 [SAVE GUIDE] Iniciando guardado de guía');
      console.log('📦 [SAVE GUIDE] Data recibido:', sizeGuideData);
      console.log('🆔 [SAVE GUIDE] Product ID:', data._id);

      // ✅ Detectar si estamos editando una guía existente
      const existingGuideId = data.sizeGuide?._id || data.sizeGuide;
      const isEditingGuide = !!existingGuideId;

      console.log(
        '📋 [SAVE GUIDE] Modo:',
        isEditingGuide ? 'EDICIÓN' : 'CREACIÓN',
      );
      console.log('🆔 [SAVE GUIDE] Existing Guide ID:', existingGuideId);

      // ✅ Construir payload
      const payload = {
        productId: data._id,
        ...sizeGuideData,
      };

      console.log('📤 [SAVE GUIDE] Payload completo:', payload);

      // ✅ Determinar URL y método
      const url = isEditingGuide
        ? `/api/size-guides/${existingGuideId}`
        : '/api/size-guides';

      const method = isEditingGuide ? 'PUT' : 'POST';

      console.log('🌐 [SAVE GUIDE] URL:', url);
      console.log('📡 [SAVE GUIDE] Method:', method);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // ✅ Hacer request
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 [SAVE GUIDE] Response status:', response.status);
      console.log('📡 [SAVE GUIDE] Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [SAVE GUIDE] Error response:', errorData);
        throw new Error(
          errorData.error || 'Error al guardar la guía de talles',
        );
      }

      const result = await response.json();
      console.log('✅ [SAVE GUIDE] Resultado:', result);

      const savedGuideId = result.sizeGuide?._id || result._id;
      console.log('🆔 [SAVE GUIDE] ID guardado:', savedGuideId);

      // ✅ Actualizar estado local
      setSelectedGuideId(savedGuideId);
      setOption('select'); // Cambiar a modo "select" para que handleNext funcione

      // ✅ Actualizar data del wizard
      updateData({
        sizeGuide: savedGuideId,
        hasSizeGuide: true,
      });

      // ✅ Recargar lista de guías
      await loadExistingGuides();

      alert(
        isEditingGuide
          ? '✅ Guía de talles actualizada exitosamente'
          : '✅ Guía de talles creada exitosamente',
      );

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ [SAVE GUIDE] Proceso completado exitosamente');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ [SAVE GUIDE] Error:', error);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      alert('Error: ' + error.message);
    }
  };

  const handleNext = async () => {
    let stepData = {};

    if (option === 'none') {
      stepData = {
        sizeGuide: null,
        hasSizeGuide: false,
      };
    } else if (option === 'select') {
      if (!selectedGuideId) {
        alert('Por favor selecciona una guía de talles');
        return;
      }
      stepData = {
        sizeGuide: selectedGuideId,
        hasSizeGuide: true,
      };
    } else {
      alert(
        'Por favor completa y guarda la guía de talles o selecciona una opción',
      );
      return;
    }

    await onNext(stepData);
  };

  const filteredGuides = existingGuides.filter((guide) => {
    if (!guide || !guide.name) return false;
    return guide.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Obtener categoría del producto para la tabla
  const productCategory = data.category || 'remeras';
  const productName = data.model || data.title || 'Producto';

  // 🐛 DEBUG: Ver qué categoría recibimos
  useEffect(() => {
    console.log('📊 Step2SizeGuide - Data recibido:', {
      category: data.category,
      productCategory,
      allData: data,
    });
  }, [data.category]);

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Guía de Talles</h2>
        <p className="text-sm text-gray-600 mt-1">
          Define los talles y medidas disponibles
        </p>
      </div>

      {/* Contenido */}
      <div className="px-6 py-6 space-y-6">
        {/* Opciones */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">
            ¿Cómo quieres manejar los talles?
          </h3>

          {/* Opción 1: Usar guía existente */}
          <label
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              option === 'select'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            <input
              type="radio"
              name="sizeGuideOption"
              value="select"
              checked={option === 'select'}
              onChange={(e) => setOption(e.target.value)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                Usar guía existente
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Selecciona una guía que ya creaste anteriormente
              </p>

              {option === 'select' && (
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar guía..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {loadingGuides ? (
                    <p className="text-sm text-gray-500">Cargando guías...</p>
                  ) : filteredGuides.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No hay guías disponibles. Crea una nueva más abajo.
                    </p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2">
                      {filteredGuides.map((guide) => (
                        <button
                          key={guide._id}
                          type="button"
                          onClick={() => setSelectedGuideId(guide._id)}
                          className={`w-full text-left p-3 rounded-md border-2 transition-colors ${
                            selectedGuideId === guide._id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {guide.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {guide.sizes?.length || 0} talles
                              </p>
                            </div>
                            {selectedGuideId === guide._id && (
                              <Check className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </label>

          {/* Opción 2: Crear nueva guía CON TABLA */}
          <label
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              option === 'create'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            <input
              type="radio"
              name="sizeGuideOption"
              value="create"
              checked={option === 'create'}
              onChange={(e) => setOption(e.target.value)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Crear nueva guía</div>
              <p className="text-sm text-gray-600 mt-1">
                Completa la tabla de medidas predefinida según tu producto
              </p>

              {option === 'create' && (
                <div className="mt-4">
                  <SizeGuideTable
                    category={productCategory}
                    productName={productName}
                    productCategory={productCategory}
                    onSave={handleSaveNewGuide}
                  />
                </div>
              )}
            </div>
          </label>

          {/* Opción 3: Sin guía */}
          <label
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              option === 'none'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            <input
              type="radio"
              name="sizeGuideOption"
              value="none"
              checked={option === 'none'}
              onChange={(e) => setOption(e.target.value)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                Sin guía de talles
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Usaré talles estándar sin medidas específicas
              </p>
            </div>
          </label>
        </div>

        {/* Info general */}
        {option !== 'create' && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  ¿Para qué sirve la guía de talles?
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Define talles con sus medidas exactas en centímetros</li>
                  <li>Los compradores verán las medidas antes de comprar</li>
                  <li>Reduce devoluciones por problemas de talle</li>
                  <li>Puedes reutilizar guías en productos similares</li>
                </ul>
              </div>
            </div>
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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium disabled:opacity-50"
          >
            Atrás
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={loading || (option === 'create' && !selectedGuideId)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Guardando...' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2SizeGuide;
