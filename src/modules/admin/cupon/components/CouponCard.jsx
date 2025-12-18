'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  TagIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export default function CouponCard({ coupon, onUpdate, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const isExpired =
    coupon.expirationType === 'date' &&
    new Date(coupon.expirationDate) < new Date();

  const isAtLimit =
    coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;

  const isAvailable = coupon.isActive && !isExpired && !isAtLimit;

  const handleToggleActive = async () => {
    try {
      const response = await fetch(`/api/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !coupon.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar cupón');
      }

      toast.success(
        `Cupón ${coupon.isActive ? 'desactivado' : 'activado'} exitosamente`,
      );
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el cupón');
    }
  };

  const handleDelete = async () => {
    if (coupon.usedCount > 0) {
      toast.error(
        'No se puede eliminar un cupón que ya ha sido usado. Desactívalo en su lugar.',
        { duration: 5000 },
      );
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el cupón "${coupon.code}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/coupons/${coupon._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar cupón');
      }

      toast.success('Cupón eliminado exitosamente');
      onDelete(coupon._id);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar el cupón');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = () => {
    if (!coupon.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
          <XCircleIcon className="h-4 w-4" />
          Inactivo
        </span>
      );
    }

    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
          <ClockIcon className="h-4 w-4" />
          Expirado
        </span>
      );
    }

    if (isAtLimit) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
          <UsersIcon className="h-4 w-4" />
          Límite alcanzado
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
        <CheckCircleIcon className="h-4 w-4" />
        Activo
      </span>
    );
  };

  const getDiscountDisplay = () => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    }
    return `$${coupon.discountValue.toLocaleString('es-AR')} OFF`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`border rounded-lg p-6 transition-all ${
        isAvailable
          ? 'border-gray-200 bg-white'
          : 'border-gray-200 bg-gray-50 opacity-75'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${
              isAvailable ? 'bg-black' : 'bg-gray-400'
            }`}
          >
            <TagIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold font-sora-regular">
              {coupon.code}
            </h3>
            {coupon.description && (
              <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
            )}
          </div>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Discount Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-black">
            {getDiscountDisplay()}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {coupon.minimumPurchase > 0 &&
              `Compra mínima: $${coupon.minimumPurchase.toLocaleString('es-AR')}`}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Tipo de uso</p>
          <p className="font-medium">
            {coupon.usageType === 'single' ? 'Un solo uso' : 'Reutilizable'}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Usos</p>
          <p className="font-medium">
            {coupon.usedCount}
            {coupon.usageLimit !== null && ` / ${coupon.usageLimit}`}
            {coupon.usageLimit === null && ' (ilimitado)'}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Expiración</p>
          <p className="font-medium">
            {coupon.expirationType === 'manual'
              ? 'Manual'
              : formatDate(coupon.expirationDate)}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Creado</p>
          <p className="font-medium">{formatDate(coupon.createdAt)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={() =>
            (window.location.href = `/admin/coupons/${coupon._id}`)
          }
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <PencilIcon className="h-4 w-4" />
          Editar
        </button>

        <button
          onClick={handleToggleActive}
          className={`flex-1 px-4 py-2 transition-colors ${
            coupon.isActive
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {coupon.isActive ? 'Desactivar' : 'Activar'}
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting || coupon.usedCount > 0}
          className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          title={
            coupon.usedCount > 0
              ? 'No se puede eliminar un cupón usado'
              : 'Eliminar cupón'
          }
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
