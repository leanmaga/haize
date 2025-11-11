'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import MultipleImageUploader from '@/components/admin/MultipleImageUploader';
import FormInputOptions from './FormInputOptions';

const ProductForm = ({ product = null }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [autoCalculateMargin, setAutoCalculateMargin] = useState(true);
  const [showFinancialInfo, setShowFinancialInfo] = useState(
    !!(product?.cost || product?.profitMargin || product?.promoPrice)
  );
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(
    !!(product?.material || product?.brand || product?.origin)
  );
  const [showVariants, setShowVariants] = useState(
    !!(product?.sizes?.length > 0 || product?.colors?.length > 0)
  );
  const [validationErrors, setValidationErrors] = useState({});

  // Estados para imágenes
  const [mainImageUrl, setMainImageUrl] = useState(product?.imageUrl || '');
  const [mainImageInfo, setMainImageInfo] = useState(null);
  const [additionalImages, setAdditionalImages] = useState(
    product?.additionalImages?.map((img) => ({
      imageUrl: img.imageUrl,
      description: img.description || '',
      color: img.color || '',
      info: null,
    })) || []
  );

  // Estados para variantes
  const [sizes, setSizes] = useState(
    product?.sizes?.map((s) => ({
      size: s.size,
      stock: s.stock,
      sku: s.sku || '',
    })) || []
  );
  const [colors, setColors] = useState(
    product?.colors?.map((c) => ({
      name: c.name,
      hexCode: c.hexCode || '',
      stock: c.stock,
      imageUrl: c.imageUrl || '',
    })) || []
  );

  // Estados para composición y cuidado
  const [composition, setComposition] = useState(product?.composition || []);
  const [careInstructions, setCareInstructions] = useState(
    product?.careInstructions || []
  );
  const [tags, setTags] = useState(product?.tags || []);

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

  // Funciones para manejar imágenes
  const handleMainImageChange = (info, imageUrl) => {
    setMainImageUrl(imageUrl);
    setMainImageInfo(info);

    if (validationErrors.image) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  const handleAddImage = (info, imageUrl, color, description) => {
    const newImage = {
      imageUrl,
      description: description || '',
      color: color || '',
      info,
    };
    setAdditionalImages((prev) => [...prev, newImage]);
  };

  const handleRemoveImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Funciones para manejar talles
  const addSize = () => {
    setSizes([...sizes, { size: '', stock: 0, sku: '' }]);
  };

  const removeSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index, field, value) => {
    const newSizes = [...sizes];
    newSizes[index][field] = value;
    setSizes(newSizes);
  };

  // Funciones para manejar colores
  const addColor = () => {
    setColors([...colors, { name: '', hexCode: '', stock: 0, imageUrl: '' }]);
  };

  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const updateColor = (index, field, value) => {
    const newColors = [...colors];
    newColors[index][field] = value;
    setColors(newColors);
  };

  // Funciones para arrays
  const addToArray = (setter, array) => {
    const value = prompt('Ingrese el valor:');
    if (value && value.trim()) {
      setter([...array, value.trim()]);
    }
  };

  const removeFromArray = (setter, array, index) => {
    setter(array.filter((_, i) => i !== index));
  };

  // Validación del formulario
  const validateForm = (data) => {
    const errors = {};

    if (!data.title.trim()) {
      errors.title = 'El nombre del producto es obligatorio';
    }

    if (!data.category) {
      errors.category = 'Debes seleccionar una categoría';
    }

    if (!data.salePrice || parseFloat(data.salePrice) <= 0) {
      errors.salePrice =
        'El precio de venta es obligatorio y debe ser mayor a 0';
    }

    if (!mainImageUrl && !product) {
      errors.image = 'Debes subir una imagen principal del producto';
    }

    if (data.cost && parseFloat(data.cost) < 0) {
      errors.cost = 'El costo no puede ser negativo';
    }

    if (
      data.profitMargin &&
      (parseFloat(data.profitMargin) < 0 || parseFloat(data.profitMargin) > 100)
    ) {
      errors.profitMargin = 'El margen debe estar entre 0 y 100%';
    }

    if (data.promoPrice && parseFloat(data.promoPrice) < 0) {
      errors.promoPrice = 'El precio promocional no puede ser negativo';
    }

    if (data.stock && parseInt(data.stock) < 0) {
      errors.stock = 'El stock no puede ser negativo';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit del formulario
  const onSubmit = async (data) => {
    if (!validateForm(data)) {
      toast.error('Por favor completa todos los campos obligatorios');
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
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

      if (data.stock !== undefined && data.stock !== '') {
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

      // Variantes de talle
      if (sizes.length > 0) {
        productData.sizes = sizes
          .filter((s) => s.size)
          .map((s) => ({
            size: s.size,
            stock: parseInt(s.stock) || 0,
            sku: s.sku || undefined,
          }));
      }

      // Variantes de color
      if (colors.length > 0) {
        productData.colors = colors
          .filter((c) => c.name)
          .map((c) => ({
            name: c.name,
            hexCode: c.hexCode || undefined,
            stock: parseInt(c.stock) || 0,
            imageUrl: c.imageUrl || undefined,
          }));
      }

      // Imagen principal
      if (mainImageUrl) {
        productData.imageUrl = mainImageUrl;

        if (mainImageInfo) {
          productData.imageCloudinaryInfo = {
            publicId: mainImageInfo.public_id,
            format: mainImageInfo.format,
            width: mainImageInfo.width,
            height: mainImageInfo.height,
            bytes: mainImageInfo.bytes,
          };
        }
      }

      // Imágenes adicionales
      productData.additionalImages = additionalImages.map((img) => ({
        imageUrl: img.imageUrl,
        description: img.description || '',
        color: img.color || '',
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

      // Enviar a API
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
          : 'Producto creado correctamente'
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Volver
      </button>

      <h1 className="text-2xl font-semibold mb-6">
        {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
      </h1>

      {/* Mensaje de errores */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Por favor completa los campos obligatorios:
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  validationErrors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Camisa Slim Fit Oxford, Remera Básica..."
                {...register('title')}
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.title}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción
              </label>
              <textarea
                id="description"
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
                placeholder="Descripción detallada del producto..."
                {...register('description')}
              />
            </div>

            {/* Categoría */}
            <FormInputOptions
              id="category"
              name="Categoría"
              inputError={validationErrors.category}
              register={register}
              options={[
                // Ropa superior
                { value: 'camisas', name: 'Camisas' },
                { value: 'remeras', name: 'Remeras' },
                { value: 'polos', name: 'Polos' },
                { value: 'sweaters', name: 'Sweaters' },
                { value: 'buzos', name: 'Buzos' },
                { value: 'camperas', name: 'Camperas' },
                { value: 'chalecos', name: 'Chalecos' },
                { value: 'sacos', name: 'Sacos' },
                { value: 'trajes', name: 'Trajes' },
                // Ropa inferior
                { value: 'pantalones', name: 'Pantalones' },
                { value: 'jeans', name: 'Jeans' },
                { value: 'bermudas', name: 'Bermudas' },
                { value: 'shorts', name: 'Shorts' },
                // Ropa interior
                { value: 'ropa-interior', name: 'Ropa Interior' },
                { value: 'medias', name: 'Medias' },
                { value: 'boxers', name: 'Boxers' },
                { value: 'slips', name: 'Slips' },
                // Calzado
                { value: 'zapatillas', name: 'Zapatillas' },
                { value: 'zapatos', name: 'Zapatos' },
                { value: 'botas', name: 'Botas' },
                { value: 'sandalias', name: 'Sandalias' },
                { value: 'ojotas', name: 'Ojotas' },
                // Accesorios
                { value: 'cinturones', name: 'Cinturones' },
                { value: 'carteras', name: 'Carteras' },
                { value: 'mochilas', name: 'Mochilas' },
                { value: 'gorras', name: 'Gorras' },
                { value: 'sombreros', name: 'Sombreros' },
                { value: 'bufandas', name: 'Bufandas' },
                { value: 'guantes', name: 'Guantes' },
                { value: 'billeteras', name: 'Billeteras' },
                { value: 'lentes', name: 'Lentes' },
                { value: 'relojes', name: 'Relojes' },
                // Estilos
                { value: 'deportivo', name: 'Deportivo' },
                { value: 'formal', name: 'Formal' },
                { value: 'casual', name: 'Casual' },
                { value: 'urbano', name: 'Urbano' },
                { value: 'elegante-sport', name: 'Elegante Sport' },
                { value: 'otros', name: 'Otros' },
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="salePrice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Precio de venta (ARS) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                  </span>
                  <input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full pl-7 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      validationErrors.salePrice
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    {...register('salePrice')}
                  />
                </div>
                {validationErrors.salePrice && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.salePrice}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stock total
                </label>
                <input
                  type="number"
                  id="stock"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    validationErrors.stock
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Se calcula auto si hay variantes"
                  {...register('stock')}
                />
                {validationErrors.stock && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.stock}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="season"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Temporada
              </label>
              <select
                id="season"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
                {...register('season')}
              >
                <option value="todo-el-año">Todo el año</option>
                <option value="primavera-verano">Primavera-Verano</option>
                <option value="otoño-invierno">Otoño-Invierno</option>
              </select>
            </div>
          </div>

          {/* Columna derecha - Imágenes */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes del producto{' '}
                {!product && <span className="text-red-500">*</span>}
              </label>
              <div
                className={`${
                  validationErrors.image ? 'ring-2 ring-red-500 rounded-lg' : ''
                }`}
              >
                <MultipleImageUploader
                  mainImage={mainImageUrl}
                  additionalImages={additionalImages}
                  colors={colors.map((c) => c.name).filter(Boolean)}
                  onMainImageChange={handleMainImageChange}
                  onAddImage={handleAddImage}
                  onRemoveImage={handleRemoveImage}
                  descriptions={true}
                />
              </div>
              {validationErrors.image && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.image}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Variantes (Talles y Colores) */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowVariants(!showVariants)}
            className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
          >
            <span className="text-lg font-medium text-gray-800">
              Variantes (Talles y Colores)
            </span>
            <svg
              className={`h-5 w-5 transform transition-transform ${
                showVariants ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showVariants && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-6">
              {/* Talles */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Talles</h3>
                  <button
                    type="button"
                    onClick={addSize}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Agregar talle
                  </button>
                </div>
                <div className="space-y-2">
                  {sizes.map((size, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={size.size}
                        onChange={(e) =>
                          updateSize(index, 'size', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Seleccionar talle</option>
                        <optgroup label="Letras">
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                          <option value="XXXL">XXXL</option>
                        </optgroup>
                        <optgroup label="Números (Ropa)">
                          <option value="36">36</option>
                          <option value="38">38</option>
                          <option value="40">40</option>
                          <option value="42">42</option>
                          <option value="44">44</option>
                          <option value="46">46</option>
                          <option value="48">48</option>
                          <option value="50">50</option>
                          <option value="52">52</option>
                        </optgroup>
                        <optgroup label="Calzado">
                          <option value="39">39</option>
                          <option value="40">40</option>
                          <option value="41">41</option>
                          <option value="42">42</option>
                          <option value="43">43</option>
                          <option value="44">44</option>
                          <option value="45">45</option>
                          <option value="46">46</option>
                        </optgroup>
                        <option value="UNICO">Único</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Stock"
                        min="0"
                        value={size.stock}
                        onChange={(e) =>
                          updateSize(index, 'stock', e.target.value)
                        }
                        className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="SKU (opcional)"
                        value={size.sku}
                        onChange={(e) =>
                          updateSize(index, 'sku', e.target.value)
                        }
                        className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colores */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Colores</h3>
                  <button
                    type="button"
                    onClick={addColor}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Agregar color
                  </button>
                </div>
                <div className="space-y-2">
                  {colors.map((color, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={color.name}
                        onChange={(e) =>
                          updateColor(index, 'name', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="color"
                        value={color.hexCode || '#000000'}
                        onChange={(e) =>
                          updateColor(index, 'hexCode', e.target.value)
                        }
                        className="w-12 h-10 border rounded-lg cursor-pointer"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        min="0"
                        value={color.stock}
                        onChange={(e) =>
                          updateColor(index, 'stock', e.target.value)
                        }
                        className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
            className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
          >
            <span className="text-lg font-medium text-gray-800">
              Información adicional (opcional)
            </span>
            <svg
              className={`h-5 w-5 transform transition-transform ${
                showAdditionalInfo ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showAdditionalInfo && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="brand"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Marca
                  </label>
                  <input
                    type="text"
                    id="brand"
                    placeholder="Ej: Nike, Adidas..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    {...register('brand')}
                  />
                </div>

                <div>
                  <label
                    htmlFor="material"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Material
                  </label>
                  <input
                    type="text"
                    id="material"
                    placeholder="Ej: Algodón, Poliéster..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    {...register('material')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="origin"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Origen
                  </label>
                  <input
                    type="text"
                    id="origin"
                    placeholder="Ej: Argentina, China..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    {...register('origin')}
                  />
                </div>

                <div>
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Peso (gramos)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    min="0"
                    placeholder="Para cálculo de envío"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    {...register('weight')}
                  />
                </div>
              </div>

              {/* Composición */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Composición
                  </label>
                  <button
                    type="button"
                    onClick={() => addToArray(setComposition, composition)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="space-y-1">
                  {composition.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 px-3 py-1 bg-white border rounded text-sm">
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          removeFromArray(setComposition, composition, index)
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instrucciones de cuidado */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Instrucciones de cuidado
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      addToArray(setCareInstructions, careInstructions)
                    }
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="space-y-1">
                  {careInstructions.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 px-3 py-1 bg-white border rounded text-sm">
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          removeFromArray(
                            setCareInstructions,
                            careInstructions,
                            index
                          )
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Etiquetas (para búsqueda)
                  </label>
                  <button
                    type="button"
                    onClick={() => addToArray(setTags, tags)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeFromArray(setTags, tags, index)}
                        className="hover:text-indigo-600"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información financiera */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowFinancialInfo(!showFinancialInfo)}
            className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
          >
            <span className="text-lg font-medium text-gray-800">
              Información financiera (opcional)
            </span>
            <svg
              className={`h-5 w-5 transform transition-transform ${
                showFinancialInfo ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showFinancialInfo && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
              <div>
                <label
                  htmlFor="cost"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Costo (ARS)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                  </span>
                  <input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full pl-7 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      validationErrors.cost
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    {...register('cost')}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Costo interno del producto (no visible para clientes)
                </p>
              </div>

              <div>
                <label
                  htmlFor="promoPrice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Precio promocional (ARS)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                  </span>
                  <input
                    id="promoPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full pl-7 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      validationErrors.promoPrice
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    {...register('promoPrice')}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Precio de oferta (dejar vacío si no aplica)
                </p>
              </div>

              <div>
                <div className="flex justify-between">
                  <label
                    htmlFor="profitMargin"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Margen de ganancia (%)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoCalculate"
                      checked={autoCalculateMargin}
                      onChange={() =>
                        setAutoCalculateMargin(!autoCalculateMargin)
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="autoCalculate"
                      className="ml-2 text-xs text-gray-600"
                    >
                      Calcular automáticamente
                    </label>
                  </div>
                </div>
                <input
                  type="number"
                  id="profitMargin"
                  step="0.01"
                  min="0"
                  max="100"
                  disabled={autoCalculateMargin}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    autoCalculateMargin ? 'bg-gray-100' : ''
                  }`}
                  {...register('profitMargin')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Opciones finales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="sku"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              SKU (Código de producto)
            </label>
            <input
              type="text"
              id="sku"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
              placeholder="Se generará automáticamente si se deja vacío"
              {...register('sku')}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <input
                id="featured"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                {...register('featured')}
              />
              <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                Producto destacado
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="isNew"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                {...register('isNew')}
              />
              <label htmlFor="isNew" className="ml-2 text-sm text-gray-700">
                Producto nuevo
              </label>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition mr-4"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Guardando...
              </span>
            ) : (
              'Guardar Producto'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
