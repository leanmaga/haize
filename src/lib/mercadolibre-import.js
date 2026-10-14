export class ImportError extends Error {
  constructor(message, status = 422) { super(message); this.status = status; }
}

const attribute = (attributes, id) => attributes?.find((entry) => entry.id === id)?.value_name || '';
const quantity = (value) => {
  if (!Number.isInteger(value) || value < 0) throw new ImportError('Mercado Libre no devolvió un stock válido.');
  return value;
};

export function mapMercadoLibreItem(item, description = '') {
  if (!['active', 'paused'].includes(item.status)) throw new ImportError('Solo se pueden importar publicaciones activas o pausadas.');
  if (item.currency_id !== 'ARS') throw new ImportError('La tienda admite precios en pesos argentinos.');
  if (item.shipping?.logistic_type === 'fulfillment' || item.stock_locations?.length) {
    throw new ImportError('Esta publicación usa stock Full o por depósito. Necesita una vinculación de inventario por depósito antes de importarse.');
  }
  const pictures = (item.pictures || []).map((picture) => {
    const url = picture.secure_url || picture.url;
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== 'http2.mlstatic.com') return null;
      parsed.protocol = 'https:';
      return { id: picture.id, url: parsed.href };
    } catch { return null; }
  }).filter(Boolean);
  if (!pictures.length) throw new ImportError('La publicación no tiene fotos disponibles para importar.');
  const remoteVariants = item.variations?.length ? item.variations : [item];
  const pairs = new Set();
  const variants = remoteVariants.map((variant, index) => {
    const attrs = [...(variant.attribute_combinations || []), ...(variant.attributes || []), ...(item.attributes || [])];
    const size = attribute(attrs, 'SIZE') || 'Único';
    const color = attribute(attrs, 'COLOR') || 'Sin color';
    const pair = JSON.stringify([size.toLowerCase(), color.toLowerCase()]);
    if (pairs.has(pair)) throw new ImportError('Hay variantes con el mismo talle y color. Revisá su equivalencia antes de importar.');
    pairs.add(pair);
    if (variant.price != null && Number(variant.price) !== Number(item.price)) {
      throw new ImportError('Las variantes tienen precios diferentes. Este producto necesita una revisión de precios antes de importarse.');
    }
    const selected = pictures.filter((picture) => variant.picture_ids?.includes(picture.id));
    return {
      size, color, stock: quantity(variant.available_quantity),
      sku: `ML-${item.id}-${item.variations?.length ? variant.id : 'UNICO'}`,
      universalCode: attribute(attrs, 'GTIN'),
      images: (selected.length ? selected : pictures).map((picture) => picture.url),
      isPrimary: index === 0,
    };
  });
  return {
    title: item.title || '', description,
    model: (attribute(item.attributes, 'MODEL') || item.title || '').slice(0, 100),
    salePrice: Number(item.price), material: attribute(item.attributes, 'MATERIAL'),
    imageUrl: pictures[0].url,
    additionalImages: pictures.slice(1).map(({ url }) => ({ url, imageUrl: url })),
    variants, stock: variants.reduce((sum, variant) => sum + variant.stock, 0),
    sizes: [...new Set(variants.map((variant) => variant.size))],
    colors: [...new Set(variants.map((variant) => variant.color))],
    mercadoLibre: {
      itemId: item.id, userProductId: item.user_product_id || undefined,
      variationMappings: (item.variations || []).map((variant, index) => ({
        variationId: String(variant.id), sku: variants[index].sku,
        size: variants[index].size, color: variants[index].color,
      })),
    },
  };
}

export function applyImportEdits(product, input) {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const description = typeof input.description === 'string' ? input.description.trim() : '';
  const salePrice = Number(input.salePrice);
  if (title.length < 10 || title.length > 150) throw new ImportError('El título debe tener entre 10 y 150 caracteres.', 400);
  if ((description.length > 0 && description.length < 20) || description.length > 2000) throw new ImportError('La descripción debe estar vacía o tener entre 20 y 2000 caracteres.', 400);
  if (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice > 1000000) throw new ImportError('Ingresá un precio mayor a cero y hasta $1.000.000.', 400);
  return { ...product, title, description, salePrice, category: input.category,
    featured: input.featured === true, isComplete: true, isActive: true, creationStep: 6 };
}
