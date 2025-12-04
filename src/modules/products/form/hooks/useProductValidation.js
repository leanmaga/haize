import { useState } from 'react';

/**
 * Hook personalizado para manejar la validación del formulario de productos
 * @param {Object} product - Producto existente (null si es creación)
 * @param {string} mainImageUrl - URL de la imagen principal
 * @returns {Object} - Estados y funciones de validación
 */
export const useProductValidation = (product, mainImageUrl) => {
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Valida todos los campos del formulario
   * @param {Object} data - Datos del formulario
   * @returns {boolean} - true si no hay errores
   */
  const validateForm = (data) => {
    const errors = {};

    // Validación de nombre
    if (!data.title.trim()) {
      errors.title = 'El nombre del producto es obligatorio';
    }

    // Validación de categoría
    if (!data.category) {
      errors.category = 'Debes seleccionar una categoría';
    }

    // Validación de precio de venta
    if (!data.salePrice || parseFloat(data.salePrice) <= 0) {
      errors.salePrice =
        'El precio de venta es obligatorio y debe ser mayor a 0';
    }

    // Validación de imagen principal (solo en creación)
    if (!mainImageUrl && !product) {
      errors.image = 'Debes subir una imagen principal del producto';
    }

    // Validación de costo
    if (data.cost && parseFloat(data.cost) < 0) {
      errors.cost = 'El costo no puede ser negativo';
    }

    // Validación de margen
    if (
      data.profitMargin &&
      (parseFloat(data.profitMargin) < 0 || parseFloat(data.profitMargin) > 100)
    ) {
      errors.profitMargin = 'El margen debe estar entre 0 y 100%';
    }

    // Validación de precio promocional
    if (data.promoPrice && parseFloat(data.promoPrice) < 0) {
      errors.promoPrice = 'El precio promocional no puede ser negativo';
    }

    // Validación de stock
    if (data.stock && parseInt(data.stock) < 0) {
      errors.stock = 'El stock no puede ser negativo';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Limpia un error específico
   * @param {string} field - Campo a limpiar
   */
  const clearError = (field) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Limpia todos los errores
   */
  const clearAllErrors = () => {
    setValidationErrors({});
  };

  /**
   * Hace scroll al primer campo con error
   */
  const scrollToFirstError = () => {
    const firstErrorField = Object.keys(validationErrors)[0];
    const errorElement = document.getElementById(firstErrorField);
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return {
    validationErrors,
    validateForm,
    clearError,
    clearAllErrors,
    scrollToFirstError,
  };
};
