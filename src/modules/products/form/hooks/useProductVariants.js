import { useState } from 'react';

/**
 * Hook personalizado para manejar variantes combinadas del producto
 * Cada variante tiene: talle + color + stock
 *
 * @param {Object} product - Producto existente (null si es creación)
 * @returns {Object} - Estados y funciones para manejar variantes
 */
export const useProductVariants = (product = null) => {
  // Estado para variantes combinadas (talle + color + stock)
  const [variants, setVariants] = useState(() => {
    // Si el producto tiene la nueva estructura de variantes
    if (product?.variants && product.variants.length > 0) {
      return product.variants.map((v) => ({
        size: v.size,
        color: v.color,
        colorHex: v.colorHex || '#000000',
        stock: v.stock,
        sku: v.sku || '',
      }));
    }

    // Si el producto tiene la estructura antigua (sizes y colors separados)
    // No hacemos migración automática, dejamos vacío
    return [];
  });

  // Lista de colores únicos para el selector de imágenes
  const [availableColors, setAvailableColors] = useState([]);

  // ========== FUNCIONES PARA VARIANTES ==========

  /**
   * Agrega una nueva variante vacía
   */
  const addVariant = () => {
    setVariants([
      ...variants,
      { size: '', color: '', colorHex: '#000000', stock: 0, sku: '' },
    ]);
  };

  /**
   * Elimina una variante por índice
   * @param {number} index - Índice de la variante a eliminar
   */
  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  /**
   * Actualiza un campo específico de una variante
   * @param {number} index - Índice de la variante
   * @param {string} field - Campo a actualizar (size, color, colorHex, stock, sku)
   * @param {any} value - Nuevo valor
   */
  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;

    // Si se actualiza el color, actualizar la lista de colores disponibles
    if (field === 'color' || field === 'colorHex') {
      updateAvailableColors(newVariants);
    }

    setVariants(newVariants);
  };

  /**
   * Actualiza la lista de colores únicos disponibles
   * @param {Array} variantsList - Lista de variantes
   */
  const updateAvailableColors = (variantsList) => {
    const uniqueColors = [
      ...new Set(
        variantsList
          .filter((v) => v.color && v.color.trim())
          .map((v) => v.color),
      ),
    ];
    setAvailableColors(uniqueColors);
  };

  /**
   * Duplica una variante existente
   * @param {number} index - Índice de la variante a duplicar
   */
  const duplicateVariant = (index) => {
    const variantToDuplicate = variants[index];
    const newVariant = {
      ...variantToDuplicate,
      sku: '', // Limpiar SKU para evitar duplicados
    };
    setVariants([...variants, newVariant]);
  };

  // ========== FUNCIONES PARA OBTENER DATOS ==========

  /**
   * Prepara los datos de variantes para enviar a la API
   * @returns {Array} - Array con variantes válidas
   */
  const getVariantsData = () => {
    if (variants.length === 0) return undefined;

    return variants
      .filter((v) => v.size && v.color) // Solo variantes completas
      .map((v) => ({
        size: v.size,
        color: v.color,
        colorHex: v.colorHex || undefined,
        stock: parseInt(v.stock) || 0,
        sku: v.sku || undefined,
      }));
  };

  /**
   * Obtiene lista de nombres de colores únicos (útil para ImageManager)
   * @returns {Array<string>} - Array con nombres de colores
   */
  const getColorNames = () => {
    return availableColors;
  };

  /**
   * Obtiene el stock total de todas las variantes
   * @returns {number} - Stock total
   */
  const getTotalStock = () => {
    return variants.reduce((total, v) => total + (parseInt(v.stock) || 0), 0);
  };

  /**
   * Obtiene lista de talles únicos
   * @returns {Array<string>} - Array con talles únicos
   */
  const getUniqueSizes = () => {
    return [...new Set(variants.filter((v) => v.size).map((v) => v.size))];
  };

  /**
   * Obtiene variantes agrupadas por talle
   * @returns {Object} - Objeto con talles como keys y arrays de variantes como values
   */
  const getVariantsBySize = () => {
    return variants.reduce((acc, variant) => {
      if (!variant.size) return acc;
      if (!acc[variant.size]) {
        acc[variant.size] = [];
      }
      acc[variant.size].push(variant);
      return acc;
    }, {});
  };

  return {
    // Estados de variantes
    variants,
    availableColors,
    // Funciones de variantes
    addVariant,
    removeVariant,
    updateVariant,
    duplicateVariant,
    // Funciones para obtener datos formateados
    getVariantsData,
    getColorNames,
    getTotalStock,
    getUniqueSizes,
    getVariantsBySize,
  };
};
