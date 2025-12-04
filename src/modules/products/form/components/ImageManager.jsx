import MultipleImageUploader from '@/components/admin/MultipleImageUploader';

/**
 * Componente para gestionar imágenes del producto
 * @param {Object} props
 * @param {string} props.mainImageUrl - URL de la imagen principal
 * @param {Array} props.additionalImages - Array de imágenes adicionales
 * @param {Array<string>} props.colorNames - Nombres de colores disponibles
 * @param {Function} props.onMainImageChange - Callback para imagen principal
 * @param {Function} props.onAddImage - Callback para agregar imagen
 * @param {Function} props.onRemoveImage - Callback para eliminar imagen
 * @param {Object} props.validationError - Error de validación si existe
 * @param {boolean} props.isEditing - Si está editando un producto existente
 * @returns {JSX.Element}
 */
const ImageManager = ({
  mainImageUrl,
  additionalImages,
  colorNames,
  onMainImageChange,
  onAddImage,
  onRemoveImage,
  validationError,
  isEditing,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Imágenes del producto{' '}
        {!isEditing && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`${validationError ? 'ring-2 ring-red-500 rounded-lg' : ''}`}
      >
        <MultipleImageUploader
          mainImage={mainImageUrl}
          additionalImages={additionalImages}
          colors={colorNames}
          onMainImageChange={onMainImageChange}
          onAddImage={onAddImage}
          onRemoveImage={onRemoveImage}
          descriptions={true}
        />
      </div>
      {validationError && (
        <p className="mt-1 text-sm text-red-600">{validationError}</p>
      )}
    </div>
  );
};

export default ImageManager;
