// src/app/api/admin/orders/[id]/route.js - CON REDUCCIÓN DE STOCK
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { getPaymentById } from '@/lib/mercadopago';
import { sendPaymentConfirmedEmails } from '@/lib/order-emails';
import { reduceStockForOrder, restoreStockForOrder } from '@/lib/stock-utils'; // ← NUEVA IMPORTACIÓN

// GET para obtener detalles de una orden específica
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    // ✅ AWAIT params
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { message: 'ID de orden no proporcionado' },
        { status: 400 },
      );
    }

    await connectDB();

    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return NextResponse.json(
        { message: 'Orden no encontrada' },
        { status: 404 },
      );
    }

    // Intentar obtener detalles del pago de MercadoPago si existe
    let paymentDetails = null;
    if (order.paymentId) {
      try {
        const paymentInfo = await getPaymentById(order.paymentId);
        paymentDetails = paymentInfo;
      } catch (error) {
        console.error('Error al obtener detalles del pago:', error);
      }
    }

    return NextResponse.json({
      order: JSON.parse(JSON.stringify(order)),
      paymentDetails,
    });
  } catch (error) {
    console.error('Error al obtener orden:', error);
    return NextResponse.json(
      { message: 'Error al obtener la orden: ' + error.message },
      { status: 500 },
    );
  }
}

