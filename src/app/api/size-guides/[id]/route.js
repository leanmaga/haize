// app/api/size-guides/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import SizeGuide from '@/models/SizeGuide';

// GET - Obtener guía específica
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const sizeGuide = await SizeGuide.findById(id);

    if (!sizeGuide) {
      return NextResponse.json(
        { error: 'Guía de talles no encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json(sizeGuide);
  } catch (error) {
    console.error('Error obteniendo guía de talles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Actualizar guía de talles
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const data = await request.json();

    const sizeGuide = await SizeGuide.findById(id);
    if (!sizeGuide) {
      return NextResponse.json(
        { error: 'Guía de talles no encontrada' },
        { status: 404 },
      );
    }

    // Actualizar campos
    if (data.name) sizeGuide.name = data.name;
    if (data.method) sizeGuide.method = data.method;
    if (data.sizes) sizeGuide.sizes = data.sizes;

    await sizeGuide.save();

    return NextResponse.json({
      message: 'Guía de talles actualizada exitosamente',
      sizeGuide,
    });
  } catch (error) {
    console.error('Error actualizando guía de talles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Eliminar guía de talles (soft delete)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const sizeGuide = await SizeGuide.findById(id);

    if (!sizeGuide) {
      return NextResponse.json(
        { error: 'Guía de talles no encontrada' },
        { status: 404 },
      );
    }

    sizeGuide.isActive = false;
    await sizeGuide.save();

    return NextResponse.json({
      message: 'Guía de talles eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando guía de talles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
