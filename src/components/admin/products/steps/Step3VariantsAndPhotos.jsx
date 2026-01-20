// components/admin/products/steps/Step3VariantsAndPhotos.jsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Info,
  Trash2,
  Sparkles,
} from 'lucide-react';
import {
  uploadImages,
  deleteImage,
  validateImageFiles,
} from '@/lib/services/uploadService';

const Step3VariantsAndPhotos = ({
  data,
  onNext,
  onBack,
  onCancel,
  updateData,
  loading,
  errors,
  isFirstStep,
  isLastStep,
}) => {
  const [variants, setVariants] = useState([]);
  const [expandedVariant, setExpandedVariant] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [sizeGuide, setSizeGuide] = useState(null);
  const [loadingSizeGuide, setLoadingSizeGuide] = useState(false);

  // Cargar guía de talles al montar
  useEffect(() => {
    if (data.sizeGuide || data.hasSizeGuide) {
      loadSizeGuide();
    }
  }, [data.sizeGuide, data.hasSizeGuide]);

  // Inicializar variantes desde data si existen
  useEffect(() => {
    if (data.variants && data.variants.length > 0) {
      // Reconstruir variantes desde el formato del modelo
      const variantsMap = new Map();

      data.variants.forEach((v) => {
        const key = `${v.color}-${v.fabricDesign || ''}`;
        if (!variantsMap.has(key)) {
          variantsMap.set(key, {
            id: Date.now() + Math.random(),
            color: v.color,
            fabricDesign: v.fabricDesign || '',
            photos: v.images
              ? v.images.map((url, i) => ({
                  id: Date.now() + i,
                  url,
                  publicId: `existing_${i}`,
                }))
              : [],
            sizes: [],
            isPrimary: v.isPrimary || false,
          });
        }

        const variant = variantsMap.get(key);
        variant.sizes.push({
          id: Date.now() + Math.random(),
          size: v.size,
          stock: v.stock,
          universalCode: v.universalCode || '',
          sku: v.sku || '',
          noCode: !v.universalCode,
        });
      });

      setVariants(Array.from(variantsMap.values()));
    } else {
      // Crear primera variante vacía
      setVariants([
        {
          id: Date.now(),
          color: '',
          fabricDesign: '',
          photos: [],
          sizes: [],
          isPrimary: true,
        },
      ]);
      setExpandedVariant(0);
    }
  }, []);

  const loadSizeGuide = async () => {
    try {
      setLoadingSizeGuide(true);

      // Si hay ID de guía de talles, cargarla
      let guideId = data.sizeGuide;

      // Si no hay ID pero hay productId, intentar cargar por productId
      if (!guideId && data._id) {
        const response = await fetch(`/api/size-guides?productId=${data._id}`);

        if (response.ok) {
          const guide = await response.json();
          guideId = guide._id;
          setSizeGuide(guide);
        }
      } else if (guideId) {
        const response = await fetch(`/api/size-guides/${guideId}`);

        if (response.ok) {
          const guide = await response.json();
          setSizeGuide(guide);
        }
      }
    } catch (error) {
      console.error('Error cargando guía de talles:', error);
    } finally {
      setLoadingSizeGuide(false);
    }
  };

  const getAvailableSizes = () => {
    if (!sizeGuide || !sizeGuide.sizes) {
      // Talles por defecto si no hay guía
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    }

    // Extraer talles únicos de la guía
    const sizes = sizeGuide.sizes.map((s) => s.labelSize);
    return [...new Set(sizes)];
  };

  const handleAddVariant = () => {
    const newVariant = {
      id: Date.now(),
      color: '',
      fabricDesign: '',
      photos: [],
      sizes: [],
      isPrimary: false,
    };

    setVariants([...variants, newVariant]);
    setExpandedVariant(variants.length);
  };

  const handleRemoveVariant = (variantIndex) => {
    if (variants.length === 1) {
      alert('Debe haber al menos una variante');
      return;
    }

    const updatedVariants = variants.filter(
      (_, index) => index !== variantIndex,
    );

    // Si se elimina la variante principal, hacer que la primera sea principal
    if (variants[variantIndex].isPrimary && updatedVariants.length > 0) {
      updatedVariants[0].isPrimary = true;
    }

    setVariants(updatedVariants);
    setExpandedVariant(null);
  };

  const handleVariantChange = (variantIndex, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex][field] = value;
    setVariants(updatedVariants);
  };

  const handleSetPrimary = (variantIndex) => {
    const updatedVariants = variants.map((variant, index) => ({
      ...variant,
      isPrimary: index === variantIndex,
    }));
    setVariants(updatedVariants);
  };

  const handleAddSize = (variantIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].sizes.push({
      id: Date.now(),
      size: '',
      stock: 1,
      universalCode: '',
      sku: '',
      noCode: false,
    });
    setVariants(updatedVariants);
  };

  const handleRemoveSize = (variantIndex, sizeIndex) => {
    const updatedVariants = [...variants];
    if (updatedVariants[variantIndex].sizes.length === 1) {
      alert('Debe haber al menos un talle por variante');
      return;
    }
    updatedVariants[variantIndex].sizes.splice(sizeIndex, 1);
    setVariants(updatedVariants);
  };

  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].sizes[sizeIndex][field] = value;
    setVariants(updatedVariants);
  };

  const handlePhotoUpload = async (variantIndex, files) => {
    const fileArray = Array.from(files);

    const currentPhotoCount = variants[variantIndex].photos.length;
    if (currentPhotoCount + fileArray.length > 10) {
      alert('Máximo 10 fotos por variante');
      return;
    }

    const { validFiles, errors } = validateImageFiles(
      fileArray,
      10 - currentPhotoCount,
    );

    if (errors.length > 0) {
      alert('Errores en los archivos:\n' + errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    setUploadingPhotos(true);

    try {
      const uploadedImages = await uploadImages(validFiles, (progress) => {
        console.log(`Progreso de upload: ${progress}%`);
      });

      const updatedVariants = [...variants];
      updatedVariants[variantIndex].photos = [
        ...updatedVariants[variantIndex].photos,
        ...uploadedImages.map((img) => ({
          id: Date.now() + Math.random(),
          url: img.url,
          publicId: img.publicId,
          width: img.width,
          height: img.height,
          format: img.format,
        })),
      ];
      setVariants(updatedVariants);

      if (uploadedImages.length === 1) {
        alert('Foto subida exitosamente');
      } else {
        alert(`${uploadedImages.length} fotos subidas exitosamente`);
      }
    } catch (error) {
      console.error('Error subiendo fotos:', error);
      alert('Error subiendo fotos: ' + error.message);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = async (variantIndex, photoIndex) => {
    const photo = variants[variantIndex].photos[photoIndex];

    if (!window.confirm('¿Estás seguro de eliminar esta foto?')) {
      return;
    }

    if (
      photo.publicId &&
      !photo.publicId.startsWith('temp_') &&
      !photo.publicId.startsWith('existing_')
    ) {
      try {
        await deleteImage(photo.publicId);
        console.log('Foto eliminada de Cloudinary');
      } catch (error) {
        console.error('Error eliminando de Cloudinary:', error);
        alert(
          'La foto se eliminará localmente pero hubo un error al eliminarla de Cloudinary: ' +
            error.message,
        );
      }
    }

    const updatedVariants = [...variants];
    updatedVariants[variantIndex].photos.splice(photoIndex, 1);
    setVariants(updatedVariants);
  };

  const handleGeneratePhotosWithAI = (variantIndex) => {
    alert('Función de generación de fotos con IA - Por implementar');
  };

  const getTotalStock = (variant) => {
    return variant.sizes.reduce(
      (total, size) => total + (parseInt(size.stock) || 0),
      0,
    );
  };

  const getSizesLabel = (variant) => {
    return variant.sizes
      .map((s) => s.size)
      .filter(Boolean)
      .join(', ');
  };

  const validateForm = () => {
    const newErrors = {};

    variants.forEach((variant, vIndex) => {
      if (!variant.color.trim()) {
        newErrors[`variant_${vIndex}_color`] = 'El color es requerido';
      }

      if (variant.photos.length === 0) {
        newErrors[`variant_${vIndex}_photos`] =
          'Debe agregar al menos una foto';
      }

      if (variant.sizes.length === 0) {
        newErrors[`variant_${vIndex}_sizes`] = 'Debe agregar al menos un talle';
      }

      variant.sizes.forEach((size, sIndex) => {
        if (!size.size) {
          newErrors[`variant_${vIndex}_size_${sIndex}_size`] =
            'El talle es requerido';
        }
        if (!size.stock || size.stock < 1) {
          newErrors[`variant_${vIndex}_size_${sIndex}_stock`] =
            'El stock debe ser mayor a 0';
        }
      });
    });

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Convertir variantes al formato del modelo
    const formattedVariants = [];
    variants.forEach((variant) => {
      variant.sizes.forEach((size) => {
        formattedVariants.push({
          color: variant.color,
          fabricDesign: variant.fabricDesign,
          size: size.size,
          sku:
            size.sku ||
            `${data.model}-${variant.color}-${size.size}`
              .toUpperCase()
              .replace(/\s/g, '-'),
          stock: parseInt(size.stock),
          universalCode: size.universalCode,
          images: variant.photos.map((p) => p.url),
          isPrimary: variant.isPrimary,
        });
      });
    });

    const stepData = {
      variants: formattedVariants,
      images:
        variants
          .find((v) => v.isPrimary)
          ?.photos.map((p) => ({
            url: p.url,
            publicId: p.publicId,
            isPrimary: true,
          })) || [],
    };

    const success = await onNext(stepData);
  };

  const availableSizes = getAvailableSizes();

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Variantes y fotos
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Sumá color, fotos, talles de la guía seleccionada, cantidad y otros
          datos específicos para cada variante de tu producto.
        </p>
      </div>

      {/* Contenido */}
      <div className="px-6 py-6">
        {/* Recomendaciones de fotos */}
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-blue-700 font-medium">
                Lográ fotos de calidad siguiendo nuestras recomendaciones
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Al subir tus fotos asegurate de usar un fondo con texturas, para
                que el producto se vea más real.
              </p>
              <a
                href="#"
                className="text-sm text-blue-600 underline mt-2 inline-block"
              >
                Conocer cómo deben ser mis fotos
              </a>
            </div>
          </div>
        </div>

        {/* Mensaje sobre guía de talles */}
        {loadingSizeGuide ? (
          <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
            Cargando guía de talles...
          </div>
        ) : sizeGuide ? (
          <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
            <p className="text-sm text-green-800">
              ✓ Usando talles de la guía: <strong>{sizeGuide.name}</strong>
            </p>
            <p className="text-xs text-green-700 mt-1">
              Talles disponibles: {availableSizes.join(', ')}
            </p>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-sm text-yellow-800">
              No hay guía de talles configurada. Se usarán talles estándar.
            </p>
          </div>
        )}

        {/* Lista de variantes en modo edición */}
        {expandedVariant !== null && (
          <div className="mb-6">
            {variants.map(
              (variant, variantIndex) =>
                expandedVariant === variantIndex && (
                  <div
                    key={variant.id}
                    className="border border-gray-300 rounded-lg overflow-hidden mb-4"
                  >
                    {/* Header de variante */}
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <h3 className="font-medium">
                        {variant.color || 'Nueva variante'}
                        {variant.fabricDesign && ` / ${variant.fabricDesign}`}
                        {variant.isPrimary && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            VARIANTE PRINCIPAL
                          </span>
                        )}
                      </h3>
                      <button
                        onClick={() => setExpandedVariant(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Contenido de variante */}
                    <div className="p-4 space-y-6">
                      {/* Color y Diseño de tela */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color (requerido)
                          </label>
                          <input
                            type="text"
                            value={variant.color}
                            onChange={(e) =>
                              handleVariantChange(
                                variantIndex,
                                'color',
                                e.target.value,
                              )
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors[`variant_${variantIndex}_color`]
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                            }`}
                            placeholder="Ej: Amarillo"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span>Diseño de la tela</span>
                            <Info className="inline-block w-4 h-4 ml-1 text-gray-400" />
                          </label>
                          <input
                            type="text"
                            value={variant.fabricDesign}
                            onChange={(e) =>
                              handleVariantChange(
                                variantIndex,
                                'fabricDesign',
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Ajedrez"
                          />
                        </div>
                      </div>

                      {/* Generar fotos con IA */}
                      <button
                        type="button"
                        onClick={() => handleGeneratePhotosWithAI(variantIndex)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generar fotos con IA
                      </button>

                      {/* Upload de fotos */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fotos (requerido)
                        </label>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) =>
                              handlePhotoUpload(variantIndex, e.target.files)
                            }
                            className="hidden"
                            id={`photo-upload-${variantIndex}`}
                            disabled={uploadingPhotos}
                          />
                          <label
                            htmlFor={`photo-upload-${variantIndex}`}
                            className="cursor-pointer"
                          >
                            <Upload className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                            <p className="text-sm text-blue-600 font-medium">
                              Seleccionar o arrastrar los archivos aquí
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Subí máximo 10 fotos en formato JPG, JPEG, PNG o
                              WEBP, asegurate de que tenga más de 500 píxeles en
                              alguno de sus lados y peso máximo de 10 MB.
                            </p>
                          </label>
                        </div>

                        {formErrors[`variant_${variantIndex}_photos`] && (
                          <p className="mt-2 text-sm text-red-600">
                            {formErrors[`variant_${variantIndex}_photos`]}
                          </p>
                        )}

                        {variant.photos.length > 0 && (
                          <div className="mt-4 grid grid-cols-5 gap-3">
                            {variant.photos.map((photo, photoIndex) => (
                              <div key={photo.id} className="relative group">
                                <img
                                  src={photo.url}
                                  alt={`Foto ${photoIndex + 1}`}
                                  className="w-full h-24 object-cover rounded border"
                                />
                                {photoIndex === 0 && (
                                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                    PORTADA
                                  </div>
                                )}
                                <button
                                  onClick={() =>
                                    handleRemovePhoto(variantIndex, photoIndex)
                                  }
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sección de talles */}
                      <div className="border-t pt-4">
                        <div className="flex items-center mb-4">
                          <ChevronDown className="w-5 h-5 text-blue-600 mr-2" />
                          <h3 className="font-medium text-gray-900">Talle</h3>
                        </div>

                        {variant.sizes.map((size, sizeIndex) => (
                          <div
                            key={size.id}
                            className="mb-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Talle (requerido)
                                </label>
                                <select
                                  value={size.size}
                                  onChange={(e) =>
                                    handleSizeChange(
                                      variantIndex,
                                      sizeIndex,
                                      'size',
                                      e.target.value,
                                    )
                                  }
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    formErrors[
                                      `variant_${variantIndex}_size_${sizeIndex}_size`
                                    ]
                                      ? 'border-red-300 bg-red-50'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  <option value="">Seleccionar talle</option>
                                  {availableSizes.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Stock (requerido)
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="1"
                                    value={size.stock}
                                    onChange={(e) =>
                                      handleSizeChange(
                                        variantIndex,
                                        sizeIndex,
                                        'stock',
                                        e.target.value,
                                      )
                                    }
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                      formErrors[
                                        `variant_${variantIndex}_size_${sizeIndex}_stock`
                                      ]
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-300'
                                    }`}
                                  />
                                  <span className="absolute right-3 top-2 text-sm text-gray-500">
                                    unidades
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  <span>Código universal de producto</span>
                                  <Info className="inline-block w-4 h-4 ml-1 text-gray-400" />
                                </label>
                                <input
                                  type="text"
                                  value={size.universalCode}
                                  onChange={(e) =>
                                    handleSizeChange(
                                      variantIndex,
                                      sizeIndex,
                                      'universalCode',
                                      e.target.value,
                                    )
                                  }
                                  disabled={size.noCode}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                  placeholder="EAN, UPC, ISBN"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Código de identificación (SKU)
                                </label>
                                <input
                                  type="text"
                                  value={size.sku}
                                  onChange={(e) =>
                                    handleSizeChange(
                                      variantIndex,
                                      sizeIndex,
                                      'sku',
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Auto-generado si se deja vacío"
                                />
                              </div>
                            </div>

                            <div className="mt-3">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={size.noCode}
                                  onChange={(e) =>
                                    handleSizeChange(
                                      variantIndex,
                                      sizeIndex,
                                      'noCode',
                                      e.target.checked,
                                    )
                                  }
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  Mi producto no lo tiene
                                </span>
                              </label>
                            </div>

                            {variant.sizes.length > 1 && (
                              <button
                                onClick={() =>
                                  handleRemoveSize(variantIndex, sizeIndex)
                                }
                                className="mt-3 text-sm text-red-600 hover:text-red-800"
                              >
                                Eliminar talle
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddSize(variantIndex)}
                          className="inline-flex items-center px-4 py-2 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Agregar Talle
                        </button>

                        {formErrors[`variant_${variantIndex}_sizes`] && (
                          <p className="mt-2 text-sm text-red-600">
                            {formErrors[`variant_${variantIndex}_sizes`]}
                          </p>
                        )}
                      </div>

                      {/* Elegir como variante principal */}
                      <div className="border-t pt-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={variant.isPrimary}
                            onChange={() => handleSetPrimary(variantIndex)}
                            className="border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Elegir como variante principal
                          </span>
                          <div className="relative group ml-2">
                            <Info className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="hidden group-hover:block absolute left-0 bottom-6 w-64 bg-gray-900 text-white text-xs p-2 rounded shadow-lg z-10">
                              Es la que tus compradores verán primero en los
                              resultados de búsqueda y en la publicación.
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ),
            )}
          </div>
        )}

        {/* Vista resumida de variantes */}
        {expandedVariant === null && (
          <div className="space-y-3 mb-6">
            {variants.map((variant, index) => (
              <div
                key={variant.id}
                className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpandedVariant(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <ChevronDown className="w-5 h-5 text-gray-400" />

                    {/* Thumbnail */}
                    {variant.photos[0] && (
                      <img
                        src={variant.photos[0].url}
                        alt={variant.color}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {variant.color || 'Sin color'}
                          {variant.fabricDesign && ` / ${variant.fabricDesign}`}
                        </span>
                        {variant.isPrimary && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            VARIANTE PRINCIPAL
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        <span>Stock total: {getTotalStock(variant)}</span>
                        <span>
                          Talle: {getSizesLabel(variant) || 'Sin talles'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  {variants.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveVariant(index);
                      }}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón agregar variante */}
        {expandedVariant === null && (
          <button
            type="button"
            onClick={handleAddVariant}
            className="inline-flex items-center px-4 py-2 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded border border-blue-200"
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar variante
          </button>
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
            disabled={loading || uploadingPhotos || expandedVariant !== null}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {loading
              ? 'Guardando...'
              : uploadingPhotos
                ? 'Subiendo fotos...'
                : expandedVariant !== null
                  ? 'Cierra la variante para continuar'
                  : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3VariantsAndPhotos;
