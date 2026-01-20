// app/api/products/route.js - MODIFICADO PARA WIZARD
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

// GET - Obtener todos los productos con filtros y paginación
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = Number.parseInt(searchParams.get('page')) || 1;
    const limit = Number.parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener productos',
        message:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Error interno',
      },
      { status: 500 },
    );
  }
}

// POST - Crear nuevo producto (MODIFICADO PARA WIZARD)
export async function POST(request) {
  try {
    // Autenticación: solo admins pueden crear productos
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    // Validar que el body tenga contenido
    let data;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { error: 'Body vacío - no se enviaron datos' },
          { status: 400 },
        );
      }
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError);
      return NextResponse.json(
        {
          error: 'JSON inválido',
          message: parseError.message,
        },
        { status: 400 },
      );
    }

    // Validar que data tenga al menos algunos campos
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Datos inválidos - se esperaba un objeto JSON' },
        { status: 400 },
      );
    }

    // ============ NUEVO: DETECTAR SI ES WIZARD ============
    const isWizardDraft = data.creationStep && !data.isComplete;

    // Si es wizard draft, validaciones más flexibles
    if (isWizardDraft) {
      // Solo validar campos del paso actual
      if (data.creationStep === 1) {
        // Paso 1: Características principales
        if (!data.model || !data.gender || !data.category) {
          return NextResponse.json(
            {
              error: 'Faltan campos del Paso 1',
              missingFields: ['model', 'gender', 'category'],
            },
            { status: 400 },
          );
        }
      }

      // Crear producto borrador
      const productData = {
        // Paso 1
        brand: data.brand || 'Haize',
        model: data.model,
        gender: data.gender,
        category: data.category, // ← Respetar el valor enviado, sin default

        // Campos con valores por defecto para cumplir schema
        title:
          data.title ||
          `${data.brand || 'Haize'} - ${data.model || 'Producto'}`,
        salePrice: data.salePrice || 0,
        imageUrl: data.imageUrl || 'https://via.placeholder.com/400',

        // Paso 2
        variants: data.variants || [],
        images: data.images || [],
        sizeGuide: data.sizeGuide || null,
        hasSizeGuide: data.hasSizeGuide || false,

        // Metadata del wizard
        creationStep: data.creationStep,
        isComplete: false,
        isActive: false, // No mostrar borradores en la tienda

        // Otros campos opcionales
        description: data.description || '',
        featured: false,
        isNew: false,
        season: 'todo-el-año',
        stock: 0,
      };

      const newProduct = await Product.create(productData);

      return NextResponse.json({
        success: true,
        product: newProduct,
        message: 'Borrador guardado',
      });
    }

    // ============ PRODUCTO COMPLETO (ORIGINAL) ============
    // Validar campos requeridos
    if (!data.title || !data.salePrice || !data.category || !data.imageUrl) {
      const missingFields = [];
      if (!data.title) missingFields.push('title');
      if (!data.salePrice) missingFields.push('salePrice');
      if (!data.category) missingFields.push('category');
      if (!data.imageUrl) missingFields.push('imageUrl');

      return NextResponse.json(
        {
          error: 'Faltan campos requeridos',
          missingFields,
        },
        { status: 400 },
      );
    }

    // Validar que category esté en el enum
    const validCategories = [
      'remeras',
      'camisas',
      'pantalones',
      'shorts',
      'musculosas',
      'conjuntos',
    ];

    if (!validCategories.includes(data.category)) {
      return NextResponse.json(
        {
          error: 'Categoría no válida',
          category: data.category,
          validCategories,
        },
        { status: 400 },
      );
    }

    // Preparar datos del producto
    const productData = {
      title: data.title.trim(),
      description: data.description?.trim() || '',
      salePrice: Number.parseFloat(data.salePrice),
      category: data.category,
      imageUrl: data.imageUrl,
      featured: data.featured || false,
      isNew: data.isNew || false,
      season: data.season || 'todo-el-año',
      stock: Number.parseInt(data.stock, 10) || 0,

      // Campos opcionales
      promoPrice: data.promoPrice ? Number.parseFloat(data.promoPrice) : 0,
      cost: data.cost ? Number.parseFloat(data.cost) : 0,
      profitMargin: data.profitMargin
        ? Number.parseFloat(data.profitMargin)
        : 0,
      brand: data.brand?.trim() || 'Haize',
      material: data.material?.trim() || '',
      origin: data.origin?.trim() || '',
      weight: data.weight ? Number.parseFloat(data.weight) : 0,

      // Arrays
      sizes: data.sizes || [],
      colors: data.colors || [],
      composition: data.composition || [],
      careInstructions: data.careInstructions || [],
      tags: data.tags || [],

      // Variantes combinadas
      variants: data.variants || [],

      // Imágenes
      additionalImages: data.additionalImages || [],
      imageCloudinaryInfo: data.imageCloudinaryInfo || {},

      // Campos del wizard
      model: data.model || '',
      gender: data.gender || '',
      sizeGuide: data.sizeGuide || null,
      hasSizeGuide: data.hasSizeGuide || false,
      creationStep: data.creationStep || 6,
      isComplete: data.isComplete !== undefined ? data.isComplete : true,
      isActive: data.isActive !== undefined ? data.isActive : true,
    };

    const newProduct = await Product.create(productData);

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Producto creado exitosamente',
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        {
          error: `Ya existe un producto con este ${field}`,
          field,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: 'Error al crear producto',
        message:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Error interno',
      },
      { status: 500 },
    );
  }
}
