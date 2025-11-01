import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import Product from '@/models/Product';
import dbConnect from '@/lib/mongodb';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET - Obtener un producto por ID
export async function GET(request, context) {
  try {
    await dbConnect();

    // Await params en Next.js 15+
    const { id } = await context.params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al obtener producto', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(request, context) {
  try {
    await dbConnect();

    // Await params en Next.js 15+
    const { id } = await context.params;

    const formData = await request.formData();

    // Extraer datos
    const title = formData.get('title');
    const description = formData.get('description');
    const costPrice = parseFloat(formData.get('costPrice'));
    const salePrice = parseFloat(formData.get('salePrice'));
    const offerPrice = formData.get('offerPrice')
      ? parseFloat(formData.get('offerPrice'))
      : null;
    const category = formData.get('category');
    const featured = formData.get('featured') === 'true';
    const stock = parseInt(formData.get('stock') || 0);
    const sizes = JSON.parse(formData.get('sizes') || '[]');
    const colors = JSON.parse(formData.get('colors') || '[]');

    // Obtener producto actual
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Manejar nuevas imágenes
    let images = [...currentProduct.images];
    const newImageFiles = formData.getAll('images');

    if (newImageFiles && newImageFiles.length > 0) {
      for (const file of newImageFiles) {
        if (file && file.size > 0) {
          try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadResult = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: 'haize',
                  resource_type: 'auto',
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );

              uploadStream.end(buffer);
            });

            images.push({
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
            });
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
          }
        }
      }
    }

    // Actualizar producto
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        title,
        description,
        images,
        costPrice,
        salePrice,
        offerPrice,
        sizes,
        colors,
        category,
        featured,
        stock,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Error al actualizar producto', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(request, context) {
  try {
    await dbConnect();

    // Await params en Next.js 15+
    const { id } = await context.params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar imágenes de Cloudinary
    for (const image of product.images) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    // Eliminar producto de la base de datos
    await Product.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Producto eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error eliminando producto:', error);
    return NextResponse.json(
      { message: 'Error al eliminar producto', error: error.message },
      { status: 500 }
    );
  }
}
