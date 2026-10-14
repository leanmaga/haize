// components/admin/products/steps/Step3VariantsAndPhotos.jsx
'use client';

import React, { useState, useEffect } from 'react';
import ProductColorPicker from '@/components/admin/ProductColorPicker';
import { colorHex } from '@/lib/product-colors';
import PhotoUploadLoader from '@/components/admin/PhotoUploadLoader';
import { preloadUploadedImages } from '@/lib/preload-uploaded-images';
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
  const [savedColors, setSavedColors] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/product-colors', { cache: 'no-store', signal: controller.signal })
      .then((response) => response.ok ? response.json() : { colors: [] })
      .then((data) => { if (!controller.signal.aborted) setSavedColors(data.colors || []); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const [expandedVariant, setExpandedVariant] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingVariant, setUploadingVariant] = useState(null);
  const [generatingVariant, setGeneratingVariant] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [sizeGuide, setSizeGuide] = useState(null);
  const [loadingSizeGuide, setLoadingSizeGuide] = useState(false);
  const [toast, setToast] = useState(null);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4200);
  };

  // Cargar guía de talles al montar
  useEffect(() => {
    if (data.sizeGuide || data.hasSizeGuide) {
      loadSizeGuide();
    }
  }, [data.sizeGuide, data.hasSizeGuide]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setPreviewImage(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  // Inicializar variantes desde data si existen
  useEffect(() => {
    const readImageUrl = (image) =>
      typeof image === 'string' ? image : image?.url || image?.imageUrl;
    const fallbackPhotos = [
      ...(Array.isArray(data.images) ? data.images : []),
      data.imageUrl,
      ...(Array.isArray(data.additionalImages) ? data.additionalImages : []),
    ]
      .map(readImageUrl)
      .filter(Boolean);
    const hasVariantPhotos = data.variants?.some(
      (variant) => Array.isArray(variant.images) && variant.images.length > 0,
    );

    if (data.variants && data.variants.length > 0) {
      // Reconstruir variantes desde el formato del modelo
      const variantsMap = new Map();

      data.variants.forEach((v) => {
        const key = `${v.color}-${v.fabricDesign || ''}`;
        if (!variantsMap.has(key)) {
          variantsMap.set(key, {
            id: Date.now() + Math.random(),
            color: v.color,
            colorHex: colorHex(v.color, v.colorHex),
            fabricDesign: v.fabricDesign || '',
            photos: (v.images?.length
              ? v.images
              : !hasVariantPhotos
                ? fallbackPhotos
                : [])
              .map((image, i) => ({
                  id: Date.now() + i,
                  url: readImageUrl(image),
                  publicId: image?.publicId || `existing_${i}`,
                }))
              .filter((photo) => photo.url),
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
      // Producto antiguo sin variantes: conservar sus fotos para que el
      // editor no obligue a cargarlas de nuevo.
      setVariants([
        {
          id: Date.now(),
          color: data.colors?.[0] || 'Sin color',
          colorHex: colorHex(data.colors?.[0]),
          fabricDesign: '',
          photos: fallbackPhotos.map((url, index) => ({
            id: Date.now() + index,
            url,
            publicId: `existing_${index}`,
          })),
          sizes: data.sizes?.length
            ? data.sizes.map((size, index) => ({
                id: Date.now() + index,
                size,
                stock: index === 0 ? data.stock || 0 : 0,
                universalCode: '',
                sku: '',
                noCode: true,
              }))
            : [],
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
      showToast('Debe haber al menos una variante');
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
      showToast('Debe haber al menos un talle por variante');
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
    if (uploadingPhotos) return;
    const fileArray = Array.from(files);

    const currentPhotoCount = variants[variantIndex].photos.length;
    if (currentPhotoCount + fileArray.length > 10) {
      showToast('Máximo 10 fotos por variante');
      return;
    }

    const { validFiles, errors } = validateImageFiles(
      fileArray,
      10 - currentPhotoCount,
    );

    if (errors.length > 0) {
      showToast(`Errores en los archivos: ${errors.join(' · ')}`);
    }

    if (validFiles.length === 0) return;

    setUploadingPhotos(true);
    setUploadingVariant(variantIndex);

    try {
      const uploadedImages = await uploadImages(validFiles, (progress) => {
        console.log(`Progreso de upload: ${progress}%`);
      });

      const previewsReady = await preloadUploadedImages(uploadedImages);
      setVariants((current) => current.map((variant, index) => index === variantIndex ? {
        ...variant,
        photos: [...variant.photos, ...uploadedImages.map((img) => ({
          id: Date.now() + Math.random(),
          url: img.url,
          publicId: img.publicId,
          width: img.width,
          height: img.height,
          format: img.format,
        }))],
      } : variant));

      if (!previewsReady) {
        showToast('Las fotos se guardaron, pero alguna vista previa no pudo cargar.');
      } else if (uploadedImages.length === 1) {
        showToast('Foto subida exitosamente', 'success');
      } else {
        showToast(`${uploadedImages.length} fotos subidas exitosamente`, 'success');
      }
    } catch (error) {
      console.error('Error subiendo fotos:', error);
      showToast('Error subiendo fotos: ' + error.message);
    } finally {
      setUploadingPhotos(false);
      setUploadingVariant(null);
    }
  };

  const handleRemovePhoto = async (variantIndex, photoIndex) => {
    setPhotoToDelete({ variantIndex, photoIndex });
  };

  const confirmRemovePhoto = async () => {
    if (!photoToDelete) return;
    const { variantIndex, photoIndex } = photoToDelete;
    const photo = variants[variantIndex].photos[photoIndex];
    setPhotoToDelete(null);

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
        showToast(
          'La foto se eliminará localmente pero hubo un error al eliminarla de Cloudinary: ' +
            error.message,
        );
      }
    }

    const updatedVariants = [...variants];
    updatedVariants[variantIndex].photos.splice(photoIndex, 1);
    setVariants(updatedVariants);
  };

  const handleGeneratePhotosWithAI = async (variantIndex) => {
    const reference = variants[variantIndex]?.photos?.[0];
    if (!reference?.url) {
      showToast('Subí primero una foto de la prenda para usarla como referencia.');
      return;
    }
    setGeneratingVariant(variantIndex);
    setGeneratedImage(null);
    try {
      const response = await fetch('/api/admin/ai/product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: reference.url,
          color: variants[variantIndex].color,
          fabricDesign: variants[variantIndex].fabricDesign,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo generar la imagen');
      setGeneratedImage({ variantIndex, url: result.image });
    } catch (error) {
      showToast(error.message);
    } finally {
      setGeneratingVariant(null);
    }
  };

  const handleApproveGeneratedImage = async () => {
    if (!generatedImage || uploadingPhotos) return;
    setUploadingPhotos(true);
    setUploadingVariant(generatedImage.variantIndex);
    try {
      const response = await fetch(generatedImage.url);
      const blob = await response.blob();
      const file = new File([blob], `haize-ai-${Date.now()}.png`, { type: 'image/png' });
      const uploaded = await uploadImages([file]);
      const previewsReady = await preloadUploadedImages(uploaded);
      const updatedVariants = [...variants];
      updatedVariants[generatedImage.variantIndex].photos.push({
        id: Date.now() + Math.random(),
        url: uploaded[0].url,
        publicId: uploaded[0].publicId,
        width: uploaded[0].width,
        height: uploaded[0].height,
        format: uploaded[0].format,
      });
      setVariants(updatedVariants);
      setGeneratedImage(null);
      if (!previewsReady) showToast('La foto se guardó, pero la vista previa no pudo cargar.');
    } catch (error) {
      showToast(`No se pudo guardar la imagen generada: ${error.message}`);
    } finally {
      setUploadingPhotos(false);
      setUploadingVariant(null);
    }
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
      showToast('Por favor completa todos los campos requeridos');
      return;
    }

    // Convertir variantes al formato del modelo
    const formattedVariants = [];
    variants.forEach((variant) => {
      variant.sizes.forEach((size) => {
        formattedVariants.push({
          color: variant.color,
          colorHex: colorHex(variant.color, variant.colorHex),
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
      {toast && (
        <div
          role="status"
          className={`fixed right-6 top-6 z-[60] flex max-w-md items-start gap-3 rounded-lg border bg-white px-4 py-3 text-sm shadow-xl ${
            toast.type === 'success'
              ? 'border-black text-black'
              : 'border-gray-300 text-gray-900'
          }`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-gray-500 hover:text-black"
            aria-label="Cerrar notificación"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {photoToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-photo-title"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded-lg border border-gray-300 bg-white p-6 shadow-2xl">
            <h2 id="delete-photo-title" className="text-lg font-semibold text-black">
              Eliminar foto
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              ¿Estás seguro de que querés eliminar esta foto? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-black hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmRemovePhoto}
                className="bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
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
                          <ProductColorPicker
                            value={variant.color}
                            hex={variant.colorHex}
                            colors={[...savedColors, ...variants.filter((entry) => entry.color).map((entry) => ({ name: entry.color, hex: colorHex(entry.color, entry.colorHex) }))]}
                            onChange={(color, hex) => setVariants((current) => current.map((entry, index) => index === variantIndex ? { ...entry, color, colorHex: hex } : entry))}
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
                        disabled={generatingVariant === variantIndex || uploadingPhotos}
                        className="inline-flex items-center border border-black bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {generatingVariant === variantIndex ? 'Generando...' : 'Generar foto con IA'}
                      </button>

                      {generatedImage?.variantIndex === variantIndex && (
                        <div className="mt-4 border border-gray-300 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-900 mb-3">
                            Vista previa generada
                          </p>
                          <img
                            src={generatedImage.url}
                            alt="Vista previa generada con IA"
                            className="w-full max-w-sm h-64 object-contain border rounded-md bg-gray-50"
                          />
                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              onClick={handleApproveGeneratedImage}
                              disabled={uploadingPhotos}
                              className="bg-black px-5 py-3 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                              Aprobar y guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => setGeneratedImage(null)}
                              disabled={uploadingPhotos}
                              className="border border-gray-300 bg-white px-5 py-3 text-sm text-black hover:bg-gray-100"
                            >
                              Descartar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Upload de fotos */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fotos (requerido)
                        </label>

                        <div aria-busy={uploadingVariant === variantIndex} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => {
                              handlePhotoUpload(variantIndex, e.target.files);
                              e.target.value = '';
                            }}
                            className="hidden"
                            id={`photo-upload-${variantIndex}`}
                            disabled={uploadingPhotos}
                          />
                          {uploadingVariant === variantIndex ? <PhotoUploadLoader /> : <label
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
                          </label>}
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
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(photo.url)}
                                  className="block w-full cursor-zoom-in"
                                  aria-label={`Ampliar foto ${photoIndex + 1}`}
                                >
                                  <img
                                    src={photo.url}
                                    alt={`Foto ${photoIndex + 1}`}
                                    className="w-full h-24 object-cover rounded border"
                                  />
                                </button>
                                {photoIndex === 0 && (
                                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                    PORTADA
                                  </div>
                                )}
                                <button
                                  type="button"
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

      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada de la foto"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute right-5 top-5 rounded-full bg-white p-2 text-black shadow-lg"
            aria-label="Cerrar imagen ampliada"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={previewImage}
            alt="Foto ampliada"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

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
