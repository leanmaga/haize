// lib/services/uploadService.js

/**
 * Sube múltiples imágenes a Cloudinary vía API
 * @param {File[]} files - Array de archivos a subir
 * @param {Function} onProgress - Callback opcional para progreso
 * @returns {Promise<Array>} Array de objetos con url, publicId, etc.
 */
export const uploadImages = async (files, onProgress) => {
  const formData = new FormData();

  // Agregar cada archivo al FormData
  files.forEach((file) => {
    formData.append('images', file);
  });

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error subiendo imágenes');
    }

    const data = await response.json();
    return data.images;
  } catch (error) {
    console.error('Error en uploadImages:', error);
    throw error;
  }
};

/**
 * Sube una sola imagen a Cloudinary
 * @param {File} file - Archivo a subir
 * @param {Function} onProgress - Callback opcional para progreso
 * @returns {Promise<Object>} Objeto con url, publicId, etc.
 */
export const uploadImage = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('images', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error subiendo imagen');
    }

    const data = await response.json();
    return data.images[0];
  } catch (error) {
    console.error('Error en uploadImage:', error);
    throw error;
  }
};

/**
 * Elimina una imagen de Cloudinary
 * @param {string} publicId - Public ID de la imagen en Cloudinary
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const deleteImage = async (publicId) => {
  try {
    const response = await fetch(
      `/api/upload?publicId=${encodeURIComponent(publicId)}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error eliminando imagen');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en deleteImage:', error);
    throw error;
  }
};

/**
 * Valida un archivo antes de subirlo
 * @param {File} file - Archivo a validar
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validateImageFile = (file) => {
  // Validar tamaño (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `${file.name} supera el tamaño máximo de 10MB`,
    };
  }

  // Validar formato
  const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validFormats.includes(file.type)) {
    return {
      valid: false,
      error: `${file.name} no es un formato válido. Usa JPG, JPEG, PNG o WEBP`,
    };
  }

  return { valid: true };
};

/**
 * Valida múltiples archivos
 * @param {FileList|File[]} files - Archivos a validar
 * @param {number} maxCount - Cantidad máxima de archivos
 * @returns {Object} { validFiles: File[], errors: string[] }
 */
export const validateImageFiles = (files, maxCount = 10) => {
  const fileArray = Array.from(files);
  const validFiles = [];
  const errors = [];

  if (fileArray.length > maxCount) {
    errors.push(`Máximo ${maxCount} archivos permitidos`);
    return { validFiles: [], errors };
  }

  fileArray.forEach((file) => {
    const validation = validateImageFile(file);
    if (validation.valid) {
      validFiles.push(file);
    } else {
      errors.push(validation.error);
    }
  });

  return { validFiles, errors };
};

export default {
  uploadImages,
  uploadImage,
  deleteImage,
  validateImageFile,
  validateImageFiles,
};
