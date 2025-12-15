// src/app/api/size-guides/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SizeGuide from '@/models/SizeGuide';

/**
 * GET /api/size-guides
 * Obtiene todas las guías de talles o una específica por categoría
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Si se especifica una categoría, buscar solo esa
    if (category) {
      const guide = await SizeGuide.findOne({ category, isActive: true });

      if (!guide) {
        return NextResponse.json(
          { message: 'No se encontró guía de talles para esta categoría' },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, guide });
    }

    // Si no, devolver todas las guías activas
    const guides = await SizeGuide.find({ isActive: true }).sort({
      category: 1,
    });

    return NextResponse.json({
      success: true,
      guides,
      count: guides.length,
    });
  } catch (error) {
    console.error('❌ Error al obtener guías de talles:', error);
    return NextResponse.json(
      { message: 'Error al obtener guías de talles', error: error.message },
      { status: 500 },
    );
  }
}

/**
 * POST /api/size-guides
 * Crea una nueva guía de talles
 */
export async function POST(request) {
  try {
    await dbConnect();

    const data = await request.json();

    // Validar que la categoría no exista ya
    const existingGuide = await SizeGuide.findOne({ category: data.category });

    if (existingGuide) {
      return NextResponse.json(
        { message: 'Ya existe una guía para esta categoría' },
        { status: 400 },
      );
    }

    // Crear nueva guía
    const guide = new SizeGuide({
      category: data.category,
      description:
        data.description || 'Todas las medidas están en centímetros (cm)',
      measurements: data.measurements || [],
      notes: data.notes || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    await guide.save();

    return NextResponse.json(
      {
        success: true,
        guide,
        message: 'Guía de talles creada exitosamente',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('❌ Error al crear guía de talles:', error);
    return NextResponse.json(
      { message: 'Error al crear guía de talles', error: error.message },
      { status: 500 },
    );
  }
}
