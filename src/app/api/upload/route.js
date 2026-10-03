// app/api/upload/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';

const cloudinaryEnv = {
  cloudName:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey:
    process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  folder:
    process.env.CLOUDINARY_FOLDER ||
    process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER ||
    'haizeecommerce/haize-staging',
};

function sanitizeProviderMessage(message) {
  if (typeof message !== 'string') return undefined;

  return message
    .replace(
      /(api[_-]?(?:key|secret)|authorization|(?:access|refresh)[_-]?token|signature)(["'\s:=]+)[^\s,"'&}]+/gi,
      '$1$2[REDACTED]',
    )
    .slice(0, 500);
}

function getSafeCloudinaryError(error) {
  return {
    name: typeof error?.name === 'string' ? error.name.slice(0, 100) : undefined,
    code: typeof error?.code === 'string' || typeof error?.code === 'number'
      ? error.code
      : undefined,
    httpStatus: Number.isInteger(error?.http_code)
      ? error.http_code
      : Number.isInteger(error?.statusCode)
        ? error.statusCode
        : undefined,
    requestId: typeof error?.request_id === 'string'
      ? error.request_id.slice(0, 150)
      : typeof error?.requestId === 'string'
        ? error.requestId.slice(0, 150)
        : undefined,
    message: sanitizeProviderMessage(error?.message),
  };
}

function uploadImageStream(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}

function isInvalidCloudinaryRequest(error) {
  return error?.http_code === 400 && error?.message === 'Invalid request parameters';
}

// Configurar Cloudinary (ya deberías tenerlo en lib/cloudinary.js)
cloudinary.config({
  cloud_name: cloudinaryEnv.cloudName,
  api_key: cloudinaryEnv.apiKey,
  api_secret: cloudinaryEnv.apiSecret,
});

export async function POST(request) {
  const requestId = randomUUID();
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const missingCloudinaryEnv = Object.entries(cloudinaryEnv)
      .filter(([key]) => key !== 'folder')
      .filter(([, value]) => !value?.trim())
      .map(([key]) => key);
    if (missingCloudinaryEnv.length > 0) {
      console.error('[UPLOAD] Cloudinary configuration is incomplete', {
        requestId,
        missingEnvironmentKeys: missingCloudinaryEnv,
      });
      return NextResponse.json(
        { error: 'Configuración de imágenes incompleta', requestId },
        { status: 500 },
      );
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
      let result;
      try {
        result = await uploadImageStream(buffer, {
          folder: cloudinaryEnv.folder,
          transformation: [
            { width: 1200, height: 1600, crop: 'limit' },
            { quality: 'auto' },
          ],
        });
      } catch (error) {
        const cloudinaryError = getSafeCloudinaryError(error);
        console.error('[UPLOAD] Cloudinary rejected image upload', {
          requestId,
          fileIndex: uploadedImages.length,
          fileType: file.type,
          fileBytes: file.size,
          cloudinary: cloudinaryError,
        });

        // Retry without the optional transformation first, preserving the
        // environment-specific folder.
        if (!isInvalidCloudinaryRequest(error)) {
          return NextResponse.json(
            { error: 'Cloudinary rechazó la imagen', requestId },
            { status: 502 },
          );
        }

        try {
          result = await uploadImageStream(buffer, {
            folder: cloudinaryEnv.folder,
          });
          console.warn('[UPLOAD] Image uploaded using Cloudinary defaults', {
            requestId,
            fileIndex: uploadedImages.length,
            fileType: file.type,
            fileBytes: file.size,
          });
        } catch (retryError) {
          console.error('[UPLOAD] Cloudinary retry without optional parameters failed', {
            requestId,
            fileIndex: uploadedImages.length,
            fileType: file.type,
            fileBytes: file.size,
            cloudinary: getSafeCloudinaryError(retryError),
          });
          try {
            result = await uploadImageStream(buffer);
          } catch (finalError) {
            console.error('[UPLOAD] Cloudinary final retry failed', {
              requestId,
              cloudinary: getSafeCloudinaryError(finalError),
            });
            return NextResponse.json(
              { error: 'Cloudinary rechazó la imagen', requestId },
              { status: 502 },
            );
          }
        }
      }

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
    console.error('[UPLOAD] Unexpected image upload failure', {
      requestId,
      ...getSafeCloudinaryError(error),
    });
    return NextResponse.json(
      { error: 'Error interno al subir imágenes', requestId },
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
