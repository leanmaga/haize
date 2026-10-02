import { useState } from 'react';

/**
 * Hook personalizado para manejar imágenes del producto
 * @param {Object} product - Producto existente (null si es creación)
 * @returns {Object} - Estados y funciones para manejar imágenes
 */
export const useProductImages = (product = null) => {
  // Los productos existentes usan dos formatos históricos: `imageUrl`/`url`
  // y, en algunos casos, un array `images`. Normalizamos al formato del form.
  const getImageUrl = (image) => {
    if (typeof image === 'string') return image;
    return image?.imageUrl || image?.url || '';
  };

  const legacyImages = product?.images || [];
  const legacyPrimary = legacyImages.find((image) => image?.isPrimary);

  // Estado para imagen principal
  const [mainImageUrl, setMainImageUrl] = useState(
    product?.imageUrl || getImageUrl(legacyPrimary) || getImageUrl(legacyImages[0]),
  );
  const [mainImageInfo, setMainImageInfo] = useState(null);

  // Estado para imágenes adicionales
  const [additionalImages, setAdditionalImages] = useState(
    product?.additionalImages?.map((img) => ({
      imageUrl: getImageUrl(img),
      description: img.description || '',
      color: img.color || '',
      publicId: img.publicId || '',
      isPrimary: img.isPrimary || false,
      info: null,
    })) || [],
  );

  /**
   * Maneja el cambio de la imagen principal
   * @param {Object} info - Información de Cloudinary
   * @param {string} imageUrl - URL de la imagen
   */
  const handleMainImageChange = (info, imageUrl) => {
    setMainImageUrl(imageUrl);
    setMainImageInfo(info);
  };

  /**
   * Agrega una nueva imagen adicional
   * @param {Object} info - Información de Cloudinary
   * @param {string} imageUrl - URL de la imagen
   * @param {string} color - Color asociado (opcional)
   * @param {string} description - Descripción (opcional)
   */
  const handleAddImage = (info, imageUrl, color, description) => {
    const newImage = {
      imageUrl,
      description: description || '',
      color: color || '',
      publicId: '',
      isPrimary: false,
      info,
    };
    setAdditionalImages((prev) => [...prev, newImage]);
  };

  /**
   * Elimina una imagen adicional por índice
   * @param {number} index - Índice de la imagen a eliminar
   */
  const handleRemoveImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Prepara los datos de imagen principal para enviar a la API
   * @returns {Object|null} - Objeto con datos de imagen o null
   */
  const getMainImageData = () => {
    if (!mainImageUrl) return null;

    const data = {
      imageUrl: mainImageUrl,
    };

    if (mainImageInfo) {
      data.imageCloudinaryInfo = {
        publicId: mainImageInfo.public_id,
        format: mainImageInfo.format,
        width: mainImageInfo.width,
        height: mainImageInfo.height,
        bytes: mainImageInfo.bytes,
      };
    }

    return data;
  };

  /**
   * Prepara los datos de imágenes adicionales para enviar a la API
   * @returns {Array} - Array con datos de imágenes adicionales
   */
  const getAdditionalImagesData = () => {
    return additionalImages.map((img) => ({
      imageUrl: img.imageUrl,
      description: img.description || '',
      color: img.color || '',
      publicId: img.publicId || undefined,
      isPrimary: img.isPrimary || false,
      ...(img.info && {
        imageCloudinaryInfo: {
          publicId: img.info.public_id,
          format: img.info.format,
          width: img.info.width,
          height: img.info.height,
          bytes: img.info.bytes,
        },
      }),
    }));
  };

  return {
    // Estados
    mainImageUrl,
    mainImageInfo,
    additionalImages,
    // Funciones para modificar
    handleMainImageChange,
    handleAddImage,
    handleRemoveImage,
    // Funciones para obtener datos formateados
    getMainImageData,
    getAdditionalImagesData,
  };
};
