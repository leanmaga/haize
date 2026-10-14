import { createHash } from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { mercadoLibreRequest } from './mercadolibre';

function safeUrl(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.hostname !== 'http2.mlstatic.com' || url.username || url.password || url.port) return null;
    url.protocol = 'https:';
    return url.href;
  } catch { return null; }
}
const area = (size) => {
  const match = /^(\d+)x(\d+)$/.exec(size || '');
  return match ? Number(match[1]) * Number(match[2]) : 0;
};
export function largestPicture(picture, details) {
  // Do not use max_size as the size of the standard URL: that URL can be a smaller rendition.
  const candidates = [picture, ...(details?.variations || [])]
    .map((entry) => ({ url: safeUrl(entry.secure_url || entry.url), area: area(entry.size) }))
    .filter((entry) => entry.url && !/-C\.[a-z]+$/i.test(entry.url));
  candidates.sort((a, b) => b.area - a.area);
  return candidates[0]?.url || safeUrl(picture.secure_url || picture.url);
}
export async function resolveMercadoLibrePictures(item) {
  let unavailable = 0;
  const pictures = [];
  // Bound concurrency to avoid flooding ML on products with many photos.
  for (let offset = 0; offset < (item.pictures || []).length; offset += 3) {
    pictures.push(...await Promise.all(item.pictures.slice(offset, offset + 3).map(async (picture) => {
      let details;
      try {
        if (!picture.id) throw new Error('Missing picture ID');
        details = await mercadoLibreRequest(`/pictures/${encodeURIComponent(picture.id)}`);
      } catch { unavailable++; }
      return { ...picture, secure_url: largestPicture(picture, details) };
    })));
  }
  return { item: { ...item, pictures }, warning: unavailable ? 'No se pudo comprobar la resolución máxima de algunas fotos; se conservó la versión disponible.' : '' };
}

export async function storeMercadoLibrePictures(item) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Falta configurar el almacenamiento de imágenes.');
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  const folder = `${process.env.CLOUDINARY_FOLDER || process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'haizeecommerce/haize-staging'}/mercadolibre`;
  const copies = [];
  for (let offset = 0; offset < item.pictures.length; offset += 3) {
    copies.push(...await Promise.all(item.pictures.slice(offset, offset + 3).map(async (picture) => {
      const source = safeUrl(picture.secure_url || picture.url);
      if (!source) throw new Error('URL de imagen no válida.');
      const hash = createHash('sha256').update(source).digest('hex').slice(0, 20);
      const result = await cloudinary.uploader.upload(source, {
        folder, public_id: `${item.id}-${hash}`, resource_type: 'image',
        overwrite: false, timeout: 45000,
        // Preserve resolution and background; optimize only the delivered image.
      });
      return { id: picture.id, source, url: result.secure_url };
    })));
  }
  return copies;
}

export function replaceMercadoLibrePictures(product, copies) {
  const replace = (url) => {
    if (!safeUrl(url)) return url;
    const match = copies.find((copy) => copy.source === url || (copy.id && new URL(url).pathname.includes(copy.id)));
    return match?.url || url;
  };
  return {
    imageUrl: replace(product.imageUrl),
    additionalImages: (product.additionalImages || []).map((image) => ({ ...image, url: replace(image.url), imageUrl: replace(image.imageUrl) })),
    variants: (product.variants || []).map((variant) => ({ ...variant, images: (variant.images || []).map(replace) })),
  };
}
