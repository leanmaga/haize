// app/api/upload/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary (ya deberías tenerlo en lib/cloudinary.js)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const formData = await request.formData();
    const files = formData.getAll('images');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se enviaron imágenes' },
        { status: 400 },
      );
    }

    // Limitar a 10 imágenes
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Máximo 10 imágenes por request' },
        { status: 400 },
      );
    }

    const uploadedImages = [];

    for (const file of files) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Formato no válido: ${file.name}. Usa JPG, PNG o WEBP` },
          { status: 400 },
        );
      }

      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `${file.name} supera el tamaño máximo de 10MB` },
          { status: 400 },
        );
      }

      // Convertir File a buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Subir a Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'haize/products',
            transformation: [
              { width: 1200, height: 1600, crop: 'limit' },
              { quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        uploadStream.end(buffer);
      });

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      });
    }

    return NextResponse.json({
      message: 'Imágenes subidas exitosamente',
      images: uploadedImages,
    });
  } catch (error) {
    console.error('Error subiendo imágenes:', error);
    return NextResponse.json(
      { error: error.message || 'Error al subir imágenes' },
      { status: 500 },
    );
  }
}

// DELETE - Eliminar imagen de Cloudinary
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { error: 'publicId es requerido' },
        { status: 400 },
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return NextResponse.json({
        message: 'Imagen eliminada exitosamente',
        result,
      });
    } else {
      return NextResponse.json(
        { error: 'Imagen no encontrada o ya fue eliminada' },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar imagen' },
      { status: 500 },
    );
  }
}
