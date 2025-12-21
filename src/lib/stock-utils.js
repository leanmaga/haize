// src/lib/stock-utils.js
import connectDB from '@/lib/db';
import Product from '@/models/Product';

/**
 * Reduce el stock de los productos en una orden
 * Maneja tanto el sistema nuevo (variantes) como el antiguo (sizes/colors)
 *
 * @param {Object} order - Orden con items a procesar
 * @returns {Object} - { success: boolean, updated: array, errors: array }
 */
export async function reduceStockForOrder(order) {
  await connectDB();

  const results = {
    success: true,
    updated: [],
    errors: [],
  };

  console.log(`📦 [STOCK] Reduciendo stock para orden ${order._id}`);

  for (const item of order.items) {
    try {
      // Extraer el ID real del producto (puede venir como string o como objeto)
      const productId =
        typeof item.product === 'string'
          ? item.product
          : item.product._id || item.product;

      // Buscar el producto
      const product = await Product.findById(productId);

      if (!product) {
        const error = `Producto ${productId} no encontrado`;
        console.error(`❌ [STOCK] ${error}`);
        results.errors.push({
          productId,
          item: item.title,
          error,
        });
        results.success = false;
        continue;
      }

      console.log(`📦 [STOCK] Procesando producto: ${product.title}`);

      // Determinar qué sistema de variantes usar
      const hasVariants = product.variants && product.variants.length > 0;
      const hasSizes = product.sizes && product.sizes.length > 0;
      const hasColors = product.colors && product.colors.length > 0;

      let stockReduced = false;
      let stockInfo = '';

      // ========== SISTEMA NUEVO: VARIANTES COMBINADAS ==========
      if (hasVariants && item.variant) {
        const { size, color } = item.variant;

        if (size && color) {
          console.log(
            `  🔍 [STOCK] Buscando variante: Talle ${size}, Color ${color}`,
          );

          // Buscar la variante específica
          const variant = product.variants.find(
            (v) => v.size === size && v.color === color,
          );

          if (!variant) {
            const error = `Variante ${size}/${color} no encontrada`;
            console.error(`  ❌ [STOCK] ${error}`);
            results.errors.push({
              productId: product._id,
              item: item.title,
              variant: { size, color },
              error,
            });
            results.success = false;
            continue;
          }

          // Verificar stock disponible
          if (variant.stock < item.quantity) {
            const error = `Stock insuficiente: Disponible ${variant.stock}, Requerido ${item.quantity}`;
            console.error(`  ❌ [STOCK] ${error}`);
            results.errors.push({
              productId: product._id,
              item: item.title,
              variant: { size, color },
              availableStock: variant.stock,
              requiredStock: item.quantity,
              error,
            });
            results.success = false;
            continue;
          }

          // Reducir stock de la variante
          const previousStock = variant.stock;
          variant.stock = Math.max(0, variant.stock - item.quantity);

          // Recalcular stock total del producto
          product.stock = product.variants.reduce(
            (total, v) => total + v.stock,
            0,
          );

          stockReduced = true;
          stockInfo = `Variante ${size}/${color}: ${previousStock} → ${variant.stock}`;

          console.log(`  ✅ [STOCK] ${stockInfo}`);
        }
      }
      // ========== SISTEMA ANTIGUO: SIZES SEPARADOS ==========
      else if (hasSizes && item.variant?.size) {
        const { size } = item.variant;

        console.log(`  🔍 [STOCK] Buscando talle: ${size}`);

        const sizeVariant = product.sizes.find((s) => s.size === size);

        if (!sizeVariant) {
          const error = `Talle ${size} no encontrado`;
          console.error(`  ❌ [STOCK] ${error}`);
          results.errors.push({
            productId: product._id,
            item: item.title,
            size,
            error,
          });
          results.success = false;
          continue;
        }

        if (sizeVariant.stock < item.quantity) {
          const error = `Stock insuficiente: Disponible ${sizeVariant.stock}, Requerido ${item.quantity}`;
          console.error(`  ❌ [STOCK] ${error}`);
          results.errors.push({
            productId: product._id,
            item: item.title,
            size,
            availableStock: sizeVariant.stock,
            requiredStock: item.quantity,
            error,
          });
          results.success = false;
          continue;
        }

        const previousStock = sizeVariant.stock;
        sizeVariant.stock = Math.max(0, sizeVariant.stock - item.quantity);
        product.stock = product.sizes.reduce((total, s) => total + s.stock, 0);

        stockReduced = true;
        stockInfo = `Talle ${size}: ${previousStock} → ${sizeVariant.stock}`;

        console.log(`  ✅ [STOCK] ${stockInfo}`);
      }
      // ========== SISTEMA ANTIGUO: COLORS SEPARADOS ==========
      else if (hasColors && item.variant?.color) {
        const { color } = item.variant;

        console.log(`  🔍 [STOCK] Buscando color: ${color}`);

        const colorVariant = product.colors.find((c) => c.name === color);

        if (!colorVariant) {
          const error = `Color ${color} no encontrado`;
          console.error(`  ❌ [STOCK] ${error}`);
          results.errors.push({
            productId: product._id,
            item: item.title,
            color,
            error,
          });
          results.success = false;
          continue;
        }

        if (colorVariant.stock < item.quantity) {
          const error = `Stock insuficiente: Disponible ${colorVariant.stock}, Requerido ${item.quantity}`;
          console.error(`  ❌ [STOCK] ${error}`);
          results.errors.push({
            productId: product._id,
            item: item.title,
            color,
            availableStock: colorVariant.stock,
            requiredStock: item.quantity,
            error,
          });
          results.success = false;
          continue;
        }

        const previousStock = colorVariant.stock;
        colorVariant.stock = Math.max(0, colorVariant.stock - item.quantity);
        product.stock = product.colors.reduce((total, c) => total + c.stock, 0);

        stockReduced = true;
        stockInfo = `Color ${color}: ${previousStock} → ${colorVariant.stock}`;

        console.log(`  ✅ [STOCK] ${stockInfo}`);
      }
      // ========== PRODUCTO SIMPLE (SIN VARIANTES) ==========
      else {
        console.log(
          `  🔍 [STOCK] Producto simple, stock total: ${product.stock}`,
        );

        if (product.stock < item.quantity) {
          const error = `Stock insuficiente: Disponible ${product.stock}, Requerido ${item.quantity}`;
          console.error(`  ❌ [STOCK] ${error}`);
          results.errors.push({
            productId: product._id,
            item: item.title,
            availableStock: product.stock,
            requiredStock: item.quantity,
            error,
          });
          results.success = false;
          continue;
        }

        const previousStock = product.stock;
        product.stock = Math.max(0, product.stock - item.quantity);

        stockReduced = true;
        stockInfo = `Stock total: ${previousStock} → ${product.stock}`;

        console.log(`  ✅ [STOCK] ${stockInfo}`);
      }

      // Guardar cambios en el producto
      if (stockReduced) {
        await product.save();

        results.updated.push({
          productId: product._id,
          title: product.title,
          quantity: item.quantity,
          stockInfo,
          newTotalStock: product.stock,
        });

        console.log(`  💾 [STOCK] Producto guardado exitosamente`);
      }
    } catch (error) {
      console.error(`❌ [STOCK] Error procesando item:`, error);
      results.errors.push({
        item: item.title,
        error: error.message,
      });
      results.success = false;
    }
  }

  console.log(`📦 [STOCK] Resumen:`, {
    totalItems: order.items.length,
    updated: results.updated.length,
    errors: results.errors.length,
    success: results.success,
  });

  return results;
}

