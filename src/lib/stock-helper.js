// src/lib/stock-helper.js
/**
 * Helper para manejar el descuento de stock cuando una orden se marca como pagada
 */

import Product from '@/models/Product';

/**
 * Descuenta el stock de los productos de una orden
 * @param {Object} order - Documento de orden de MongoDB
 * @returns {Object} - Resultado con éxito y detalles de productos actualizados
 */
export async function reduceStockForOrder(order) {
  const results = {
    success: true,
    updatedProducts: [],
    errors: [],
  };

  try {
    console.log(`📦 Iniciando descuento de stock para orden ${order._id}`);

    // Iterar sobre cada item de la orden
    for (const item of order.items) {
      try {
        // Buscar el producto
        const product = await Product.findById(item.product);

        if (!product) {
          console.warn(
            `⚠️ Producto no encontrado: ${item.product} (${item.title})`,
          );
          results.errors.push({
            productId: item.product,
            title: item.title,
            error: 'Producto no encontrado',
          });
          continue;
        }

        console.log(
          `🔄 Procesando: ${product.title} - Cantidad: ${item.quantity}`,
        );

        let stockUpdated = false;
        const previousStock = product.stock;

        // CASO 1: Producto con sistema de variantes combinadas (talle + color)
        if (
          product.variants &&
          product.variants.length > 0 &&
          item.size &&
          item.color
        ) {
          console.log(
            `   Usando sistema de variantes: Talle ${item.size}, Color ${item.color}`,
          );

          // Buscar la variante específica
          const variant = product.variants.find(
            (v) => v.size === item.size && v.color === item.color,
          );

          if (!variant) {
            console.warn(
              `   ⚠️ Variante no encontrada: ${item.size}/${item.color}`,
            );
            results.errors.push({
              productId: product._id,
              title: product.title,
              size: item.size,
              color: item.color,
              error: 'Variante no encontrada',
            });
            continue;
          }

          // Verificar stock suficiente
          if (variant.stock < item.quantity) {
            console.warn(
              `   ⚠️ Stock insuficiente: Disponible ${variant.stock}, Requerido ${item.quantity}`,
            );
            results.errors.push({
              productId: product._id,
              title: product.title,
              size: item.size,
              color: item.color,
              availableStock: variant.stock,
              requestedQuantity: item.quantity,
              error: 'Stock insuficiente',
            });
            // Descontar lo que haya disponible
            variant.stock = 0;
          } else {
            // Descontar stock de la variante
            variant.stock -= item.quantity;
          }

          // Recalcular stock total del producto
          product.stock = product.variants.reduce(
            (total, v) => total + v.stock,
            0,
          );
          stockUpdated = true;
        }
        // CASO 2: Sistema antiguo - solo talle (sin color)
        else if (
          product.sizes &&
          product.sizes.length > 0 &&
          item.size &&
          !item.color
        ) {
          console.log(`   Usando sistema de talles: Talle ${item.size}`);

          const sizeVariant = product.sizes.find((s) => s.size === item.size);

          if (!sizeVariant) {
            console.warn(`   ⚠️ Talle no encontrado: ${item.size}`);
            results.errors.push({
              productId: product._id,
              title: product.title,
              size: item.size,
              error: 'Talle no encontrado',
            });
            continue;
          }

          if (sizeVariant.stock < item.quantity) {
            console.warn(
              `   ⚠️ Stock insuficiente: Disponible ${sizeVariant.stock}, Requerido ${item.quantity}`,
            );
            results.errors.push({
              productId: product._id,
              title: product.title,
              size: item.size,
              availableStock: sizeVariant.stock,
              requestedQuantity: item.quantity,
              error: 'Stock insuficiente',
            });
            sizeVariant.stock = 0;
          } else {
            sizeVariant.stock -= item.quantity;
          }

          product.stock = product.sizes.reduce(
            (total, s) => total + s.stock,
            0,
          );
          stockUpdated = true;
        }
        // CASO 3: Sistema antiguo - solo color (sin talle)
        else if (
          product.colors &&
          product.colors.length > 0 &&
          item.color &&
          !item.size
        ) {
          console.log(`   Usando sistema de colores: Color ${item.color}`);

          const colorVariant = product.colors.find(
            (c) => c.name === item.color,
          );

          if (!colorVariant) {
            console.warn(`   ⚠️ Color no encontrado: ${item.color}`);
            results.errors.push({
              productId: product._id,
              title: product.title,
              color: item.color,
              error: 'Color no encontrado',
            });
            continue;
          }

          if (colorVariant.stock < item.quantity) {
            console.warn(
              `   ⚠️ Stock insuficiente: Disponible ${colorVariant.stock}, Requerido ${item.quantity}`,
            );
            results.errors.push({
              productId: product._id,
              title: product.title,
              color: item.color,
              availableStock: colorVariant.stock,
              requestedQuantity: item.quantity,
              error: 'Stock insuficiente',
            });
            colorVariant.stock = 0;
          } else {
            colorVariant.stock -= item.quantity;
          }

          product.stock = product.colors.reduce(
            (total, c) => total + c.stock,
            0,
          );
          stockUpdated = true;
        }
        // CASO 4: Stock general (sin variantes)
        else {
          console.log(`   Usando stock general`);

          if (product.stock < item.quantity) {
            console.warn(
              `   ⚠️ Stock insuficiente: Disponible ${product.stock}, Requerido ${item.quantity}`,
            );
            results.errors.push({
              productId: product._id,
              title: product.title,
              availableStock: product.stock,
              requestedQuantity: item.quantity,
              error: 'Stock insuficiente',
            });
            product.stock = 0;
          } else {
            product.stock -= item.quantity;
          }
          stockUpdated = true;
        }

        // Guardar el producto actualizado
        if (stockUpdated) {
          await product.save();
          console.log(
            `   ✅ Stock actualizado: ${previousStock} → ${product.stock}`,
          );

          results.updatedProducts.push({
            productId: product._id,
            title: product.title,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            previousStock,
            newStock: product.stock,
          });
        }
      } catch (itemError) {
        console.error(
          `❌ Error procesando item ${item.title}:`,
          itemError.message,
        );
        results.errors.push({
          productId: item.product,
          title: item.title,
          error: itemError.message,
        });
        results.success = false;
      }
    }

    // Resumen
    console.log(`📊 Resumen descuento de stock para orden ${order._id}:`, {
      productosActualizados: results.updatedProducts.length,
      errores: results.errors.length,
      exito: results.success && results.errors.length === 0,
    });

    return results;
  } catch (error) {
    console.error(
      `❌ Error general en reduceStockForOrder para orden ${order._id}:`,
      error,
    );
    return {
      success: false,
      updatedProducts: [],
      errors: [
        {
          error: 'Error general al descontar stock',
          message: error.message,
        },
      ],
    };
  }
}

