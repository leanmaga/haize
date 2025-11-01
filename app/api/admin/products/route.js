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

// GET - Obtener todos los productos (admin)
export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find({}).sort({ createdAt: -1 });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Error al obtener productos', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto
export async function POST(request) {
  try {
    await dbConnect();

    const formData = await request.formData();

    // Extraer datos del formulario
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

    // Subir imágenes a Cloudinary
    const images = [];
    const imageFiles = formData.getAll('images');

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];

      if (file && file.size > 0) {
        try {
          // Convertir el archivo a buffer
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Subir a Cloudinary usando upload_stream
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
          console.error('❌ Error subiendo imagen a Cloudinary:', uploadError);
          throw new Error(`Error al subir imagen: ${uploadError.message}`);
        }
      }
    }

    // Crear producto
    const product = await Product.create({
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
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('❌ Error completo:', error);
    return NextResponse.json(
      { message: 'Error al crear producto', error: error.message },
      { status: 500 }
    );
  }
}
