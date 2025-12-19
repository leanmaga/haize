// src/app/api/admin/orders/[id]/route.js - ACTUALIZADO CON DESCUENTO DE STOCK
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import { sendPaymentConfirmedEmails } from '@/lib/order-emails';
import { reduceStockForOrder, restoreStockForOrder } from '@/lib/stock-helper'; // 🆕 NUEVO IMPORT

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'No autorizado - Solo administradores' },
        { status: 403 },
      );
    }

    const { id } = await params;

    await connectDB();

    const order = await Order.findById(id)
      .populate('user', 'name email')
      .lean();

    if (!order) {
      return NextResponse.json(
        { message: 'Orden no encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error al obtener orden:', error);
    return NextResponse.json(
      { message: 'Error al obtener orden' },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  let emailResults = null;
  let stockResults = null;

  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'No autorizado - Solo administradores' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const data = await request.json();

    await connectDB();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { message: 'Orden no encontrada' },
        { status: 404 },
      );
    }

    const previousStatus = order.status;

    // Actualizar estado si se proporciona
    if (data.status) {
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

      // 🆕 DESCONTAR STOCK CUANDO EL ESTADO CAMBIA A "PAGADO"
      if (data.status === 'pagado' && previousStatus !== 'pagado') {
        console.log(`📦 [ADMIN] Descontando stock para orden ${order._id}...`);

        try {
          // Obtener usuario para los emails
          const user = await User.findById(order.user);

          // Descontar stock
          stockResults = await reduceStockForOrder(order);

          console.log(`📦 [ADMIN] Resultado descuento de stock:`, {
            success: stockResults.success,
            updatedProducts: stockResults.updatedProducts.length,
            errors: stockResults.errors.length,
          });

          // Guardar info de stock en la orden
          order.stockReduction = {
            timestamp: new Date(),
            success: stockResults.success,
            updatedProducts: stockResults.updatedProducts,
            errors:
              stockResults.errors.length > 0 ? stockResults.errors : undefined,
            triggeredBy: 'admin_manual',
            adminEmail: session.user.email,
          };

          // Enviar emails
          if (user) {
            try {
              emailResults = await sendPaymentConfirmedEmails(order, user);

              if (emailResults.success) {
                order.paymentDetails = {
                  ...order.paymentDetails,
                  manualStatusChange: {
                    timestamp: new Date(),
                    changedBy: session.user.email,
                    previousStatus,
                    newStatus: data.status,
                    emailsSent: emailResults.results,
                    stockReduced: stockResults.success,
                  },
                };
              }
            } catch (emailError) {
              console.error(
                '❌ Error enviando emails tras cambio manual:',
                emailError,
              );
            }
          }
        } catch (stockError) {
          console.error('❌ Error descontando stock:', stockError);
          // Guardar el error pero no fallar la actualización
          order.stockReduction = {
            timestamp: new Date(),
            success: false,
            error: stockError.message,
            triggeredBy: 'admin_manual',
            adminEmail: session.user.email,
          };
        }
      }

      // 🆕 RESTAURAR STOCK CUANDO SE CANCELA UNA ORDEN PAGADA
      if (data.status === 'cancelado' && previousStatus === 'pagado') {
        console.log(
          `🔄 [ADMIN] Restaurando stock para orden cancelada ${order._id}...`,
        );

        try {
          const restoreResults = await restoreStockForOrder(order);

          console.log(`🔄 [ADMIN] Resultado restauración de stock:`, {
            success: restoreResults.success,
            restoredProducts: restoreResults.restoredProducts.length,
            errors: restoreResults.errors.length,
          });

          // Guardar info de restauración
          if (!order.stockRestoration) {
            order.stockRestoration = [];
          }
          order.stockRestoration.push({
            timestamp: new Date(),
            success: restoreResults.success,
            restoredProducts: restoreResults.restoredProducts,
            errors:
              restoreResults.errors.length > 0
                ? restoreResults.errors
                : undefined,
            reason: 'order_cancelled',
            triggeredBy: 'admin_manual',
            adminEmail: session.user.email,
          });
        } catch (restoreError) {
          console.error('❌ Error restaurando stock:', restoreError);
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

    // Agregar info de stock si se descontó
    if (stockResults) {
      response.stockReduction = {
        success: stockResults.success,
        updatedProducts: stockResults.updatedProducts.length,
        errors: stockResults.errors.length,
      };
    }

    // Agregar info de emails si se enviaron
    if (emailResults) {
      response.emailsSent = emailResults.success;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    return NextResponse.json(
      {
        message: 'Error al actualizar orden',
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'No autorizado - Solo administradores' },
        { status: 403 },
      );
    }

    const { id } = await params;

    await connectDB();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { message: 'Orden no encontrada' },
        { status: 404 },
      );
    }

    // 🆕 Si la orden estaba pagada, restaurar el stock antes de eliminar
    if (order.status === 'pagado') {
      console.log(
        `🔄 [ADMIN] Restaurando stock antes de eliminar orden ${order._id}...`,
      );
      try {
        await restoreStockForOrder(order);
        console.log(`✅ [ADMIN] Stock restaurado antes de eliminar`);
      } catch (restoreError) {
        console.error(
          '❌ Error restaurando stock antes de eliminar:',
          restoreError,
        );
        // Continuar con la eliminación aunque falle la restauración
      }
    }

    await Order.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Orden eliminada correctamente',
      stockRestored: order.status === 'pagado',
    });
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    return NextResponse.json(
      { message: 'Error al eliminar orden' },
      { status: 500 },
    );
  }
}