/**
 * Restaura el stock de los productos de una orden (útil para cancelaciones)
 * @param {Object} order - Documento de orden de MongoDB
 * @returns {Object} - Resultado con éxito y detalles de productos actualizados
 */
export async function restoreStockForOrder(order) {
  const results = {
    success: true,
    restoredProducts: [],
    errors: [],
  };

  try {
    console.log(`🔄 Iniciando restauración de stock para orden ${order._id}`);

    for (const item of order.items) {
      try {
        const product = await Product.findById(item.product);

        if (!product) {
          console.warn(`⚠️ Producto no encontrado: ${item.product}`);
          continue;
        }

        const previousStock = product.stock;

        // Restaurar según el tipo de sistema de stock
        if (
          product.variants &&
          product.variants.length > 0 &&
          item.size &&
          item.color
        ) {
          const variant = product.variants.find(
            (v) => v.size === item.size && v.color === item.color,
          );
          if (variant) {
            variant.stock += item.quantity;
            product.stock = product.variants.reduce(
              (total, v) => total + v.stock,
              0,
            );
          }
        } else if (product.sizes && product.sizes.length > 0 && item.size) {
          const sizeVariant = product.sizes.find((s) => s.size === item.size);
          if (sizeVariant) {
            sizeVariant.stock += item.quantity;
            product.stock = product.sizes.reduce(
              (total, s) => total + s.stock,
              0,
            );
          }
        } else if (product.colors && product.colors.length > 0 && item.color) {
          const colorVariant = product.colors.find(
            (c) => c.name === item.color,
          );
          if (colorVariant) {
            colorVariant.stock += item.quantity;
            product.stock = product.colors.reduce(
              (total, c) => total + c.stock,
              0,
            );
          }
        } else {
          product.stock += item.quantity;
        }

        await product.save();
        console.log(
          `✅ Stock restaurado para ${product.title}: ${previousStock} → ${product.stock}`,
        );

        results.restoredProducts.push({
          productId: product._id,
          title: product.title,
          quantity: item.quantity,
          previousStock,
          newStock: product.stock,
        });
      } catch (itemError) {
        console.error(`❌ Error restaurando item:`, itemError);
        results.errors.push({
          productId: item.product,
          error: itemError.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('❌ Error general en restoreStockForOrder:', error);
    return {
      success: false,
      restoredProducts: [],
      errors: [{ error: error.message }],
    };
  }
}
