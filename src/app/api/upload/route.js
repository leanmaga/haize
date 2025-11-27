import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// ✅ CORREGIDO: Usar variables SIN NEXT_PUBLIC_ en el servidor
// En el servidor (API routes) NO uses NEXT_PUBLIC_
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // ✅ Sin NEXT_PUBLIC_
  api_key: process.env.CLOUDINARY_API_KEY, // ✅ Sin NEXT_PUBLIC_
  api_secret: process.env.CLOUDINARY_API_SECRET, // ✅ Sin NEXT_PUBLIC_
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      );
    }

    // Convertir el archivo a un formato base64 para cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString(
      'base64'
    )}`;

    // Subir la imagen a Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'ecommerce_products',
      resource_type: 'auto', // ✅ Detecta automáticamente el tipo de archivo
    });

    return NextResponse.json({
      imageUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    return NextResponse.json(
      { error: `Error al subir la imagen: ${error.message}` },
      { status: 500 }
    );
  }
}
