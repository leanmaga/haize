'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Hooks ACTUALIZADOS
import { useProductForm } from './hooks/useProductForm';
import { useProductImages } from './hooks/useProductImages';
import { useProductVariants } from './hooks/useProductVariants'; // NUEVO: Variantes combinadas
import { useProductValidation } from './hooks/useProductValidation';

// Components
import ErrorBanner from './components/ErrorBanner';
import BasicInfoFields from './components/BasicInfoFields';
import ImageManager from './components/ImageManager';
import VariantsSection from './components/VariantsSection'; // ACTUALIZADO
import AdditionalInfoSection from './components/AdditionalInfoSection';
import FinancialInfoSection from './components/FinancialInfoSection';
import ProductOptions from './components/ProductOptions';
import FormActions from './components/FormActions';

/**
 * Formulario principal de productos (CON VARIANTES COMBINADAS)
 * Componente orquestador que integra todos los hooks y componentes
 *
 * @param {Object} props
 * @param {Object} props.product - Producto existente (null si es creación)
 * @returns {JSX.Element}
 */
const ProductForm = ({ product = null }) => {
  // ========== HOOKS ==========

  // Hook de imágenes
  const imagesHook = useProductImages(product);

  // Hook de variantes COMBINADAS (talle + color + stock)
  const variantsHook = useProductVariants(product);

  // Hook de validación
  const validationHook = useProductValidation(product, imagesHook.mainImageUrl);

  // Hook principal del formulario
  const formHook = useProductForm(
    product,
    imagesHook,
    variantsHook,
    validationHook,
  );

  // ========== HANDLERS ==========

  const handleMainImageChange = (info, imageUrl) => {
    imagesHook.handleMainImageChange(info, imageUrl);
    // Limpiar error de imagen si existe
    validationHook.clearError('image');
  };

  // ========== RENDER ==========

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Botón volver */}
      <button
        type="button"
        onClick={() => formHook.router.back()}
        className="mb-6 inline-flex items-center text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Volver
      </button>

      {/* Título */}
      <h1 className="text-2xl font-nexa-bold mb-6">
        {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
      </h1>

      {/* Banner de errores */}
      <ErrorBanner errors={validationHook.validationErrors} />

      {/* Formulario */}
      <form onSubmit={formHook.handleSubmit} className="space-y-6">
        {/* Información básica e imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda - Información básica */}
          <BasicInfoFields
            register={formHook.register}
            validationErrors={validationHook.validationErrors}
          />

          {/* Columna derecha - Imágenes */}
          <ImageManager
            mainImageUrl={imagesHook.mainImageUrl}
            additionalImages={imagesHook.additionalImages}
            colorNames={variantsHook.getColorNames()}
            onMainImageChange={handleMainImageChange}
            onAddImage={imagesHook.handleAddImage}
            onRemoveImage={imagesHook.handleRemoveImage}
            validationError={validationHook.validationErrors.image}
            isEditing={!!product}
          />
        </div>

        {/* ⭐ NUEVA SECCIÓN: Variantes Combinadas (Talle + Color + Stock) */}
        <VariantsSection
          show={formHook.showVariants}
          onToggle={() => formHook.setShowVariants(!formHook.showVariants)}
          variantsProps={{
            variants: variantsHook.variants,
            onAdd: variantsHook.addVariant,
            onRemove: variantsHook.removeVariant,
            onUpdate: variantsHook.updateVariant,
            onDuplicate: variantsHook.duplicateVariant,
          }}
        />

        {/* Información adicional */}
        <AdditionalInfoSection
          show={formHook.showAdditionalInfo}
          onToggle={() =>
            formHook.setShowAdditionalInfo(!formHook.showAdditionalInfo)
          }
          register={formHook.register}
          composition={formHook.composition}
          onCompositionAdd={() =>
            formHook.addToArray(formHook.setComposition, formHook.composition)
          }
          onCompositionRemove={(index) =>
            formHook.removeFromArray(
              formHook.setComposition,
              formHook.composition,
              index,
            )
          }
          careInstructions={formHook.careInstructions}
          onCareAdd={() =>
            formHook.addToArray(
              formHook.setCareInstructions,
              formHook.careInstructions,
            )
          }
          onCareRemove={(index) =>
            formHook.removeFromArray(
              formHook.setCareInstructions,
              formHook.careInstructions,
              index,
            )
          }
          tags={formHook.tags}
          onTagAdd={() => formHook.addToArray(formHook.setTags, formHook.tags)}
          onTagRemove={(index) =>
            formHook.removeFromArray(formHook.setTags, formHook.tags, index)
          }
        />

        {/* Información financiera */}
        <FinancialInfoSection
          show={formHook.showFinancialInfo}
          onToggle={() =>
            formHook.setShowFinancialInfo(!formHook.showFinancialInfo)
          }
          register={formHook.register}
          validationErrors={validationHook.validationErrors}
          autoCalculateMargin={formHook.autoCalculateMargin}
          onAutoCalculateToggle={() =>
            formHook.setAutoCalculateMargin(!formHook.autoCalculateMargin)
          }
        />

        {/* Opciones del producto */}
        <ProductOptions register={formHook.register} />

        {/* Info sobre stock automático */}
        {variantsHook.variants.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium">Stock calculado automáticamente</p>
                <p className="mt-1">
                  El stock total se calcula sumando el stock de todas las
                  variantes:{' '}
                  <strong>{variantsHook.getTotalStock()} unidades</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <FormActions
          loading={formHook.loading}
          onCancel={() => formHook.router.back()}
          isEditing={!!product}
        />
      </form>
    </div>
  );
};

export default ProductForm;
