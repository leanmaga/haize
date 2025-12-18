// src/app/api/orders/route.js - ACTUALIZADO CON VALIDACIÓN DE PRODUCT IDS Y CUPONES
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import User from '@/models/User';
import { createPaymentPreference } from '@/lib/mercadopago';
import {
  sendOrderConfirmationToCustomer,
  sendNewOrderNotificationToAdmin,
} from '@/lib/order-emails';

// ========== FUNCIÓN HELPER PARA VALIDAR Y LIMPIAR PRODUCT IDS ==========
function extractProductId(productValue) {
  if (!productValue) return null;

  const id = productValue.toString();

  // Si tiene guiones, tomar solo la primera parte
  if (id.includes('-')) {
    const parts = id.split('-');
    return parts[0];
  }

  // Si tiene exactamente 24 caracteres (ObjectId válido), usarlo
  if (id.length === 24) {
    return id;
  }

  // Si es más largo, tomar los primeros 24 caracteres
  if (id.length > 24) {
    return id.substring(0, 24);
  }

  return id;
}

function isValidObjectId(id) {
  if (!id) return false;
  const cleanId = extractProductId(id);
  return /^[0-9a-fA-F]{24}$/.test(cleanId);
}
// ========================================================================

export async function POST(request) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Conectar a la base de datos
    await connectDB();

    // Obtener el usuario
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 },
      );
    }

    // Obtener datos del body
    const orderData = await request.json();

    console.log('📦 OrderData recibido:', {
      itemsCount: orderData.items?.length,
      subtotal: orderData.subtotal,
      discountAmount: orderData.discountAmount,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      hasCoupon: !!orderData.appliedCoupon,
    });

    // ========== VALIDAR Y LIMPIAR PRODUCT IDS EN ITEMS ==========
    if (!orderData.items || !Array.isArray(orderData.items)) {
      return NextResponse.json(
        { message: 'Items inválidos en la orden' },
        { status: 400 },
      );
    }

    // Limpiar y validar cada item
    orderData.items = orderData.items.map((item, index) => {
      const cleanProductId = extractProductId(item.product);

      if (!isValidObjectId(cleanProductId)) {
        console.error(`❌ ProductId inválido en item ${index}:`, {
          original: item.product,
          cleaned: cleanProductId,
          title: item.title,
        });
        throw new Error(`ProductId inválido en item: ${item.title || index}`);
      }

      console.log(`✅ ProductId validado para ${item.title}:`, {
        original: item.product,
        cleaned: cleanProductId,
      });

      return {
        ...item,
        product: cleanProductId, // Usar el productId limpio
      };
    });
    // ============================================================

    // 🆕 LIMPIAR ÓRDENES PENDIENTES ANTIGUAS ANTES DE CONTINUAR
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await Order.updateMany(
      {
        user: user._id,
        status: { $in: ['pendiente', 'whatsapp_pendiente'] },
        createdAt: { $lt: fiveMinutesAgo },
      },
      {
        status: 'cancelado',
        $set: {
          'paymentDetails.cancelledReason':
            'Timeout automático - orden abandonada',
          'paymentDetails.cancelledAt': new Date(),
        },
      },
    );

    // Verificar si existe una clave de idempotencia
    if (orderData.idempotencyKey) {
      const existingOrder = await Order.findOne({
        idempotencyKey: orderData.idempotencyKey,
      });

      if (existingOrder) {
        if (orderData.paymentMethod === 'mercadopago') {
          try {
            const preferenceResponse =
              await createPaymentPreference(existingOrder);

            return NextResponse.json({
              message: 'Orden existente recuperada',
              orderId: existingOrder._id,
              paymentInfo: {
                id: preferenceResponse.id,
                init_point: preferenceResponse.init_point,
                sandbox_init_point: preferenceResponse.sandbox_init_point,
              },
            });
          } catch (mpError) {
            console.error('Error al recrear preferencia:', mpError);
          }
        } else if (orderData.paymentMethod === 'whatsapp') {
          return NextResponse.json({
            message: 'Orden de WhatsApp existente recuperada',
            orderId: existingOrder._id,
          });
        }

        return NextResponse.json({
          message: 'Orden existente recuperada',
          orderId: existingOrder._id,
        });
      }
    }

    // 🆕 VERIFICAR ÓRDENES PENDIENTES RECIENTES CON PRODUCTOS SIMILARES
    const recentCutoff = new Date(Date.now() - 3 * 60 * 1000); // 3 minutos

    // ========== USAR PRODUCT IDS LIMPIOS EN LA BÚSQUEDA ==========
    const productIds = orderData.items
      .map((item) => extractProductId(item.product))
      .filter((id) => isValidObjectId(id));

    let recentPendingOrder = null;

    if (productIds.length > 0) {
      try {
        recentPendingOrder = await Order.findOne({
          user: user._id,
          status: { $in: ['pendiente', 'whatsapp_pendiente'] },
          createdAt: { $gte: recentCutoff },
          totalAmount: orderData.totalAmount,
          'items.product': {
            $in: productIds, // Usar productIds limpios
          },
        }).sort({ createdAt: -1 });
      } catch (queryError) {
        console.error('Error buscando órdenes pendientes:', queryError);
        // Continuar sin verificar órdenes duplicadas
      }
    }
    // ==============================================================

    if (recentPendingOrder) {
      recentPendingOrder.items = orderData.items;
      recentPendingOrder.totalAmount = orderData.totalAmount;
      recentPendingOrder.shippingInfo = orderData.shippingInfo;
      recentPendingOrder.paymentMethod = orderData.paymentMethod;
      recentPendingOrder.updatedAt = new Date();

      if (orderData.paymentMethod === 'whatsapp') {
        recentPendingOrder.status = 'whatsapp_pendiente';
        recentPendingOrder.whatsappOrder = true;
      } else {
        recentPendingOrder.status = 'pendiente';
        recentPendingOrder.whatsappOrder = false;
      }

      await recentPendingOrder.save();

      if (orderData.paymentMethod === 'mercadopago') {
        try {
          const preferenceResponse =
            await createPaymentPreference(recentPendingOrder);

          return NextResponse.json({
            message: 'Orden actualizada - redirigiendo al pago',
            orderId: recentPendingOrder._id,
            paymentInfo: {
              id: preferenceResponse.id,
              init_point: preferenceResponse.init_point,
              sandbox_init_point: preferenceResponse.sandbox_init_point,
            },
          });
        } catch (mpError) {
          console.error('Error creando preferencia MP:', mpError);
          return NextResponse.json(
            { error: 'Error al procesar el pago' },
            { status: 500 },
          );
        }
      } else if (orderData.paymentMethod === 'whatsapp') {
        return NextResponse.json({
          message: 'Orden de WhatsApp actualizada',
          orderId: recentPendingOrder._id,
        });
      }

      return NextResponse.json({
        message: 'Orden actualizada correctamente',
        orderId: recentPendingOrder._id,
      });
    }

    // Verificar si el método de pago es válido
    const validPaymentMethods = [
      'mercadopago',
      'credit_card',
      'debit_card',
      'whatsapp',
    ];
    if (!validPaymentMethods.includes(orderData.paymentMethod)) {
      return NextResponse.json(
        { message: 'Método de pago no válido' },
        { status: 400 },
      );
    }

    // ========== CALCULAR SUBTOTAL SI NO VIENE ==========
    if (!orderData.subtotal || orderData.subtotal === 0) {
      orderData.subtotal = orderData.items.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
    }

    // ========== ASEGURAR DISCOUNT AMOUNT ==========
    if (!orderData.discountAmount) {
      orderData.discountAmount = 0;
    }

    // ========== VALIDAR TOTAL AMOUNT ==========
    if (!orderData.totalAmount || orderData.totalAmount === 0) {
      orderData.totalAmount = orderData.subtotal - orderData.discountAmount;
    }
    // ==================================================

    // Determinar el estado inicial de la orden según el método de pago
    let initialStatus = 'pendiente';
    if (orderData.paymentMethod === 'whatsapp') {
      initialStatus = 'whatsapp_pendiente';
    }

    // ========== CREAR ORDEN - SIEMPRE CON SUBTOTAL ==========
    console.log('📋 Creando orden con datos:', {
      subtotal: orderData.subtotal,
      discountAmount: orderData.discountAmount,
      totalAmount: orderData.totalAmount,
      hasCoupon: !!orderData.appliedCoupon,
      couponCode: orderData.appliedCoupon?.code,
    });

    // Crear orden directamente (el modelo calcula lo que falta)
    const order = new Order({
      user: user._id,
      items: orderData.items,
      subtotal: orderData.subtotal,
      discountAmount: orderData.discountAmount || 0,
      appliedCoupon: orderData.appliedCoupon || null,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      shippingInfo: orderData.shippingInfo,
      status: initialStatus,
      idempotencyKey: orderData.idempotencyKey,
      whatsappOrder: orderData.paymentMethod === 'whatsapp',
      paymentDetails: {
        statusHistory: [],
      },
    });

    await order.save();
    console.log('✅ Orden guardada exitosamente:', order._id);

    // Si hay cupón, registrar su uso DESPUÉS de crear la orden
    if (orderData.appliedCoupon && orderData.appliedCoupon.code) {
      try {
        const Coupon = mongoose.model('Coupon');
        const coupon = await Coupon.findByCode(orderData.appliedCoupon.code);

        if (coupon) {
          await coupon.recordUsage(
            user._id,
            order._id,
            orderData.discountAmount,
          );
          console.log('✅ Uso del cupón registrado:', coupon.code);
        } else {
          console.warn(
            '⚠️ Cupón no encontrado para registrar uso:',
            orderData.appliedCoupon.code,
          );
        }
      } catch (couponError) {
        console.error('❌ Error registrando uso del cupón:', couponError);
        // No fallar la orden si falla el registro del cupón
      }
    }
    // ========================================================

    // Agregar la orden al usuario
    user.orders.push(order._id);
    await user.save();

    try {
      // Email de confirmación al cliente
      const customerEmailResult = await sendOrderConfirmationToCustomer(
        order,
        user,
      );

      // Email de notificación al administrador
      const adminEmailResult = await sendNewOrderNotificationToAdmin(
        order,
        user,
      );
    } catch (emailError) {
      console.error('❌ Error general enviando emails:', emailError);
      // No fallar la creación de la orden por errores de email
    }

    // Si el método de pago es MercadoPago, crear preferencia de pago
    if (orderData.paymentMethod === 'mercadopago') {
      try {
        const preferenceResponse = await createPaymentPreference(order);

        return NextResponse.json({
          message: 'Orden creada correctamente',
          orderId: order._id,
          paymentInfo: {
            id: preferenceResponse.id,
            init_point: preferenceResponse.init_point,
            sandbox_init_point: preferenceResponse.sandbox_init_point,
          },
        });
      } catch (mpError) {
        console.error('Error al crear preferencia en MercadoPago:', mpError);

        // Marcar orden como cancelada
        order.status = 'cancelado';
        order.paymentDetails = {
          errorType: 'error_pago',
          errorMessage: mpError.message,
          errorTimestamp: new Date(),
          cancelledReason: 'Error al crear preferencia de pago',
          cancelledAt: new Date(),
        };
        await order.save();

        return NextResponse.json(
          { message: `Error al crear preferencia de pago: ${mpError.message}` },
          { status: 500 },
        );
      }
    } else if (orderData.paymentMethod === 'whatsapp') {
      return NextResponse.json({
        message: 'Orden de WhatsApp creada correctamente',
        orderId: order._id,
      });
    }

    return NextResponse.json({
      message: 'Orden creada correctamente',
      orderId: order._id,
    });
  } catch (error) {
    console.error('Error al crear la orden:', error);
    return NextResponse.json(
      { message: `Error al crear la orden: ${error.message}` },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Verificación de administrador
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    // Obtener todas las órdenes con populate
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    return NextResponse.json([], { status: 500 });
  }
}