// PATCH para actualizar el estado de una orden (solo para admins)
export async function PATCH(request, { params }) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    // ✅ CORRECCIÓN: Usar await params consistentemente
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { message: 'ID de orden no proporcionado' },
        { status: 400 },
      );
    }

    const data = await request.json();

    // Conectar a la base de datos
    await connectDB();

    // Buscar la orden con información del usuario
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: 'Orden no encontrada' },
        { status: 404 },
      );
    }

    // Obtener el usuario para los emails
    const user = await User.findById(order.user);
    if (!user) {
      return NextResponse.json(
        { message: 'Usuario de la orden no encontrado' },
        { status: 404 },
      );
    }

    // Guardar el estado anterior
    const previousStatus = order.status;
    let emailResults = null;
    let stockResults = null;

    // Actualizar el estado de la orden si se proporciona
    if (data.status) {
      // Validar que sea un estado permitido
      const validStatuses = [
        'whatsapp_pendiente',
        'pendiente',
        'pagado',
        'enviado',
        'entregado',
        'cancelado',
      ];

      if (!validStatuses.includes(data.status)) {
        return NextResponse.json(
          { message: 'Estado no válido' },
          { status: 400 },
        );
      }

      order.status = data.status;

      // 🆕 REDUCIR STOCK CUANDO SE MARCA COMO "PAGADO"
      if (data.status === 'pagado' && previousStatus !== 'pagado') {
        try {
          console.log(`📦 [ADMIN] Reduciendo stock para orden ${order._id}`);

          stockResults = await reduceStockForOrder(order);

          console.log(`📦 [ADMIN] Resultado reducción de stock:`, {
            success: stockResults.success,
            updated: stockResults.updated.length,
            errors: stockResults.errors.length,
          });

          // Guardar información del stock en la orden
          if (!order.paymentDetails) {
            order.paymentDetails = {};
          }

          order.paymentDetails.stockReduction = {
            timestamp: new Date(),
            success: stockResults.success,
            updatedProducts: stockResults.updated,
            errors: stockResults.errors,
            triggeredBy: session.user.email,
            manualUpdate: true,
          };

          if (stockResults.success) {
            console.log(`✅ [ADMIN] Stock reducido exitosamente`);
          } else {
            console.error(`❌ [ADMIN] Error reduciendo stock:`, {
              errors: stockResults.errors,
            });
          }
        } catch (stockError) {
          console.error(`💥 [ADMIN] Error crítico reduciendo stock:`, {
            message: stockError.message,
            stack: stockError.stack,
          });

          // Guardar el error pero no fallar la actualización
          order.paymentDetails.stockError = {
            timestamp: new Date(),
            error: stockError.message,
            triggeredBy: session.user.email,
          };
        }

        // ENVIAR EMAILS CUANDO EL ESTADO CAMBIA A "PAGADO"
        try {
          emailResults = await sendPaymentConfirmedEmails(order, user);

          if (emailResults.success) {
            // Agregar información sobre los emails enviados
            order.paymentDetails = {
              ...order.paymentDetails,
              manualStatusChange: {
                timestamp: new Date(),
                changedBy: session.user.email,
                previousStatus,
                newStatus: data.status,
                emailsSent: emailResults.results,
              },
            };
          } else {
            console.error(
              '❌ Error enviando emails tras cambio manual:',
              emailResults,
            );
          }
        } catch (emailError) {
          console.error(
            '❌ Error crítico enviando emails tras cambio manual:',
            emailError,
          );
          // No fallar la actualización por errores de email
        }
      }

      // 🆕 RESTAURAR STOCK SI SE CANCELA UNA ORDEN PAGADA
      if (
        data.status === 'cancelado' &&
        (previousStatus === 'pagado' ||
          previousStatus === 'enviado' ||
          previousStatus === 'entregado')
      ) {
        try {
          console.log(
            `🔄 [ADMIN] Restaurando stock para orden cancelada ${order._id}`,
          );

          stockResults = await restoreStockForOrder(order);

          console.log(`🔄 [ADMIN] Resultado restauración de stock:`, {
            success: stockResults.success,
            restored: stockResults.restored.length,
            errors: stockResults.errors.length,
          });

          // Guardar información de la restauración
          if (!order.paymentDetails) {
            order.paymentDetails = {};
          }

          order.paymentDetails.stockRestoration = {
            timestamp: new Date(),
            success: stockResults.success,
            restoredProducts: stockResults.restored,
            errors: stockResults.errors,
            triggeredBy: session.user.email,
            reason: 'Order cancelled',
          };

          if (stockResults.success) {
            console.log(`✅ [ADMIN] Stock restaurado exitosamente`);
          } else {
            console.error(`❌ [ADMIN] Error restaurando stock:`, {
              errors: stockResults.errors,
            });
          }
        } catch (stockError) {
          console.error(`💥 [ADMIN] Error crítico restaurando stock:`, {
            message: stockError.message,
            stack: stockError.stack,
          });

          order.paymentDetails.stockRestorationError = {
            timestamp: new Date(),
            error: stockError.message,
            triggeredBy: session.user.email,
          };
        }
      }
    }

    // Agregar información de auditoría
    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: data.status || order.status,
      timestamp: new Date(),
      changedBy: session.user.email,
      previousStatus,
      stockReduced: stockResults?.success || false,
      emailsSent: emailResults?.success || false,
    });

    await order.save();

    // Preparar respuesta
    const response = {
      message: 'Orden actualizada correctamente',
      order,
      statusChange: {
        previous: previousStatus,
        current: order.status,
        timestamp: new Date(),
      },
    };

    // Incluir resultados de stock si aplica
    if (stockResults) {
      response.stockResults = {
        success: stockResults.success,
        updated: stockResults.updated?.length || 0,
        restored: stockResults.restored?.length || 0,
        errors: stockResults.errors?.length || 0,
      };
    }

    // Incluir resultados de email si se enviaron
    if (emailResults) {
      response.emailResults = emailResults;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al actualizar la orden:', error);
    return NextResponse.json(
      { message: `Error al actualizar la orden: ${error.message}` },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    // ✅ AWAIT params
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { message: 'ID de orden no proporcionado' },
        { status: 400 },
      );
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: 'Orden no encontrada' },
        { status: 404 },
      );
    }

    // Solo permitir cancelar órdenes que no estén entregadas
    if (order.status === 'entregado') {
      return NextResponse.json(
        { message: 'No se puede cancelar una orden entregada' },
        { status: 400 },
      );
    }

    // 🆕 RESTAURAR STOCK SI LA ORDEN ESTABA PAGADA
    const previousStatus = order.status;
    if (previousStatus === 'pagado' || previousStatus === 'enviado') {
      try {
        console.log(
          `🔄 [ADMIN] Restaurando stock para orden eliminada ${order._id}`,
        );

        const stockResults = await restoreStockForOrder(order);

        console.log(`🔄 [ADMIN] Resultado restauración:`, {
          success: stockResults.success,
          restored: stockResults.restored.length,
        });
      } catch (stockError) {
        console.error(`❌ [ADMIN] Error restaurando stock:`, stockError);
        // Continuar con la cancelación aunque falle la restauración
      }
    }

    order.status = 'cancelado';
    order.paymentDetails = {
      ...order.paymentDetails,
      cancelledBy: session.user.email,
      cancelledAt: new Date(),
      cancelledReason: 'Cancelado por administrador',
    };

    await order.save();

    return NextResponse.json({
      message: 'Orden cancelada correctamente',
      order,
    });
  } catch (error) {
    console.error('Error al cancelar la orden:', error);
    return NextResponse.json(
      { message: `Error al cancelar la orden: ${error.message}` },
      { status: 500 },
    );
  }
}
