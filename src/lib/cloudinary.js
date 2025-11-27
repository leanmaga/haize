// lib/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para subir imágenes
export const uploadImage = async (file) => {
  try {
    // Asegúrate de que file sea un string base64 o un buffer
    const result = await cloudinary.uploader.upload(file, {
      folder: 'ecommerce_products',
    });

    return {
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    throw new Error(`Error al subir la imagen: ${error.message}`);
  }
};

// Función para eliminar imágenes
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === 'ok' };
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    throw new Error(`Error al eliminar la imagen: ${error.message}`);
  }
};

// lib/cloudinary.js
export const getCloudinaryUrl = (publicId, transformations = {}) => {
  const cloudName = 'dz7fsiwnu';

  const transforms = [];

  if (transformations.width) transforms.push(`w_${transformations.width}`);
  if (transformations.height) transforms.push(`h_${transformations.height}`);
  if (transformations.crop) transforms.push(`c_${transformations.crop}`);
  if (transformations.quality) transforms.push(`q_${transformations.quality}`);
  if (transformations.format) transforms.push(`f_${transformations.format}`);

  const transformString =
    transforms.length > 0 ? `${transforms.join(',')}/` : '';

  // Sin carpeta, solo el publicId
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
};

export default cloudinary;
