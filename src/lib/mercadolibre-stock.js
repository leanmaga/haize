import connectDB from '@/lib/db';
import Product from '@/models/Product';
import MercadoLibreSale from '@/models/MercadoLibreSale';

const SELLING_STATUSES = new Set(['confirmed', 'paid']);

export async function reduceStockForMercadoLibreOrder(order) {
  if (!order?.id || !SELLING_STATUSES.has(order.status)) {
    return { skipped: true, reason: 'La orden aún no está confirmada para descontar stock' };
  }
  await connectDB();

  try {
    await MercadoLibreSale.create({ orderId: String(order.id), status: order.status });
  } catch (error) {
    if (error?.code === 11000) return { skipped: true, reason: 'Orden ya procesada' };
    throw error;
  }

  try {
    const updated = [];
    for (const line of order.order_items || order.items || []) {
      const itemId = String(line.item?.id || line.item_id || '');
      const variationId = line.item?.variation_id || line.variation_id;
      const quantity = Number(line.quantity || 0);
      const product = await Product.findOne({ 'mercadoLibre.itemId': itemId });
      if (!product || quantity <= 0) continue;

      const mapping = variationId
        ? product.mercadoLibre.variationMappings?.find((entry) => String(entry.variationId) === String(variationId))
        : null;
      const variant = mapping && product.variants?.find((entry) =>
        (mapping.sku && entry.sku === mapping.sku) ||
        (mapping.size && mapping.color && entry.size === mapping.size && entry.color === mapping.color),
      );

      if (mapping && !variant) throw new Error(`No se encontró la variante vinculada de ${product.title}`);
      if (variant) {
        if (variant.stock < quantity) throw new Error(`Stock insuficiente para ${product.title} (${variant.size}/${variant.color})`);
        variant.stock -= quantity;
        product.stock = product.variants.reduce((total, entry) => total + entry.stock, 0);
      } else {
        if (product.stock < quantity) throw new Error(`Stock insuficiente para ${product.title}`);
        product.stock -= quantity;
      }
      await product.save();
      updated.push({ productId: String(product._id), quantity });
    }
    return { success: true, updated };
  } catch (error) {
    // Permitimos reintentar la notificación si el procesamiento falló.
    await MercadoLibreSale.deleteOne({ orderId: String(order.id) });
    throw error;
  }
}