/**
 * Restaura el stock de los productos de una orden
 * Se usa cuando una orden pagada es cancelada
 *
 * @param {Object} order - Orden con items a procesar
 * @returns {Object} - { success: boolean, restored: array, errors: array }
 */
export async function restoreStockForOrder(order) {
  await connectDB();

  const results = {
    success: true,
    restored: [],
    errors: [],
  };

  console.log(`🔄 [STOCK] Restaurando stock para orden ${order._id}`);

  for (const item of order.items) {
    try {
      const productId =
        typeof item.product === 'string'
          ? item.product
          : item.product._id || item.product;

      const product = await Product.findById(productId);

      if (!product) {
        const error = `Producto ${productId} no encontrado`;
        console.error(`❌ [STOCK] ${error}`);
        results.errors.push({
          productId,
          item: item.title,
          error,
        });
        results.success = false;
        continue;
      }

      console.log(`🔄 [STOCK] Procesando producto: ${product.title}`);

      const hasVariants = product.variants && product.variants.length > 0;
      const hasSizes = product.sizes && product.sizes.length > 0;
      const hasColors = product.colors && product.colors.length > 0;

      let stockRestored = false;
      let stockInfo = '';

      // ========== SISTEMA NUEVO: VARIANTES COMBINADAS ==========
      if (hasVariants && item.variant) {
        const { size, color } = item.variant;

        if (size && color) {
          console.log(
            `  🔍 [STOCK] Restaurando variante: Talle ${size}, Color ${color}`,
          );

          const variant = product.variants.find(
            (v) => v.size === size && v.color === color,
          );

          if (!variant) {
            const error = `Variante ${size}/${color} no encontrada`;
            console.warn(`  ⚠️ [STOCK] ${error} - Se omitirá`);
            continue;
          }

          const previousStock = variant.stock;
          variant.stock += item.quantity;
          product.stock = product.variants.reduce(
            (total, v) => total + v.stock,
            0,
          );

          stockRestored = true;
          stockInfo = `Variante ${size}/${color}: ${previousStock} → ${variant.stock}`;

          console.log(`  ✅ [STOCK] ${stockInfo}`);
        }
      }
      // ========== SISTEMA ANTIGUO: SIZES ==========
      else if (hasSizes && item.variant?.size) {
        const { size } = item.variant;
        const sizeVariant = product.sizes.find((s) => s.size === size);

        if (!sizeVariant) {
          console.warn(`  ⚠️ [STOCK] Talle ${size} no encontrado - Se omitirá`);
          continue;
        }

        const previousStock = sizeVariant.stock;
        sizeVariant.stock += item.quantity;
        product.stock = product.sizes.reduce((total, s) => total + s.stock, 0);

        stockRestored = true;
        stockInfo = `Talle ${size}: ${previousStock} → ${sizeVariant.stock}`;

        console.log(`  ✅ [STOCK] ${stockInfo}`);
      }
      // ========== SISTEMA ANTIGUO: COLORS ==========
      else if (hasColors && item.variant?.color) {
        const { color } = item.variant;
        const colorVariant = product.colors.find((c) => c.name === color);

        if (!colorVariant) {
          console.warn(
            `  ⚠️ [STOCK] Color ${color} no encontrado - Se omitirá`,
          );
          continue;
        }

        const previousStock = colorVariant.stock;
        colorVariant.stock += item.quantity;
        product.stock = product.colors.reduce((total, c) => total + c.stock, 0);

        stockRestored = true;
        stockInfo = `Color ${color}: ${previousStock} → ${colorVariant.stock}`;

        console.log(`  ✅ [STOCK] ${stockInfo}`);
      }
      // ========== PRODUCTO SIMPLE ==========
      else {
        const previousStock = product.stock;
        product.stock += item.quantity;

        stockRestored = true;
        stockInfo = `Stock total: ${previousStock} → ${product.stock}`;

        console.log(`  ✅ [STOCK] ${stockInfo}`);
      }

      if (stockRestored) {
        await product.save();

        results.restored.push({
          productId: product._id,
          title: product.title,
          quantity: item.quantity,
          stockInfo,
          newTotalStock: product.stock,
        });

        console.log(`  💾 [STOCK] Producto guardado exitosamente`);
      }
    } catch (error) {
      console.error(`❌ [STOCK] Error restaurando item:`, error);
      results.errors.push({
        item: item.title,
        error: error.message,
      });
      results.success = false;
    }
  }

  console.log(`🔄 [STOCK] Resumen restauración:`, {
    totalItems: order.items.length,
    restored: results.restored.length,
    errors: results.errors.length,
    success: results.success,
  });

  return results;
}
