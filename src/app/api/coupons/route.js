import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // ✅ CORRECTO
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';

// GET /api/coupons - Listar todos los cupones (solo admin)
export async function GET(request) {
  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden acceder.' },
        { status: 403 },
      );
    }

    await connectDB();

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'inactive', 'expired', 'all'
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // 'createdAt', 'code', 'usedCount'
    const order = searchParams.get('order') || 'desc'; // 'asc', 'desc'

    // Construir filtro
    let filter = {};

    if (status === 'active') {
      filter.isActive = true;
      filter.$or = [
        { expirationType: 'manual' },
        { expirationDate: { $gte: new Date() } },
      ];
    } else if (status === 'inactive') {
      filter.isActive = false;
    } else if (status === 'expired') {
      filter.expirationType = 'date';
      filter.expirationDate = { $lt: new Date() };
    }
    // Si status es 'all' o no se especifica, no aplicar filtro

    // Obtener cupones
    const coupons = await Coupon.find(filter)
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 });

    // Calcular estadísticas
    const stats = {
      total: coupons.length,
      active: coupons.filter((c) => c.isActive && c.isAvailable().valid).length,
      inactive: coupons.filter((c) => !c.isActive).length,
      expired: coupons.filter(
        (c) => c.expirationType === 'date' && c.expirationDate < new Date(),
      ).length,
      totalUsed: coupons.reduce((sum, c) => sum + c.usedCount, 0),
    };

    return NextResponse.json({
      success: true,
      coupons,
      stats,
    });
  } catch (error) {
    console.error('Error al obtener cupones:', error);
    return NextResponse.json(
      { error: 'Error al obtener cupones', details: error.message },
      { status: 500 },
    );
  }
}

// POST /api/coupons - Crear nuevo cupón (solo admin)
export async function POST(request) {
  try {
    // Verificar autenticación y rol de admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden crear cupones.' },
        { status: 403 },
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumPurchase,
      usageType,
      usageLimit,
      expirationType,
      expirationDate,
    } = body;

    // Validaciones básicas
    if (
      !code ||
      !discountType ||
      !discountValue ||
      !usageType ||
      !expirationType
    ) {
      return NextResponse.json(
        {
          error: 'Faltan campos obligatorios',
          required: [
            'code',
            'discountType',
            'discountValue',
            'usageType',
            'expirationType',
          ],
        },
        { status: 400 },
      );
    }

    // Verificar si el código ya existe
    const existingCoupon = await Coupon.findByCode(code);
    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Ya existe un cupón con este código' },
        { status: 409 },
      );
    }

    // Validar tipo de descuento
    if (!['percentage', 'fixed'].includes(discountType)) {
      return NextResponse.json(
        {
          error: 'Tipo de descuento inválido. Debe ser "percentage" o "fixed"',
        },
        { status: 400 },
      );
    }

    // Validar valor de descuento
    if (discountValue <= 0) {
      return NextResponse.json(
        { error: 'El valor del descuento debe ser mayor a 0' },
        { status: 400 },
      );
    }

    if (discountType === 'percentage' && discountValue > 100) {
      return NextResponse.json(
        { error: 'El porcentaje de descuento no puede exceder 100%' },
        { status: 400 },
      );
    }

    // Validar tipo de uso
    if (!['single', 'reusable'].includes(usageType)) {
      return NextResponse.json(
        { error: 'Tipo de uso inválido. Debe ser "single" o "reusable"' },
        { status: 400 },
      );
    }

    // Validar tipo de expiración
    if (!['date', 'manual'].includes(expirationType)) {
      return NextResponse.json(
        { error: 'Tipo de expiración inválido. Debe ser "date" o "manual"' },
        { status: 400 },
      );
    }

    // Validar fecha de expiración si es necesaria
    if (expirationType === 'date') {
      if (!expirationDate) {
        return NextResponse.json(
          { error: 'Se requiere fecha de expiración para tipo "date"' },
          { status: 400 },
        );
      }

      const expDate = new Date(expirationDate);
      if (expDate <= new Date()) {
        return NextResponse.json(
          { error: 'La fecha de expiración debe ser futura' },
          { status: 400 },
        );
      }
    }

    // Crear el cupón
    const coupon = new Coupon({
      code: code.toUpperCase().trim(),
      description: description?.trim() || '',
      discountType,
      discountValue,
      minimumPurchase: minimumPurchase || 0,
      usageType,
      usageLimit: usageType === 'single' ? 1 : usageLimit || null,
      expirationType,
      expirationDate: expirationType === 'date' ? expirationDate : null,
      isActive: true,
      createdBy: session.user.id,
    });

    await coupon.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Cupón creado exitosamente',
        coupon,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error al crear cupón:', error);

    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { error: 'Error de validación', details: errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Error al crear cupón', details: error.message },
      { status: 500 },
    );
  }
}
