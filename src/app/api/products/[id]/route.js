// app/api/products/[id]/route.js - ACTUALIZADO PARA INDUMENTARIA
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

// GET para obtener un producto específico por ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const product = await Product.findById(id).lean({ virtuals: true });

    if (!product) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { message: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

// PUT para actualizar un producto - INDUMENTARIA
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y permisos
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    console.log('📝 Actualizando producto:', id);
    console.log('📦 Datos recibidos:', JSON.stringify(data, null, 2));

    await connectDB();

    // Verificar si el producto existe
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Validaciones de campos obligatorios
    if (!data.title || !data.salePrice || !data.category) {
      const missingFields = [];
      if (!data.title) missingFields.push('title');
      if (!data.salePrice) missingFields.push('salePrice');
      if (!data.category) missingFields.push('category');

      return NextResponse.json(
        {
          message: 'Faltan campos obligatorios',
          missingFields,
        },
        { status: 400 }
      );
    }

    // Validar que el precio de venta sea mayor a 0
    if (parseFloat(data.salePrice) <= 0) {
      return NextResponse.json(
        { message: 'El precio de venta debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Validar categorías válidas para indumentaria
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
      return NextResponse.json(
        {
          message: 'Categoría no válida',
          category: data.category,
          validCategories,
        },
        { status: 400 }
      );
    }

    // Preparar datos del producto para actualizar
    const productData = {
      title: data.title.trim(),
      description: data.description?.trim() || '',
      salePrice: parseFloat(data.salePrice),
      category: data.category,
      featured: data.featured || false,
      isNew: data.isNew || false,
      season: data.season || 'todo-el-año',
      stock: parseInt(data.stock) || 0,
    };

    // Campos opcionales de indumentaria
    if (data.brand !== undefined) {
      productData.brand = data.brand?.trim() || '';
    }

    if (data.material !== undefined) {
      productData.material = data.material?.trim() || '';
    }

    if (data.origin !== undefined) {
      productData.origin = data.origin?.trim() || '';
    }

    if (data.weight !== undefined) {
      productData.weight = data.weight ? parseFloat(data.weight) : 0;
    }

    // Arrays
    if (data.composition !== undefined) {
      productData.composition = Array.isArray(data.composition)
        ? data.composition
        : [];
    }

    if (data.careInstructions !== undefined) {
      productData.careInstructions = Array.isArray(data.careInstructions)
        ? data.careInstructions
        : [];
    }

    if (data.tags !== undefined) {
      productData.tags = Array.isArray(data.tags) ? data.tags : [];
    }

    // Variantes de talle
    if (data.sizes !== undefined) {
      productData.sizes = Array.isArray(data.sizes)
        ? data.sizes
            .filter((s) => s.size)
            .map((s) => ({
              size: s.size,
              stock: parseInt(s.stock) || 0,
              sku: s.sku || undefined,
            }))
        : [];
    }

    // Variantes de color
    if (data.colors !== undefined) {
      productData.colors = Array.isArray(data.colors)
        ? data.colors
            .filter((c) => c.name)
            .map((c) => ({
              name: c.name,
              hexCode: c.hexCode || undefined,
              stock: parseInt(c.stock) || 0,
              imageUrl: c.imageUrl || undefined,
              imageCloudinaryInfo: c.imageCloudinaryInfo || undefined,
            }))
        : [];
    }

    // Manejo de imagen principal
    if (data.imageUrl) {
      productData.imageUrl = data.imageUrl;
    }

    // Información adicional de Cloudinary para imagen principal
    if (data.imageCloudinaryInfo) {
      productData.imageCloudinaryInfo = {
        publicId: data.imageCloudinaryInfo.publicId,
        format: data.imageCloudinaryInfo.format,
        width: data.imageCloudinaryInfo.width,
        height: data.imageCloudinaryInfo.height,
        bytes: data.imageCloudinaryInfo.bytes,
      };
    }

    // Procesar imágenes adicionales
    if (data.additionalImages !== undefined) {
      if (Array.isArray(data.additionalImages)) {
        productData.additionalImages = data.additionalImages.map((img) => ({
          imageUrl: img.imageUrl,
          description: img.description || '',
          color: img.color || '',
          ...(img.imageCloudinaryInfo && {
            imageCloudinaryInfo: {
              publicId: img.imageCloudinaryInfo.publicId,
              format: img.imageCloudinaryInfo.format,
              width: img.imageCloudinaryInfo.width,
              height: img.imageCloudinaryInfo.height,
              bytes: img.imageCloudinaryInfo.bytes,
            },
          }),
        }));
      } else {
        productData.additionalImages = [];
      }
    }

    // Campos financieros opcionales
    if (data.promoPrice !== undefined) {
      productData.promoPrice = data.promoPrice
        ? parseFloat(data.promoPrice)
        : 0;
    }

    if (data.cost !== undefined) {
      productData.cost = data.cost ? parseFloat(data.cost) : 0;
    }

    if (data.profitMargin !== undefined) {
      productData.profitMargin = data.profitMargin
        ? parseFloat(data.profitMargin)
        : 0;
    }

    // SKU
    if (data.sku !== undefined) {
      // Solo actualizar SKU si se proporciona y es diferente
      if (data.sku && data.sku !== existingProduct.sku) {
        // Verificar que no exista otro producto con ese SKU
        const duplicateSku = await Product.findOne({
          sku: data.sku,
          _id: { $ne: id },
        });

        if (duplicateSku) {
          return NextResponse.json(
            { message: 'Ya existe otro producto con ese SKU' },
            { status: 400 }
          );
        }

        productData.sku = data.sku;
      } else if (!data.sku) {
        // Si se envía vacío, no actualizar
        delete productData.sku;
      }
    }

    console.log(
      '💾 Actualizando con datos:',
      JSON.stringify(productData, null, 2)
    );

    // Actualizar el producto
    const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
      new: true, // Devuelve el documento actualizado
      runValidators: true, // Ejecuta las validaciones del modelo
    }).lean({ virtuals: true });

    console.log('✅ Producto actualizado exitosamente');

    return NextResponse.json({
      message: 'Producto actualizado correctamente',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    console.error('Stack:', error.stack);

    // Manejo de errores más específico
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      Object.keys(error.errors).forEach((field) => {
        validationErrors[field] = error.errors[field].message;
      });

      return NextResponse.json(
        {
          message: 'Error de validación',
          validationErrors,
        },
        { status: 400 }
      );
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        { message: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    // Error de SKU duplicado
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Ya existe un producto con ese SKU' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: 'Error al actualizar producto',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE para eliminar un producto
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;

    console.log('🗑️ Eliminando producto:', id);

    await connectDB();

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Producto eliminado exitosamente');

    return NextResponse.json({
      message: 'Producto eliminado con éxito',
      deletedId: id,
    });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { message: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: 'Error al eliminar producto',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
