// api/mercadopago/webhook/route.js - WEBHOOK CON REDUCCIÓN AUTOMÁTICA DE STOCK
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import crypto from 'crypto';
import { getPaymentById } from '@/lib/mercadopago';
import { sendPaymentConfirmedEmails } from '@/lib/order-emails';
import { verifyEmailConfig } from '@/lib/email-config';
import { reduceStockForOrder } from '@/lib/stock-utils'; // ← NUEVA IMPORTACIÓN
import { verifyWebhookSignature } from '@/lib/mercadopago-webhook-signature';

export async function POST(request) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID().substring(0, 8);

  try {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret?.trim()) {
      console.error(`❌ [${requestId}] Webhook signing secret is not configured`);
      return NextResponse.json({ message: 'Webhook unavailable' }, { status: 503 });
    }

    const resourceIds = new URL(request.url).searchParams.getAll('data.id');
    const paymentId = resourceIds.length === 1 ? resourceIds[0] : null;
    const isValid = verifyWebhookSignature({
      signature: request.headers.get('x-signature'),
      requestId: request.headers.get('x-request-id'),
      dataId: paymentId,
      secret,
    });
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    const bodyText = await request.text();

    // 3. Parsear JSON
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (error) {
      console.error(`❌ [${requestId}] Error parseando JSON:`, error);
      return NextResponse.json(
        {
          message: 'Invalid JSON',
          requestId,
        },
        { status: 400 },
      );
    }

    // Bind the body to the authenticated resource before any payment side effects.
    if (data?.data?.id == null || String(data.data.id).toLowerCase() !== paymentId.toLowerCase()) {
      return NextResponse.json({ message: 'Payment ID mismatch' }, { status: 400 });
    }

    // 4. Verificar que es una notificación de pago
    if (!['payment.created', 'payment.updated'].includes(data.action)) {
      console.log(`ℹ️ [${requestId}] No es notificación de pago:`, data.action);
      return NextResponse.json({
        message: 'Not a payment notification',
        action: data.action,
        requestId,
      });
    }

    console.log(`💳 [${requestId}] Procesando pago ID: ${paymentId}`);

    // 6. Obtener información del pago desde MercadoPago
    let paymentInfo;
    try {
      paymentInfo = await getPaymentById(paymentId);
      console.log(`✅ [${requestId}] Info del pago obtenida:`, {
        id: paymentInfo.id,
        status: paymentInfo.status,
        external_reference: paymentInfo.external_reference,
        amount: paymentInfo.transaction_amount,
      });
    } catch (error) {
      console.error(`❌ [${requestId}] Error obteniendo info del pago:`, error);
      return NextResponse.json(
        {
          message: 'Payment info error',
          error: error.message,
          requestId,
        },
        { status: 200 },
      );
    }

    // 7. Verificar external_reference
    const externalReference = paymentInfo.external_reference;
    if (!externalReference) {
      console.log(`❌ [${requestId}] No external reference encontrado`);
      return NextResponse.json(
        {
          message: 'No external reference',
          requestId,
        },
        { status: 200 },
      );
    }

    // 8. Conectar a la base de datos y buscar la orden
    await connectDB();
    const order = await Order.findById(externalReference);

    if (!order) {
      console.log(
        `❌ [${requestId}] Orden no encontrada: ${externalReference}`,
      );
      return NextResponse.json(
        {
          message: 'Order not found',
          externalReference,
          requestId,
        },
        { status: 200 },
      );
    }

    console.log(`📦 [${requestId}] Orden encontrada:`, {
      orderId: order._id,
      currentStatus: order.status,
      userId: order.user,
      total: order.totalAmount,
    });

    // 9. Procesar según el estado del pago
    const paymentStatus = paymentInfo.status;
    const previousStatus = order.status;

    if (paymentStatus === 'approved' && order.status !== 'pagado') {
      console.log(`💰 [${requestId}] Pago aprobado - Procesando...`);

      // 10. Obtener información del usuario
      const user = await User.findById(order.user);
      if (!user) {
        console.warn(
          `⚠️ [${requestId}] Usuario no encontrado para la orden ${order._id}`,
        );
        return NextResponse.json(
          {
            message: 'User not found',
            orderId: order._id,
            requestId,
          },
          { status: 200 },
        );
      }

      console.log(`👤 [${requestId}] Usuario encontrado:`, {
        userId: user._id,
        name: user.name,
        email: user.email,
      });

      // 11. Verificar configuración de email antes de enviar
      console.log(`📧 [${requestId}] Verificando configuración de email...`);
      const emailConfigCheck = await verifyEmailConfig();
      console.log(
        `📧 [${requestId}] Resultado verificación email:`,
        emailConfigCheck,
      );

      // 12. Actualizar el estado de la orden
      order.status = 'pagado';
      order.paymentId = paymentId;

      // Actualizar detalles del pago
      order.paymentDetails = {
        ...order.paymentDetails,
        status: paymentStatus,
        method: paymentInfo.payment_method_id,
        type: paymentInfo.payment_type_id,
        lastUpdated: new Date(),
        statusHistory: order.paymentDetails?.statusHistory || [],
      };

      // 🆕 13. REDUCIR STOCK DE LOS PRODUCTOS
      let stockResults = null;
      try {
        console.log(`📦 [${requestId}] Reduciendo stock de productos...`);

        stockResults = await reduceStockForOrder(order);

        console.log(`📦 [${requestId}] Resultado reducción de stock:`, {
          success: stockResults.success,
          updated: stockResults.updated.length,
          errors: stockResults.errors.length,
        });

        // Guardar información del stock en la orden
        order.paymentDetails.stockReduction = {
          timestamp: new Date(),
          success: stockResults.success,
          updatedProducts: stockResults.updated,
          errors: stockResults.errors,
          requestId: requestId,
        };

        if (stockResults.success) {
          console.log(`✅ [${requestId}] Stock reducido exitosamente`);
        } else {
          console.error(`❌ [${requestId}] Error reduciendo stock:`, {
            errors: stockResults.errors,
          });
          // ⚠️ IMPORTANTE: Aunque falle la reducción de stock, continuamos
          // El admin puede ajustar manualmente el stock después
        }
      } catch (stockError) {
        console.error(`💥 [${requestId}] Error crítico reduciendo stock:`, {
          message: stockError.message,
          stack: stockError.stack,
        });

        // Guardar el error en la orden
        order.paymentDetails.stockError = {
          timestamp: new Date(),
          error: stockError.message,
          stack: stockError.stack,
          requestId: requestId,
        };

        // ⚠️ No fallar el webhook por errores de stock
        // El pago fue aprobado y el cliente debe recibir confirmación
      }

      // 14. ENVIAR EMAILS DE CONFIRMACIÓN
      let emailResults = null;
      try {
        console.log(`📧 [${requestId}] Enviando emails de confirmación...`);

        emailResults = await sendPaymentConfirmedEmails(
          order,
          user,
          paymentInfo,
        );

        console.log(`📧 [${requestId}] Resultado emails:`, {
          success: emailResults.success,
          customerSuccess: emailResults.customerResult?.success,
          adminSuccess: emailResults.adminResult?.success,
          customerMessageId: emailResults.customerResult?.messageId,
          adminMessageId: emailResults.adminResult?.messageId,
        });

        // Guardar info de emails en la orden
        order.paymentDetails.emailsSent = {
          timestamp: new Date(),
          success: emailResults.success,
          customerResult: {
            success: emailResults.customerResult?.success || false,
            messageId: emailResults.customerResult?.messageId || null,
            error: emailResults.customerResult?.error || null,
          },
          adminResult: {
            success: emailResults.adminResult?.success || false,
            messageId: emailResults.adminResult?.messageId || null,
            error: emailResults.adminResult?.error || null,
          },
          requestId: requestId,
        };

        if (emailResults.success) {
          console.log(`✅ [${requestId}] Emails enviados exitosamente`);
        } else {
          console.error(`❌ [${requestId}] Error en emails:`, {
            customerError: emailResults.customerResult?.error,
            adminError: emailResults.adminResult?.error,
          });
        }
      } catch (emailError) {
        console.error(`❌ [${requestId}] Error crítico enviando emails:`, {
          message: emailError.message,
          stack: emailError.stack,
        });

        // Guardar el error en la orden para debugging
        order.paymentDetails.emailError = {
          timestamp: new Date(),
          error: emailError.message,
          stack: emailError.stack,
          requestId: requestId,
        };
      }

      // 15. Agregar al historial de cambios de estado
      order.paymentDetails.statusHistory.push({
        from: previousStatus,
        to: order.status,
        timestamp: new Date(),
        paymentId: paymentId,
        emailsSent: emailResults?.success || false,
        stockReduced: stockResults?.success || false,
        requestId: requestId,
      });

      // 16. Guardar la orden
      await order.save();

      const processingTime = Date.now() - startTime;
      console.log(
        `✅ [${requestId}] Webhook procesado exitosamente en ${processingTime}ms`,
      );

      return NextResponse.json({
        message: 'Webhook processed successfully',
        requestId,
        orderId: order._id,
        previousStatus,
        newStatus: order.status,
        stockReduced: stockResults?.success || false,
        stockDetails: {
          updatedProducts: stockResults?.updated?.length || 0,
          errors: stockResults?.errors?.length || 0,
        },
        emailsSent: emailResults?.success || false,
        emailDetails: {
          customer: emailResults?.customerResult?.success || false,
          admin: emailResults?.adminResult?.success || false,
          customerMessageId: emailResults?.customerResult?.messageId,
          adminMessageId: emailResults?.adminResult?.messageId,
        },
        processed: true,
        processingTimeMs: processingTime,
      });
    } else {
      // El pago no está aprobado o la orden ya está pagada
      console.log(`ℹ️ [${requestId}] No requiere actualización:`, {
        paymentStatus,
        orderStatus: order.status,
      });

      return NextResponse.json({
        message: 'No update required',
        requestId,
        paymentStatus,
        orderStatus: order.status,
        processed: false,
      });
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`💥 [${requestId}] ERROR GENERAL del webhook:`, {
      message: error.message,
      stack: error.stack,
      processingTimeMs: processingTime,
    });

    return NextResponse.json(
      {
        message: `Error: ${error.message}`,
        requestId,
        processingTimeMs: processingTime,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 200 }, // Siempre devolver 200 para que MP no reintente
    );
  }
}

// También agregar método GET para verificar que el endpoint funciona
export async function GET() {
  return NextResponse.json({
    message: 'MercadoPago Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
