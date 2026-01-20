// components/admin/products/ProductWizard.jsx - VERSION DEBUG COMPLETA
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Step1MainCharacteristics from './steps/Step1MainCharacteristics';
import Step2SizeGuide from './steps/Step2SizeGuide';
import Step3VariantsAndPhotos from './steps/Step3VariantsAndPhotos';
import Step4TitleDescription from './steps/Step4TitleDescription';
import Step5Price from './steps/Step5Price';
import Step6Review from './steps/Step6Review';

const STORAGE_KEY = 'haize_product_wizard_draft';

const ProductWizard = ({ isEdit = false, productId = null }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Estado interno para mantener el ID
  const [editingProductId, setEditingProductId] = useState(null);

  // Estado del producto
  const [productData, setProductData] = useState({
    brand: 'Haize',
    model: '',
    gender: '',
    category: '',
    sizeGuide: null,
    hasSizeGuide: false,
    variants: [],
    images: [],
    title: '',
    description: '',
    salePrice: 0,
    promoPrice: 0,
    cost: 0,
  });

  // 🔍 DEBUG: Log inicial
  useEffect(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [WIZARD INIT] ProductWizard montado');
    console.log('📋 Props recibidas:', {
      isEdit,
      productId,
      productIdType: typeof productId,
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, []);

  // Cargar producto o borrador al iniciar
  useEffect(() => {
    if (isEdit && productId) {
      console.log('📝 [WIZARD] Iniciando modo EDICIÓN');
      console.log('🆔 [WIZARD] ProductId recibido:', productId);
      setEditingProductId(productId); // Guardar inmediatamente
      loadProductFromDB(productId);
    } else if (!isEdit) {
      console.log('✨ [WIZARD] Iniciando modo CREACIÓN');
      loadDraftFromLocalStorage();
    } else {
      console.log('⚠️ [WIZARD] Configuración incorrecta:', {
        isEdit,
        productId,
      });
    }
  }, [isEdit, productId]);

  // 🔍 DEBUG: Monitorear cambios en editingProductId
  useEffect(() => {
    console.log('🔄 [WIZARD STATE] editingProductId cambió:', editingProductId);
  }, [editingProductId]);

  // 🔍 DEBUG: Monitorear cambios en productData._id
  useEffect(() => {
    if (productData._id) {
      console.log('🔄 [WIZARD STATE] productData._id:', productData._id);
    }
  }, [productData._id]);

  const loadDraftFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        console.log('📦 [STORAGE] Borrador cargado:', draft);
        setProductData(draft.data);
        setCurrentStep(draft.step);
      }
    } catch (error) {
      console.error('❌ [STORAGE] Error cargando borrador:', error);
    }
  };

  const saveDraftToLocalStorage = () => {
    if (isEdit) return; // No guardar en modo edición

    try {
      const draft = {
        data: productData,
        step: currentStep,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      console.log('💾 [STORAGE] Borrador guardado');
    } catch (error) {
      console.error('❌ [STORAGE] Error guardando borrador:', error);
    }
  };

  const clearDraftFromLocalStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ [STORAGE] Borrador eliminado');
    } catch (error) {
      console.error('❌ [STORAGE] Error eliminando borrador:', error);
    }
  };

  const loadProductFromDB = async (id) => {
    try {
      setLoading(true);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔄 [API] Iniciando carga de producto');
      console.log('🆔 [API] ID a cargar:', id);
      console.log('🌐 [API] URL:', `/api/products/${id}`);

      const response = await fetch(`/api/products/${id}`);

      console.log('📡 [API] Response status:', response.status);
      console.log('📡 [API] Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const product = await response.json();

      console.log('✅ [API] Producto cargado exitosamente');
      console.log('📦 [API] Producto data:', {
        _id: product._id,
        id: product.id,
        title: product.title,
        slug: product.slug,
        hasVariants: !!product.variants,
        variantsCount: product.variants?.length,
      });

      // ✅ CRÍTICO: Guardar AMBOS IDs
      setProductData(product);
      setEditingProductId(product._id || product.id);

      console.log('💾 [STATE] Estado actualizado con producto');
      console.log(
        '🆔 [STATE] editingProductId establecido:',
        product._id || product.id,
      );
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      setCurrentStep(1);
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ [API] Error cargando producto:', error);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      alert('Error al cargar el producto: ' + error.message);
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const updateProductData = (stepData) => {
    setProductData((prev) => ({
      ...prev,
      ...stepData,
    }));
  };

  const handleNext = async (stepData) => {
    try {
      setErrors({});
      updateProductData(stepData);

      console.log(`➡️ [NAVIGATION] Avanzando al paso ${currentStep + 1}`);
      setCurrentStep((prev) => prev + 1);

      return true;
    } catch (error) {
      console.error('❌ [NAVIGATION] Error en handleNext:', error);
      alert('Error: ' + error.message);
      return false;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      console.log(`⬅️ [NAVIGATION] Retrocediendo al paso ${currentStep - 1}`);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCancel = () => {
    const message = isEdit
      ? '¿Estás seguro de cancelar la edición? Los cambios no se guardarán.'
      : '¿Estás seguro de cancelar? El borrador se mantendrá guardado.';

    if (window.confirm(message)) {
      router.push('/admin/products');
    }
  };

  const handleFinish = async () => {
    try {
      setLoading(true);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎯 [FINISH] Iniciando guardado final');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 [FINISH] Configuración:');
      console.log('   isEdit:', isEdit);
      console.log('   productId (prop):', productId);
      console.log('   editingProductId (state):', editingProductId);
      console.log('   productData._id:', productData._id);
      console.log('   productData.id:', productData.id);

      // ✅ MÚLTIPLES FALLBACKS para obtener el ID
      const finalProductId =
        editingProductId || productData._id || productData.id || productId;

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🆔 [FINISH] ID final resuelto:', finalProductId);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Validación
      if (isEdit && !finalProductId) {
        console.error('❌ [FINISH] MODO EDICIÓN PERO SIN ID');
        console.error('   Esto causará un POST en lugar de PUT');
        console.error('   Abortando...');
        throw new Error('No se pudo determinar el ID del producto para editar');
      }

      if (!productData.model || !productData.gender || !productData.category) {
        throw new Error('Faltan datos obligatorios');
      }

      // Construir producto final
      const finalProduct = {
        ...productData,
        title:
          productData.title || `${productData.brand} - ${productData.model}`,
        salePrice: productData.salePrice || 0,
        isComplete: true,
        isActive: true,
      };

      // ✅ Remover _id del body si existe (MongoDB no lo necesita en PUT)
      if (finalProduct._id) {
        delete finalProduct._id;
      }
      if (finalProduct.id) {
        delete finalProduct.id;
      }

      // Determinar URL y método
      const url =
        isEdit && finalProductId
          ? `/api/products/${finalProductId}`
          : '/api/products';

      const method = isEdit && finalProductId ? 'PUT' : 'POST';

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 [REQUEST] Configuración del request:');
      console.log('   URL:', url);
      console.log('   Method:', method);
      console.log('   Has ID in URL:', url.includes(finalProductId || 'NO_ID'));
      console.log('   Body slug:', finalProduct.slug);
      console.log('   Body title:', finalProduct.title);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProduct),
      });

      console.log('📡 [RESPONSE] Status:', response.status);
      console.log('📡 [RESPONSE] OK:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ [RESPONSE] Error del servidor:');
        console.error('   Status:', response.status);
        console.error('   Error:', error);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        throw new Error(
          error.message || error.error || 'Error guardando producto',
        );
      }

      const result = await response.json();

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ [SUCCESS] Producto guardado exitosamente');
      console.log('📦 [SUCCESS] Result:', result);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (!isEdit) {
        clearDraftFromLocalStorage();
      }

      const successMessage = isEdit
        ? '✅ Producto actualizado exitosamente!'
        : '✅ Producto creado exitosamente!';

      alert(successMessage);
      router.push('/admin/products');
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ [FINISH] Error fatal:', error);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      number: 1,
      name: 'Características principales',
      component: Step1MainCharacteristics,
    },
    { number: 2, name: 'Guía de talles', component: Step2SizeGuide },
    { number: 3, name: 'Variantes y fotos', component: Step3VariantsAndPhotos },
    {
      number: 4,
      name: 'Título y descripción',
      component: Step4TitleDescription,
    },
    { number: 5, name: 'Precio', component: Step5Price },
    { number: 6, name: 'Revisión', component: Step6Review },
  ];

  const CurrentStepComponent = steps[currentStep - 1]?.component;
  const isLastStep = currentStep === steps.length;

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con progreso */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h1>

              {/* 🔍 DEBUG INFO EN UI */}
              <div className="mt-2 text-xs space-y-1">
                <p className="text-gray-500">
                  {isEdit ? '✏️ Modo edición' : '✨ Modo creación'}
                </p>
                {isEdit && (
                  <>
                    <p className="text-blue-600">
                      🆔 Prop ID: {productId || 'N/A'}
                    </p>
                    <p className="text-green-600">
                      💾 State ID: {editingProductId || 'N/A'}
                    </p>
                    <p className="text-purple-600">
                      📦 Data ID: {productData._id || productData.id || 'N/A'}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {!isEdit && (
                <>
                  <button
                    onClick={saveDraftToLocalStorage}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    💾 Guardar
                  </button>
                  <button
                    onClick={clearDraftFromLocalStorage}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    🗑️ Limpiar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Indicador de progreso */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${
                        currentStep > step.number
                          ? 'bg-green-500 text-white'
                          : currentStep === step.number
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                      }
                    `}
                  >
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  <span
                    className={`ml-2 text-xs hidden md:inline ${
                      currentStep === step.number
                        ? 'font-medium text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {CurrentStepComponent ? (
          <CurrentStepComponent
            data={productData}
            onNext={handleNext}
            onBack={handleBack}
            onCancel={handleCancel}
            updateData={updateProductData}
            loading={loading}
            errors={errors}
            isFirstStep={currentStep === 1}
            isLastStep={isLastStep}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-center text-gray-600">
              Paso {currentStep} no implementado
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductWizard;
