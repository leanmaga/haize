// app/api/products/[id]/route.js - MODIFICADO PARA WIZARD
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

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 },
      );
    }

    // Asegurar que variants existe
    if (!product.variants) {
      product.variants = [];
    }

    // Compatibilidad con productos creados antes de que `imageUrl` fuera el
    // formato canónico. Esto permite que el formulario de edición muestre la
    // foto previa y que el siguiente guardado la migre sin perderla.
    const legacyImages = Array.isArray(product.images) ? product.images : [];
    const primaryLegacyImage = legacyImages.find((image) => image?.isPrimary);
    const readImageUrl = (image) =>
      typeof image === 'string' ? image : image?.imageUrl || image?.url;

    if (!product.imageUrl) {
      product.imageUrl = readImageUrl(primaryLegacyImage) || readImageUrl(legacyImages[0]) || '';
    }

    product.additionalImages = (product.additionalImages || []).map((image) => ({
      ...image,
      imageUrl: readImageUrl(image) || '',
    }));

    return NextResponse.json(product);
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { message: 'ID de producto inválido' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: 'Error al obtener producto' },
      { status: 500 },
    );
  }
}

// PUT para actualizar un producto (MODIFICADO PARA WIZARD)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y permisos
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    await connectDB();

    // Verificar si el producto existe
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 },
      );
    }

    // ============ NUEVO: DETECTAR SI ES WIZARD ============
    const isWizardDraft = data.creationStep && !data.isComplete;

    // Si es wizard draft, validaciones más flexibles
    if (isWizardDraft) {
      // Permitir actualización parcial
      const updateData = {};

      // Paso 1
      if (data.model !== undefined) updateData.model = data.model;

      // Paso 2
      if (data.variants !== undefined) updateData.variants = data.variants;
      if (data.images !== undefined) updateData.images = data.images;
      if (data.sizeGuide !== undefined) updateData.sizeGuide = data.sizeGuide;
      if (data.hasSizeGuide !== undefined)
        updateData.hasSizeGuide = data.hasSizeGuide;

      // Actualizar title si cambió el model
      if (data.model && !data.title) {
        updateData.title = `Haize - ${data.model}`;
      }

      // Metadata del wizard
      if (data.creationStep !== undefined)
        updateData.creationStep = data.creationStep;
      if (data.isComplete !== undefined)
        updateData.isComplete = data.isComplete;

      // Si se completa el wizard, activar el producto
      if (data.isComplete === true) {
        updateData.isActive = true;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: false }, // No validar en borradores
      );

      return NextResponse.json({
        success: true,
        product: updatedProduct,
        message: 'Borrador actualizado',
      });
    }

    // ============ PRODUCTO COMPLETO (ORIGINAL) ============
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
        { status: 400 },
      );
    }

    // Validar que el precio de venta sea mayor a 0
    if (Number.parseFloat(data.salePrice) <= 0) {
      return NextResponse.json(
        { message: 'El precio de venta debe ser mayor a 0' },
        { status: 400 },
      );
    }

    const updatedVariants =
      data.variants !== undefined
        ? data.variants
        : existingProduct.variants || [];
    const variantStock = updatedVariants.reduce((total, variant) => {
      if (Array.isArray(variant.sizes)) {
        return total + variant.sizes.reduce(
          (sizeTotal, size) => sizeTotal + (Number.parseInt(size.stock, 10) || 0),
          0,
        );
      }

      return total + (Number.parseInt(variant.stock, 10) || 0);
    }, 0);
    const hasVariants = updatedVariants.length > 0;
    const requestedStock = Number.parseInt(data.stock, 10);

    // Preparar los datos a actualizar
    const updateData = {
      title: data.title.trim(),
      description:
        data.description?.trim() || existingProduct.description || '',
      salePrice: Number.parseFloat(data.salePrice),
      category: data.category,
      featured:
        data.featured !== undefined ? data.featured : existingProduct.featured,
      isNew: data.isNew !== undefined ? data.isNew : existingProduct.isNew,
      season: data.season || existingProduct.season || 'todo-el-año',
      // Las variantes son la fuente de verdad del inventario. Así un stock
      // cargado en el wizard queda también disponible en el producto.
      stock: hasVariants
        ? variantStock
        : Number.isNaN(requestedStock)
          ? existingProduct.stock || 0
          : requestedStock,

      // Campos opcionales
      promoPrice: data.promoPrice ? Number.parseFloat(data.promoPrice) : 0,
      cost: data.cost
        ? Number.parseFloat(data.cost)
        : existingProduct.cost || 0,
      profitMargin: data.profitMargin
        ? Number.parseFloat(data.profitMargin)
        : existingProduct.profitMargin || 0,
      sku: data.sku?.trim() || existingProduct.sku || undefined,
      material: data.material?.trim() || existingProduct.material || '',
      origin: data.origin?.trim() || existingProduct.origin || '',
      weight: data.weight
        ? Number.parseFloat(data.weight)
        : existingProduct.weight || 0,

      // Arrays
      sizes:
        data.sizes !== undefined ? data.sizes : existingProduct.sizes || [],
      colors:
        data.colors !== undefined ? data.colors : existingProduct.colors || [],
      composition:
        data.composition !== undefined
          ? data.composition
          : existingProduct.composition || [],
      careInstructions:
        data.careInstructions !== undefined
          ? data.careInstructions
          : existingProduct.careInstructions || [],
      tags: data.tags !== undefined ? data.tags : existingProduct.tags || [],

      // Variantes
      variants: updatedVariants,

      // Imágenes
      imageUrl: data.imageUrl || existingProduct.imageUrl,
      additionalImages:
        data.additionalImages !== undefined
          ? data.additionalImages
          : existingProduct.additionalImages || [],
      imageCloudinaryInfo:
        data.imageCloudinaryInfo || existingProduct.imageCloudinaryInfo || {},

      // Campos del wizard
      model: data.model || existingProduct.model || '',
      sizeGuide:
        data.sizeGuide !== undefined
          ? data.sizeGuide
          : existingProduct.sizeGuide,
      hasSizeGuide:
        data.hasSizeGuide !== undefined
          ? data.hasSizeGuide
          : existingProduct.hasSizeGuide,
      creationStep: data.creationStep || existingProduct.creationStep || 6,
      isComplete:
        data.isComplete !== undefined
          ? data.isComplete
          : existingProduct.isComplete,
      isActive:
        data.isActive !== undefined ? data.isActive : existingProduct.isActive,
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Producto actualizado exitosamente',
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        {
          message: `Ya existe un producto con este ${field}`,
          field,
        },
        { status: 400 },
      );
    }

    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));

      return NextResponse.json(
        {
          message: 'Error de validación',
          errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: 'Error al actualizar producto',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Error interno',
      },
      { status: 500 },
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

    await connectDB();

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado exitosamente',
    });
  } catch (error) {
    console.error('❌ Error deleting product:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { message: 'ID de producto inválido' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: 'Error al eliminar producto' },
      { status: 500 },
    );
  }
}
