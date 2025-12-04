import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

/**
 * Hook principal del formulario de productos (ACTUALIZADO CON VARIANTES COMBINADAS)
 * Integra todos los hooks y maneja la lógica de submit
 *
 * @param {Object} product - Producto existente (null si es creación)
 * @param {Object} imagesHook - Hook de imágenes
 * @param {Object} variantsHook - Hook de variantes COMBINADAS
 * @param {Object} validationHook - Hook de validación
 * @returns {Object} - Estados y funciones del formulario
 */
export const useProductForm = (
  product,
  imagesHook,
  variantsHook,
  validationHook,
) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [autoCalculateMargin, setAutoCalculateMargin] = useState(true);

  // Estados para secciones colapsables
  const [showFinancialInfo, setShowFinancialInfo] = useState(
    !!(product?.cost || product?.profitMargin || product?.promoPrice),
  );
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(
    !!(product?.material || product?.brand || product?.origin),
  );
  const [showVariants, setShowVariants] = useState(
    !!(product?.variants?.length > 0),
  );

  // Estados para arrays de información adicional
  const [composition, setComposition] = useState(product?.composition || []);
  const [careInstructions, setCareInstructions] = useState(
    product?.careInstructions || [],
  );
  const [tags, setTags] = useState(product?.tags || []);

  // Configuración de react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: product?.title || '',
      description: product?.description || '',
      salePrice: product?.salePrice?.toString() || '',
      promoPrice: product?.promoPrice?.toString() || '',
      cost: product?.cost?.toString() || '',
      profitMargin: product?.profitMargin?.toString() || '',
      stock: product?.stock?.toString() || '',
      category: product?.category || '',
      featured: product?.featured || false,
      isNew: product?.isNew || false,
      sku: product?.sku || '',
      brand: product?.brand || '',
      material: product?.material || '',
      origin: product?.origin || '',
      season: product?.season || 'todo-el-año',
      weight: product?.weight?.toString() || '',
    },
  });

  const watchSalePrice = watch('salePrice');
  const watchCost = watch('cost');

  // Calcular margen automáticamente
  useEffect(() => {
    if (autoCalculateMargin && watchSalePrice && watchCost) {
      const salePrice = parseFloat(watchSalePrice);
      const cost = parseFloat(watchCost);

      if (salePrice > 0 && cost > 0) {
        const margin = ((salePrice - cost) / salePrice) * 100;
        setValue('profitMargin', Math.max(0, Math.min(100, margin)).toFixed(2));
      }
    }
  }, [watchSalePrice, watchCost, autoCalculateMargin, setValue]);

  // Actualizar stock total automáticamente cuando cambian las variantes
  useEffect(() => {
    const totalStock = variantsHook.getTotalStock();
    if (totalStock > 0) {
      setValue('stock', totalStock.toString());
    }
  }, [variantsHook.variants, setValue]);

  // ========== FUNCIONES PARA ARRAYS ==========

  /**
   * Agrega un item a un array mediante prompt
   * @param {Function} setter - Función setState del array
   * @param {Array} array - Array actual
   */
  const addToArray = (setter, array) => {
    const value = prompt('Ingrese el valor:');
    if (value && value.trim()) {
      setter([...array, value.trim()]);
    }
  };

  /**
   * Elimina un item de un array por índice
   * @param {Function} setter - Función setState del array
   * @param {Array} array - Array actual
   * @param {number} index - Índice a eliminar
   */
  const removeFromArray = (setter, array, index) => {
    setter(array.filter((_, i) => i !== index));
  };

  // ========== PREPARACIÓN DE DATOS ==========

  /**
   * Construye el objeto de datos del producto para enviar a la API
   * @param {Object} data - Datos del formulario
   * @returns {Object} - Objeto productData formateado
   */
  const buildProductData = (data) => {
    const productData = {
      title: data.title.trim(),
      description: data.description.trim(),
      salePrice: parseFloat(data.salePrice),
      category: data.category,
      featured: data.featured,
      isNew: data.isNew,
      season: data.season,
      sku: data.sku || undefined,
      brand: data.brand.trim() || undefined,
      material: data.material.trim() || undefined,
      origin: data.origin.trim() || undefined,
      weight: data.weight ? parseFloat(data.weight) : undefined,
    };

    // Campos financieros opcionales
    if (data.promoPrice) {
      productData.promoPrice = parseFloat(data.promoPrice);
    }
    if (data.cost) {
      productData.cost = parseFloat(data.cost);
    }
    if (data.profitMargin) {
      productData.profitMargin = parseFloat(data.profitMargin);
    }

    // Stock: usar el calculado de variantes o el manual
    const variantsData = variantsHook.getVariantsData();
    if (variantsData && variantsData.length > 0) {
      productData.stock = variantsHook.getTotalStock();
    } else if (data.stock !== undefined && data.stock !== '') {
      productData.stock = parseInt(data.stock) || 0;
    }

    // Arrays
    if (composition.length > 0) {
      productData.composition = composition;
    }
    if (careInstructions.length > 0) {
      productData.careInstructions = careInstructions;
    }
    if (tags.length > 0) {
      productData.tags = tags;
    }

    // ⭐ NUEVA ESTRUCTURA: Variantes combinadas
    if (variantsData && variantsData.length > 0) {
      productData.variants = variantsData;
    }

    // Imágenes
    const mainImageData = imagesHook.getMainImageData();
    if (mainImageData) {
      Object.assign(productData, mainImageData);
    }

    productData.additionalImages = imagesHook.getAdditionalImagesData();

    return productData;
  };

  // ========== SUBMIT DEL FORMULARIO ==========

  /**
   * Maneja el submit del formulario
   * @param {Object} data - Datos del formulario
   */
  const onSubmit = async (data) => {
    // Validar formulario
    if (!validationHook.validateForm(data)) {
      toast.error('Por favor completa todos los campos obligatorios');
      validationHook.scrollToFirstError();
      return;
    }

    setLoading(true);

    try {
      const productData = buildProductData(data);

      console.log('📦 Enviando producto con variantes:', productData);

      // Determinar URL y método
      const url = product ? `/api/products/${product._id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ API Error:', error);
        throw new Error(error.message || 'Error al guardar producto');
      }

      await response.json();

      toast.success(
        product
          ? 'Producto actualizado correctamente'
          : 'Producto creado correctamente',
      );

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('❌ Error saving product:', error);
      toast.error(error.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estados de react-hook-form
    register,
    handleSubmit: handleSubmit(onSubmit),
    watch,
    errors,
    // Estados de carga
    loading,
    // Estados de secciones colapsables
    showFinancialInfo,
    setShowFinancialInfo,
    showAdditionalInfo,
    setShowAdditionalInfo,
    showVariants,
    setShowVariants,
    // Estados de margen automático
    autoCalculateMargin,
    setAutoCalculateMargin,
    // Estados de arrays
    composition,
    setComposition,
    careInstructions,
    setCareInstructions,
    tags,
    setTags,
    // Funciones para arrays
    addToArray,
    removeFromArray,
    // Router
    router,
  };
};
