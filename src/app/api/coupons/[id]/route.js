import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // ✅ CORRECTO
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';

// GET /api/coupons/[id] - Obtener un cupón específico (solo admin)
export async function GET(request, { params }) {
  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const coupon = await Coupon.findById(id).populate(
      'createdBy',
      'name email',
    );

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error('Error al obtener cupón:', error);
    return NextResponse.json(
      { error: 'Error al obtener cupón', details: error.message },
      { status: 500 },
    );
  }
}

// PUT /api/coupons/[id] - Actualizar un cupón (solo admin)
export async function PUT(request, { params }) {
  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error:
            'No autorizado. Solo administradores pueden actualizar cupones.',
        },
        { status: 403 },
      );
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Buscar el cupón
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 },
      );
    }

    const {
      description,
      discountType,
      discountValue,
      minimumPurchase,
      usageType,
      usageLimit,
      expirationType,
      expirationDate,
      isActive,
    } = body;

    // Validar tipo de descuento si se actualiza
    if (discountType && !['percentage', 'fixed'].includes(discountType)) {
      return NextResponse.json(
        { error: 'Tipo de descuento inválido' },
        { status: 400 },
      );
    }

    // Validar valor de descuento si se actualiza
    if (discountValue !== undefined) {
      if (discountValue <= 0) {
        return NextResponse.json(
          { error: 'El valor del descuento debe ser mayor a 0' },
          { status: 400 },
        );
      }

      const type = discountType || coupon.discountType;
      if (type === 'percentage' && discountValue > 100) {
        return NextResponse.json(
          { error: 'El porcentaje no puede exceder 100%' },
          { status: 400 },
        );
      }
    }

    // Validar tipo de uso si se actualiza
    if (usageType && !['single', 'reusable'].includes(usageType)) {
      return NextResponse.json(
        { error: 'Tipo de uso inválido' },
        { status: 400 },
      );
    }

    // Validar tipo de expiración si se actualiza
    if (expirationType && !['date', 'manual'].includes(expirationType)) {
      return NextResponse.json(
        { error: 'Tipo de expiración inválido' },
        { status: 400 },
      );
    }

    // Validar fecha de expiración si es necesaria
    if (
      expirationType === 'date' ||
      (coupon.expirationType === 'date' && expirationDate)
    ) {
      if (!expirationDate && expirationType === 'date') {
        return NextResponse.json(
          { error: 'Se requiere fecha de expiración para tipo "date"' },
          { status: 400 },
        );
      }

      if (expirationDate) {
        const expDate = new Date(expirationDate);
        if (expDate <= new Date()) {
          return NextResponse.json(
            { error: 'La fecha de expiración debe ser futura' },
            { status: 400 },
          );
        }
      }
    }

    // No permitir cambiar el código
    if (body.code && body.code !== coupon.code) {
      return NextResponse.json(
        { error: 'No se puede cambiar el código de un cupón existente' },
        { status: 400 },
      );
    }

    // Actualizar campos
    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minimumPurchase !== undefined) coupon.minimumPurchase = minimumPurchase;
    if (usageType) coupon.usageType = usageType;
    if (usageLimit !== undefined) {
      coupon.usageLimit = usageType === 'single' ? 1 : usageLimit;
    }
    if (expirationType) coupon.expirationType = expirationType;
    if (expirationDate !== undefined) {
      coupon.expirationDate = expirationType === 'date' ? expirationDate : null;
    }
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    return NextResponse.json({
      success: true,
      message: 'Cupón actualizado exitosamente',
      coupon,
    });
  } catch (error) {
    console.error('Error al actualizar cupón:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: 'Error de validación', details: errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar cupón', details: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/coupons/[id] - Eliminar un cupón (solo admin)
export async function DELETE(request, { params }) {
  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'No autorizado. Solo administradores pueden eliminar cupones.',
        },
        { status: 403 },
      );
    }

    await connectDB();

    const { id } = await params;

    // Buscar el cupón
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupón no encontrado' },
        { status: 404 },
      );
    }

    // Verificar si el cupón ha sido usado
    if (coupon.usedCount > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar un cupón que ya ha sido usado',
          suggestion: 'Considera desactivarlo en lugar de eliminarlo',
        },
        { status: 400 },
      );
    }

    await Coupon.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Cupón eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar cupón:', error);
    return NextResponse.json(
      { error: 'Error al eliminar cupón', details: error.message },
      { status: 500 },
    );
  }
}
