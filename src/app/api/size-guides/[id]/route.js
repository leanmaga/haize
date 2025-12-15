// src/app/api/size-guides/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SizeGuide from '@/models/SizeGuide';

/**
 * GET /api/size-guides/[id]
 * Obtiene una guía de talles específica por ID
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const guide = await SizeGuide.findById(params.id);

    if (!guide) {
      return NextResponse.json(
        { message: 'Guía de talles no encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, guide });
  } catch (error) {
    console.error('❌ Error al obtener guía de talles:', error);
    return NextResponse.json(
      { message: 'Error al obtener guía de talles', error: error.message },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/size-guides/[id]
 * Actualiza una guía de talles existente
 */
export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const data = await request.json();

    const guide = await SizeGuide.findById(params.id);

    if (!guide) {
      return NextResponse.json(
        { message: 'Guía de talles no encontrada' },
        { status: 404 },
      );
    }

    // Actualizar campos
    if (data.description !== undefined) guide.description = data.description;
    if (data.measurements !== undefined) guide.measurements = data.measurements;
    if (data.notes !== undefined) guide.notes = data.notes;
    if (data.isActive !== undefined) guide.isActive = data.isActive;

    await guide.save();

    return NextResponse.json({
      success: true,
      guide,
      message: 'Guía de talles actualizada exitosamente',
    });
  } catch (error) {
    console.error('❌ Error al actualizar guía de talles:', error);
    return NextResponse.json(
      { message: 'Error al actualizar guía de talles', error: error.message },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/size-guides/[id]
 * Elimina una guía de talles
 */
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const guide = await SizeGuide.findByIdAndDelete(params.id);

    if (!guide) {
      return NextResponse.json(
        { message: 'Guía de talles no encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Guía de talles eliminada exitosamente',
    });
  } catch (error) {
    console.error('❌ Error al eliminar guía de talles:', error);
    return NextResponse.json(
      { message: 'Error al eliminar guía de talles', error: error.message },
      { status: 500 },
    );
  }
}
