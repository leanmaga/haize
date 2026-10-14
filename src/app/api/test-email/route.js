// =============================================================================
// ARCHIVO: src/app/api/test-email/route.js
// =============================================================================

import { emailPreviewTemplate } from '@/lib/message-email-templates';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmailWithRetry, verifyEmailConfig } from '@/lib/email-config';

// ✅ FUNCIÓN PARA OBTENER URL DEL LOGO CORREGIDA
function getLogoUrl() { return 'https://www.haize.com.ar/haizelogo.png'; }

// ✅ GET - Verificar configuración
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 },
      );
    }

    console.log('🧪 Verificando configuración de email...');
    const configResult = await verifyEmailConfig();

    return NextResponse.json({
      message: 'Verificación de email completada',
      timestamp: new Date().toISOString(),
      ...configResult,
      logoUrl: getLogoUrl(), // ← AGREGAR LOGO URL PARA DEBUG
    });
  } catch (error) {
    console.error('❌ Error verificando configuración:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// ✅ POST - Enviar emails de prueba
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 },
      );
    }

    const body = await request.json();
    console.log('📧 Request completo recibido:', JSON.stringify(body, null, 2));

    const emailType = body.action || body.type;
    const testEmail = body.to || body.testEmail;

    console.log('🔍 Valores extraídos:', {
      emailType,
      testEmail,
      logoUrl: getLogoUrl(), // ← LOG PARA DEBUG
      bodyKeys: Object.keys(body),
    });

    if (!emailType) {
      return NextResponse.json(
        {
          success: false,
          error: "Se requiere 'action' en el body del request",
          received: body,
          availableTypes: [
            'test',
            'verification',
            'password-reset',
            'order-confirmation',
            'admin-order-notification',
            'payment-confirmation',
            'admin-payment-notification',
          ],
        },
        { status: 400 },
      );
    }

    if (!testEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Se requiere 'to' en el body del request",
        },
        { status: 400 },
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Formato de email inválido',
        },
        { status: 400 },
      );
    }

    let result;

    // ✅ PROCESAR SEGÚN EL TIPO DE EMAIL
    switch (emailType) {
      case 'test':
        console.log('📧 Enviando email de prueba básico a:', testEmail);
        result = await sendBasicTestEmail(testEmail);
        break;

      case 'verification':
        console.log('📧 Enviando email de verificación a:', testEmail);
        result = await sendVerificationTestEmail(testEmail);
        break;

      case 'password-reset':
        console.log('📧 Enviando email de reset de contraseña a:', testEmail);
        result = await sendPasswordResetTestEmail(testEmail);
        break;

      case 'order-confirmation':
        console.log('📧 Enviando confirmación de orden a:', testEmail);
        result = await sendOrderConfirmationTestEmail(testEmail);
        break;

      case 'admin-order-notification':
        console.log('📧 Enviando notificación de orden al admin');
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        result = await sendAdminOrderNotificationTestEmail(adminEmail);
        break;

      case 'payment-confirmation':
        console.log('📧 Enviando confirmación de pago a:', testEmail);
        result = await sendPaymentConfirmationTestEmail(testEmail);
        break;

      case 'admin-payment-notification':
        console.log('📧 Enviando notificación de pago al admin');
        const adminPaymentEmail =
          process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        result = await sendAdminPaymentNotificationTestEmail(adminPaymentEmail);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Tipo de email "${emailType}" no implementado`,
            availableTypes: [
              'test',
              'verification',
              'password-reset',
              'order-confirmation',
              'admin-order-notification',
              'payment-confirmation',
              'admin-payment-notification',
            ],
          },
          { status: 400 },
        );
    }

    // Log del resultado
    if (result.success) {
      console.log(`✅ Email "${emailType}" enviado exitosamente:`, {
        to: testEmail,
        messageId: result.messageId,
      });
    } else {
      console.error(`❌ Error enviando email "${emailType}":`, result.error);
    }

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Email de prueba "${emailType}" enviado exitosamente`
        : `Error enviando email: ${result.error}`,
      result: result,
      type: emailType,
      to: testEmail,
      messageId: result.messageId,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error crítico en POST /api/test-email:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// =============================================================================
// FUNCIONES AUXILIARES PARA CADA TIPO DE EMAIL (TODAS COMPLETAS)
// =============================================================================

// 1. Email de prueba básico
async function sendBasicTestEmail(recipient) {
  return sendEmailWithRetry({ to: recipient, subject: '[PRUEBA] HAIZE - test', html: emailPreviewTemplate('test') });
}

// 2. Email de verificación de cuenta
async function sendVerificationTestEmail(recipient) {
  return sendEmailWithRetry({ to: recipient, subject: '[PRUEBA] HAIZE - verification', html: emailPreviewTemplate('verification') });
}

// 3. Email de reset de contraseña
async function sendPasswordResetTestEmail(recipient) {
  return sendEmailWithRetry({ to: recipient, subject: '[PRUEBA] HAIZE - password-reset', html: emailPreviewTemplate('password-reset') });
}

// 4. Email de confirmación de orden
async function sendOrderConfirmationTestEmail(recipient) {
  return sendEmailWithRetry({ to: recipient, subject: '[PRUEBA] HAIZE - order-confirmation', html: emailPreviewTemplate('order-confirmation') });
}

// 5. Email de notificación de nueva orden al admin
async function sendAdminOrderNotificationTestEmail(recipient) {
  return sendEmailWithRetry({ to: recipient, subject: '[PRUEBA] HAIZE - admin-order-notification', html: emailPreviewTemplate('admin-order-notification') });
}

// 6. Email de confirmación de pago
async function sendPaymentConfirmationTestEmail(recipient) {
  return sendEmailWithRetry({ to: recipient, subject: '[PRUEBA] HAIZE - payment-confirmation', html: emailPreviewTemplate('payment-confirmation') });
}

// 7. Email de notificación de pago al admin
async function sendAdminPaymentNotificationTestEmail(recipient) {
  return sendEmailWithRetry({ to: recipient, subject: '[PRUEBA] HAIZE - admin-payment-notification', html: emailPreviewTemplate('admin-payment-notification') });
}

// =============================================================================
// HELPERS PARA TEMPLATES
// =============================================================================
