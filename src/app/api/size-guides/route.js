// app/api/size-guides/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import SizeGuide from '@/models/SizeGuide';
import Product from '@/models/Product';

// GET - Obtener todas las guías o por productId
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (productId) {
      // Buscar por productId
      const sizeGuide = await SizeGuide.findOne({
        productId,
        isActive: true,
      });

      if (!sizeGuide) {
        return NextResponse.json(
          { error: 'No se encontró guía de talles para este producto' },
          { status: 404 },
        );
      }

      return NextResponse.json(sizeGuide);
    }

    // Listar todas
    const sizeGuides = await SizeGuide.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(sizeGuides);
  } catch (error) {
    console.error('Error obteniendo guías de talles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Crear nueva guía de talles
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    const data = await request.json();
    const { productId, name, method, sizes } = data;

    // Validar campos requeridos
    if (!name || !method || !sizes || sizes.length === 0) {
      return NextResponse.json(
        { error: 'Nombre, método y al menos un talle son requeridos' },
        { status: 400 },
      );
    }

    // Verificar si ya existe una guía para este producto
    if (productId) {
      const existingGuide = await SizeGuide.findOne({ productId });
      if (existingGuide) {
        return NextResponse.json(
          { error: 'Este producto ya tiene una guía de talles' },
          { status: 400 },
        );
      }

      // Verificar que el producto existe
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { error: 'Producto no encontrado' },
          { status: 404 },
        );
      }
    }

    // Crear la guía
    const sizeGuide = new SizeGuide({
      productId,
      name,
      method,
      sizes,
    });

    await sizeGuide.save();

    // Actualizar el producto si hay productId
    if (productId) {
      await Product.findByIdAndUpdate(productId, {
        sizeGuide: sizeGuide._id,
        hasSizeGuide: true,
      });
    }

    return NextResponse.json(
      {
        message: 'Guía de talles creada exitosamente',
        sizeGuide,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creando guía de talles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
