'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createProductRequest,
  updateProductRequest,
} from '@/redux/slices/adminProductsSlice';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CATEGORIES = ['Remeras', 'Pantalones', 'Camperas', 'Accesorios', 'Otros'];

export default function ProductForm({ editMode, onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const { selectedProduct, createLoading, updateLoading } = useSelector(
    (state) => state.adminProducts
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    costPrice: '',
    salePrice: '',
    offerPrice: '',
    category: '',
    stock: '',
    featured: false,
    sizes: [],
    colors: [],
  });

  const [images, setImages] = useState([]);
  const [colorInput, setColorInput] = useState({
    name: '',
    hexCode: '#000000',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editMode && selectedProduct) {
      setFormData({
        title: selectedProduct.title || '',
        description: selectedProduct.description || '',
        costPrice: selectedProduct.costPrice || '',
        salePrice: selectedProduct.salePrice || '',
        offerPrice: selectedProduct.offerPrice || '',
        category: selectedProduct.category || '',
        stock: selectedProduct.stock || '',
        featured: selectedProduct.featured || false,
        sizes: selectedProduct.sizes || [],
        colors: selectedProduct.colors || [],
      });
    }
  }, [editMode, selectedProduct]);

  // Efecto para cerrar el modal cuando se complete la operación
  useEffect(() => {
    if (!createLoading && !updateLoading && !isLoading && isSubmitting) {
      setIsSubmitting(false);
      onSuccess();
    }
  }, [createLoading, updateLoading, isLoading, isSubmitting, onSuccess]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    // Comprimir imágenes antes de guardarlas
    const compressedFiles = await Promise.all(
      files.map((file) => compressImage(file))
    );

    setImages(compressedFiles);
  };

  // Función para comprimir imágenes
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Redimensionar si es muy grande
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir a blob con calidad reducida
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.7 // Calidad 70%
          );
        };
      };
    });
  };

  const handleSizeToggle = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleAddColor = () => {
    if (colorInput.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, { ...colorInput }],
      }));
      setColorInput({ name: '', hexCode: '#000000' });
    }
  };

  const handleRemoveColor = (index) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevenir múltiples envíos
    if (isLoading || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const productData = {
      ...formData,
      images,
    };

    if (editMode && selectedProduct) {
      dispatch(
        updateProductRequest({ id: selectedProduct._id, ...productData })
      );
    } else {
      dispatch(createProductRequest(productData));
    }
  };

  const isLoading = createLoading || updateLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título del Producto *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Ej: Remera Oversize Premium"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Describe el producto..."
        />
      </div>

      {/* Precios */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Costo *
          </label>
          <input
            type="number"
            name="costPrice"
            value={formData.costPrice}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Venta *
          </label>
          <input
            type="number"
            name="salePrice"
            value={formData.salePrice}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Oferta
          </label>
          <input
            type="number"
            name="offerPrice"
            value={formData.offerPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      {/* Categoría y Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      {/* Talles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Talles Disponibles
        </label>
        <div className="flex gap-2 flex-wrap">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handleSizeToggle(size)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                formData.sizes.includes(size)
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-black'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colores */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Colores Disponibles
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={colorInput.name}
            onChange={(e) =>
              setColorInput({ ...colorInput, name: e.target.value })
            }
            placeholder="Nombre del color"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <input
            type="color"
            value={colorInput.hexCode}
            onChange={(e) =>
              setColorInput({ ...colorInput, hexCode: e.target.value })
            }
            className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
          />
          <button
            type="button"
            onClick={handleAddColor}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Agregar
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {formData.colors.map((color, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
            >
              <div
                className="w-6 h-6 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hexCode }}
              />
              <span className="text-sm">{color.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveColor(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes del Producto
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        />
        {images.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {images.length} imagen(es) seleccionada(s)
          </p>
        )}
      </div>

      {/* Producto Destacado */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="featured"
          checked={formData.featured}
          onChange={handleChange}
          className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
        />
        <label className="text-sm font-medium text-gray-700">
          Producto Destacado (aparecerá en el Home)
        </label>
      </div>

      {/* Botones */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? 'Guardando...'
            : editMode
            ? 'Actualizar Producto'
            : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
}
