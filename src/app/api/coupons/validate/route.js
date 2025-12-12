import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // ✅ CORRECTO
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';

// POST /api/coupons/validate - Validar y calcular descuento de un cupón
export async function POST(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para usar cupones' },
        { status: 401 },
      );
    }

    await connectDB();

    const body = await request.json();
    const { code, subtotal } = body;

    // Validar datos de entrada
    if (!code || !subtotal) {
      return NextResponse.json(
        { error: 'Se requiere código de cupón y subtotal' },
        { status: 400 },
      );
    }

    if (subtotal <= 0) {
      return NextResponse.json(
        { error: 'El subtotal debe ser mayor a 0' },
        { status: 400 },
      );
    }

    // Buscar el cupón por código
    const coupon = await Coupon.findByCode(code);

    if (!coupon) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Cupón no encontrado',
          message: 'El código ingresado no es válido',
        },
        { status: 404 },
      );
    }

    // Verificar si el cupón está disponible
    const availability = coupon.isAvailable();
    if (!availability.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Cupón no disponible',
          message: availability.reason,
        },
        { status: 400 },
      );
    }

    // Verificar si el usuario puede usar este cupón
    const userCanUse = coupon.canUserUse(session.user.id);
    if (!userCanUse.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Cupón no disponible para este usuario',
          message: userCanUse.reason,
        },
        { status: 400 },
      );
    }

    // Calcular el descuento
    const discountResult = coupon.calculateDiscount(subtotal);

    if (!discountResult.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Requisitos no cumplidos',
          message: discountResult.reason,
        },
        { status: 400 },
      );
    }

    // Devolver información del cupón y descuento calculado
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount: {
        amount: discountResult.discount,
        finalAmount: discountResult.finalAmount,
        originalAmount: subtotal,
      },
      message: `¡Cupón aplicado! Ahorrás $${discountResult.discount.toLocaleString('es-AR')}`,
    });
  } catch (error) {
    console.error('Error al validar cupón:', error);
    return NextResponse.json(
      { error: 'Error al validar cupón', details: error.message },
      { status: 500 },
    );
  }
}
