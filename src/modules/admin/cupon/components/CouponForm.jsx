'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CouponForm({ coupon = null, onSuccess }) {
  const router = useRouter();
  const isEditing = !!coupon;

  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    description: coupon?.description || '',
    discountType: coupon?.discountType || 'percentage',
    discountValue: coupon?.discountValue || '',
    minimumPurchase: coupon?.minimumPurchase || 0,
    usageType: coupon?.usageType || 'reusable',
    usageLimit: coupon?.usageLimit || '',
    expirationType: coupon?.expirationType || 'manual',
    expirationDate: coupon?.expirationDate
      ? new Date(coupon.expirationDate).toISOString().split('T')[0]
      : '',
    isActive: coupon?.isActive !== undefined ? coupon.isActive : true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    } else if (formData.code.length < 3) {
      newErrors.code = 'El código debe tener al menos 3 caracteres';
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      newErrors.discountValue = 'El valor del descuento debe ser mayor a 0';
    }

    if (
      formData.discountType === 'percentage' &&
      formData.discountValue > 100
    ) {
      newErrors.discountValue = 'El porcentaje no puede exceder 100%';
    }

    if (formData.expirationType === 'date') {
      if (!formData.expirationDate) {
        newErrors.expirationDate = 'La fecha de expiración es obligatoria';
      } else {
        const expDate = new Date(formData.expirationDate);
        if (expDate <= new Date()) {
          newErrors.expirationDate = 'La fecha debe ser futura';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Por favor corregí los errores en el formulario');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/coupons/${coupon._id}` : '/api/coupons';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase().trim(),
          discountValue: parseFloat(formData.discountValue),
          minimumPurchase: parseFloat(formData.minimumPurchase) || 0,
          usageLimit:
            formData.usageType === 'reusable' && formData.usageLimit
              ? parseInt(formData.usageLimit)
              : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar cupón');
      }

      toast.success(
        isEditing
          ? 'Cupón actualizado exitosamente'
          : 'Cupón creado exitosamente',
      );

      if (onSuccess) {
        onSuccess(data.coupon);
      } else {
        router.push('/admin/coupons');
        router.refresh();
      }
    } catch (error) {
      console.error('Error al guardar cupón:', error);
      toast.error(error.message || 'Error al guardar el cupón');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Código del cupón */}
      <div>
        <label htmlFor="code" className="block text-sm font-medium mb-2">
          Código del Cupón *
        </label>
        <input
          id="code"
          name="code"
          type="text"
          value={formData.code}
          onChange={handleChange}
          disabled={isEditing} // No se puede cambiar el código en edición
          className={`w-full px-3 py-2 border ${
            errors.code ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:border-black uppercase ${
            isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          placeholder="Ej: VERANO2024"
        />
        {errors.code && (
          <p className="text-red-500 text-sm mt-1">{errors.code}</p>
        )}
        {isEditing && (
          <p className="text-gray-500 text-sm mt-1">
            El código no puede ser modificado una vez creado
          </p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Descripción (opcional)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
          placeholder="Descripción interna del cupón..."
        />
      </div>

      {/* Tipo y valor de descuento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="discountType"
            className="block text-sm font-medium mb-2"
          >
            Tipo de Descuento *
          </label>
          <select
            id="discountType"
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
          >
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Monto Fijo ($)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="discountValue"
            className="block text-sm font-medium mb-2"
          >
            Valor del Descuento *
          </label>
          <div className="relative">
            <input
              id="discountValue"
              name="discountValue"
              type="number"
              min="0"
              step={formData.discountType === 'percentage' ? '1' : '0.01'}
              value={formData.discountValue}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.discountValue ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-black`}
              placeholder={
                formData.discountType === 'percentage' ? 'Ej: 10' : 'Ej: 5000'
              }
            />
            <span className="absolute right-3 top-2 text-gray-500">
              {formData.discountType === 'percentage' ? '%' : '$'}
            </span>
          </div>
          {errors.discountValue && (
            <p className="text-red-500 text-sm mt-1">{errors.discountValue}</p>
          )}
        </div>
      </div>

      {/* Monto mínimo de compra */}
      <div>
        <label
          htmlFor="minimumPurchase"
          className="block text-sm font-medium mb-2"
        >
          Monto Mínimo de Compra (opcional)
        </label>
        <div className="relative">
          <input
            id="minimumPurchase"
            name="minimumPurchase"
            type="number"
            min="0"
            step="0.01"
            value={formData.minimumPurchase}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
            placeholder="Ej: 50000"
          />
          <span className="absolute right-3 top-2 text-gray-500">$</span>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          Dejar en 0 para no requerir monto mínimo
        </p>
      </div>

      {/* Tipo de uso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="usageType" className="block text-sm font-medium mb-2">
            Tipo de Uso *
          </label>
          <select
            id="usageType"
            name="usageType"
            value={formData.usageType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
          >
            <option value="single">Un solo uso por usuario</option>
            <option value="reusable">Reutilizable</option>
          </select>
        </div>

        {formData.usageType === 'reusable' && (
          <div>
            <label
              htmlFor="usageLimit"
              className="block text-sm font-medium mb-2"
            >
              Límite de Usos Total (opcional)
            </label>
            <input
              id="usageLimit"
              name="usageLimit"
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
              placeholder="Dejar vacío para ilimitado"
            />
          </div>
        )}
      </div>

      {/* Tipo de expiración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="expirationType"
            className="block text-sm font-medium mb-2"
          >
            Expiración *
          </label>
          <select
            id="expirationType"
            name="expirationType"
            value={formData.expirationType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
          >
            <option value="manual">Manual (desactivar manualmente)</option>
            <option value="date">Por fecha</option>
          </select>
        </div>

        {formData.expirationType === 'date' && (
          <div>
            <label
              htmlFor="expirationDate"
              className="block text-sm font-medium mb-2"
            >
              Fecha de Expiración *
            </label>
            <input
              id="expirationDate"
              name="expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border ${
                errors.expirationDate ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-black`}
            />
            {errors.expirationDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.expirationDate}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Estado activo/inactivo */}
      <div className="flex items-center gap-3">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 border-gray-300 focus:ring-black"
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          Cupón activo
        </label>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
        >
          {isSubmitting
            ? 'Guardando...'
            : isEditing
              ? 'Actualizar Cupón'
              : 'Crear Cupón'}
        </button>
      </div>
    </form>
  );
}
