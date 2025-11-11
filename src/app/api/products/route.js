// app/api/products/route.js - ACTUALIZADO PARA INDUMENTARIA
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import Product from '@/models/Product'; // ✅ Importar el modelo actualizado

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const season = searchParams.get('season');
    const featured = searchParams.get('featured');
    const isNew = searchParams.get('isNew');
    const onSale = searchParams.get('onSale');
    const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
    const maxPrice = parseFloat(searchParams.get('maxPrice'));
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    await connectDB();

    // Construir query
    let query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (brand) {
      query.brand = brand;
    }

    if (season && season !== 'all') {
      query.season = season;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (isNew === 'true') {
      query.isNew = true;
    }

    if (onSale === 'true') {
      query.onSale = true;
    }

    // Filtro de precio
    if (minPrice > 0 || maxPrice) {
      query.salePrice = {};
      if (minPrice > 0) query.salePrice.$gte = minPrice;
      if (maxPrice) query.salePrice.$lte = maxPrice;
    }

    // Búsqueda por texto
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true });

    // Obtener filtros únicos
    const [categories, brands, seasons] = await Promise.all([
      Product.distinct('category', { isActive: true }),
      Product.distinct('brand', { isActive: true }),
      Product.distinct('season', { isActive: true }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      filters: {
        categories,
        brands,
        seasons,
      },
    });
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    return NextResponse.json(
      {
        message: 'Error al obtener productos',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Error interno',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Autenticación: solo admins pueden crear productos
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    console.log('🔵 Iniciando POST /api/products');

    await connectDB();
    console.log('✅ Conectado a MongoDB');

    const data = await request.json();
    console.log('📝 Datos recibidos:', JSON.stringify(data, null, 2));

    // Validar campos requeridos
    if (!data.title || !data.salePrice || !data.category || !data.imageUrl) {
      const missingFields = [];
      if (!data.title) missingFields.push('title');
      if (!data.salePrice) missingFields.push('salePrice');
      if (!data.category) missingFields.push('category');
      if (!data.imageUrl) missingFields.push('imageUrl');

      console.log('❌ Faltan campos requeridos:', missingFields);
      return NextResponse.json(
        {
          error: 'Faltan campos requeridos',
          missingFields,
        },
        { status: 400 }
      );
    }

    // Validar que category esté en el enum
    const validCategories = [
      'camisas',
      'remeras',
      'polos',
      'sweaters',
      'buzos',
      'camperas',
      'chalecos',
      'sacos',
      'trajes',
      'pantalones',
      'jeans',
      'bermudas',
      'shorts',
      'ropa-interior',
      'medias',
      'boxers',
      'slips',
      'zapatillas',
      'zapatos',
      'botas',
      'sandalias',
      'ojotas',
      'cinturones',
      'carteras',
      'mochilas',
      'gorras',
      'sombreros',
      'bufandas',
      'guantes',
      'billeteras',
      'lentes',
      'relojes',
      'deportivo',
      'formal',
      'casual',
      'urbano',
      'elegante-sport',
      'otros',
    ];

    if (!validCategories.includes(data.category)) {
      console.log('❌ Categoría inválida:', data.category);
      return NextResponse.json(
        {
          error: 'Categoría no válida',
          category: data.category,
          validCategories,
        },
        { status: 400 }
      );
    }

    // Preparar datos del producto
    const productData = {
      title: data.title.trim(),
      description: data.description?.trim() || '',
      salePrice: parseFloat(data.salePrice),
      category: data.category,
      imageUrl: data.imageUrl,
      featured: data.featured || false,
      isNew: data.isNew || false,
      season: data.season || 'todo-el-año',
      stock: parseInt(data.stock) || 0,

      // Campos opcionales
      promoPrice: data.promoPrice ? parseFloat(data.promoPrice) : 0,
      cost: data.cost ? parseFloat(data.cost) : 0,
      profitMargin: data.profitMargin ? parseFloat(data.profitMargin) : 0,
      brand: data.brand?.trim() || '',
      material: data.material?.trim() || '',
      origin: data.origin?.trim() || '',
      weight: data.weight ? parseFloat(data.weight) : 0,
      sku: data.sku || undefined,

      // Arrays
      composition: data.composition || [],
      careInstructions: data.careInstructions || [],
      tags: data.tags || [],

      // Variantes
      sizes: data.sizes || [],
      colors: data.colors || [],

      // Imágenes
      imageCloudinaryInfo: data.imageCloudinaryInfo || {},
      additionalImages: data.additionalImages || [],
    };

    console.log('🔨 Creando producto...');
    const product = new Product(productData);

    // Validar antes de guardar
    const validationError = product.validateSync();
    if (validationError) {
      console.log('❌ Error de validación:', validationError.errors);
      const errors = {};
      Object.keys(validationError.errors).forEach((key) => {
        errors[key] = validationError.errors[key].message;
      });

      return NextResponse.json(
        {
          error: 'Error de validación',
          validationErrors: errors,
        },
        { status: 400 }
      );
    }

    console.log('💾 Guardando producto...');
    await product.save();

    console.log('✅ Producto guardado exitosamente:', product._id);

    return NextResponse.json(
      {
        success: true,
        product,
        message: 'Producto creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    console.error('Stack:', error.stack);

    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });

      return NextResponse.json(
        {
          error: 'Error de validación',
          validationErrors: errors,
        },
        { status: 400 }
      );
    }

    // Error de duplicado (SKU único)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: 'Ya existe un producto con ese SKU',
          duplicateField: Object.keys(error.keyPattern)[0],
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error al crear producto',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
