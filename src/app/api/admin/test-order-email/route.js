// =============================================================================
// ARCHIVO: src/app/api/test-email/route.js
// API COMPLETA CON TODOS LOS TIPOS DE EMAIL - REEMPLAZA COMPLETAMENTE
// =============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmailWithRetry, verifyEmailConfig } from '@/lib/email-config';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '@/lib/email-actions';

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

    const configResult = await verifyEmailConfig();

    return NextResponse.json({
      message: 'Verificación de email completada',
      timestamp: new Date().toISOString(),
      ...configResult,
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

    const emailType = body.action || body.type;
    const testEmail = body.to || body.testEmail;

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
      // Email de prueba básico
      case 'test':
        result = await sendBasicTestEmail(testEmail);
        break;

      // Email de verificación de cuenta
      case 'verification':
        result = await sendVerificationTestEmail(testEmail);
        break;

      // Email de reset de contraseña
      case 'password-reset':
        result = await sendPasswordResetTestEmail(testEmail);
        break;

      // Email de confirmación de orden
      case 'order-confirmation':
        result = await sendOrderConfirmationTestEmail(testEmail);
        break;

      // Email de notificación de nueva orden al admin
      case 'admin-order-notification':
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        result = await sendAdminOrderNotificationTestEmail(adminEmail);
        break;

      // Email de confirmación de pago
      case 'payment-confirmation':
        result = await sendPaymentConfirmationTestEmail(testEmail);
        break;

      // Email de notificación de pago al admin
      case 'admin-payment-notification':
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
      result: result, // Para compatibilidad con el componente
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
// FUNCIONES AUXILIARES PARA CADA TIPO DE EMAIL
// =============================================================================

// 1. Email de prueba básico
async function sendBasicTestEmail(testEmail) {
  const emailData = {
    to: testEmail,
    subject: '🧪 Test Básico - HAIZE',
    html: createBasicTestTemplate(
      'Test Básico de Email',
      '✅ El sistema de emails está funcionando correctamente.',
      '#4CAF50',
    ),
  };
  return await sendEmailWithRetry(emailData);
}

// 2. Email de verificación de cuenta (simulado)
async function sendVerificationTestEmail(testEmail) {
  const baseUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

  const emailData = {
    to: testEmail,
    subject: '[PRUEBA] Verifica tu cuenta - HAIZE',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Verificación de Cuenta</title>
        ${getEmailStyles()}
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: #667eea;">
            <h1>🌟 ¡Bienvenido a HAIZE!</h1>
          </div>
          <div class="content">
            <h2>Verifica tu cuenta</h2>
            <p>Gracias por registrarte. Para completar tu registro, haz clic en el botón:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/auth/verify-email?token=test-token-123" class="button">Verificar Cuenta</a>
            </div>
            <div class="test-note">
              <p><strong>📧 Email de Prueba:</strong> Este es un email de testing. El enlace no es funcional.</p>
            </div>
          </div>
          ${getEmailFooter()}
        </div>
      </body>
      </html>
    `,
  };
  return await sendEmailWithRetry(emailData);
}

// 3. Email de reset de contraseña (simulado)
async function sendPasswordResetTestEmail(testEmail) {
  const baseUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

  const emailData = {
    to: testEmail,
    subject: '[PRUEBA] Restablece tu contraseña - HAIZE',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Restablecer Contraseña</title>
        ${getEmailStyles()}
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: #f59e0b;">
            <h1>🔐 Restablecimiento de Contraseña</h1>
          </div>
          <div class="content">
            <h2>Solicitud de nueva contraseña</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña. Si fuiste tú, haz clic en el botón:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/auth/reset-password/test-token-456" class="button">Restablecer Contraseña</a>
            </div>
            <p style="color: #666; font-size: 14px;">Si no solicitaste esto, ignora este email.</p>
            <div class="test-note">
              <p><strong>📧 Email de Prueba:</strong> Este es un email de testing. El enlace no es funcional.</p>
            </div>
          </div>
          ${getEmailFooter()}
        </div>
      </body>
      </html>
    `,
  };
  return await sendEmailWithRetry(emailData);
}

// 4. Email de confirmación de orden
async function sendOrderConfirmationTestEmail(testEmail) {
  const sampleProducts = [
    {
      name: 'Remera',
      quantity: 2,
      price: 2500,
      image: 'https://via.placeholder.com/60x60?text=remera',
    },
    {
      name: 'Musculosa',
      quantity: 1,
      price: 1200,
      image: 'https://via.placeholder.com/60x60?text=musculosa',
    },
  ];

  const total = sampleProducts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0,
  );

  const productsHtml = sampleProducts
    .map(
      (product) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
        <img src="${product.image}" alt="${
          product.name
        }" style="width: 40px; height: 40px; border-radius: 4px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${
        product.name
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center;">${
        product.quantity
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${
        product.price
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold;">$${
        product.price * product.quantity
      }</td>
    </tr>
  `,
    )
    .join('');

  const emailData = {
    to: testEmail,
    subject: '[PRUEBA] Confirmación de Pedido #TEST123 - HAIZE',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Confirmación de Pedido</title>
        ${getEmailStyles()}
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: #10b981;">
            <h1>📦 ¡Pedido Confirmado!</h1>
          </div>
          <div class="content">
            <h2>Gracias por tu compra</h2>
            <p>Tu pedido ha sido recibido y está siendo procesado.</p>
            
            <div class="order-details">
              <h3>📋 Detalles del Pedido #TEST123</h3>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString(
                'es-AR',
              )}</p>
              <p><strong>Estado:</strong> Pendiente de pago</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 10px; text-align: left;">Imagen</th>
                  <th style="padding: 10px; text-align: left;">Producto</th>
                  <th style="padding: 10px; text-align: center;">Cant.</th>
                  <th style="padding: 10px; text-align: right;">Precio</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
              </tbody>
            </table>

            <div class="total-section">
              <h3 style="text-align: right; color: #10b981;">Total: $${total}</h3>
            </div>

            <div class="shipping-info">
              <h3>📍 Dirección de Envío</h3>
              <p>Juan Pérez (Cliente de Prueba)<br>
              Av. Corrientes 1234<br>
              Buenos Aires, 1000<br>
              Argentina</p>
            </div>

            <div class="test-note">
              <p><strong>📧 Email de Prueba:</strong> Esta es una orden de ejemplo para testing.</p>
            </div>
          </div>
          ${getEmailFooter()}
        </div>
      </body>
      </html>
    `,
  };
  return await sendEmailWithRetry(emailData);
}

// 5. Email de notificación de nueva orden al admin
async function sendAdminOrderNotificationTestEmail(adminEmail) {
  const emailData = {
    to: adminEmail,
    subject: '[PRUEBA] 🚨 Nueva Orden #TEST123 - HAIZE',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Nueva Orden</title>
        ${getEmailStyles()}
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: #ef4444;">
            <h1>🚨 Nueva Orden Recibida</h1>
          </div>
          <div class="content">
            <h2>Orden #TEST123</h2>
            <p>Se ha recibido una nueva orden que requiere tu atención.</p>
            
            <div class="order-details">
              <h3>📋 Información del Cliente</h3>
              <p><strong>Nombre:</strong> Juan Pérez (Cliente de Prueba)</p>
              <p><strong>Email:</strong> ${adminEmail}</p>
              <p><strong>Teléfono:</strong> +54 9 11 1234-5678</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString(
                'es-AR',
              )}</p>
            </div>

            <div class="order-summary">
              <h3>💰 Resumen del Pedido</h3>
              <ul>
                <li>Remera Blanca x2 - $5000</li>
                <li>Remera Negra x2 - $1200</li>
              </ul>
              <h4 style="color: #ef4444;">Total: $6200</h4>
            </div>

            <div class="actions">
              <h3>📋 Acciones Requeridas</h3>
              <ul>
                <li>Verificar disponibilidad de productos</li>
                <li>Confirmar el pago</li>
                <li>Preparar el envío</li>
                <li>Contactar al cliente si es necesario</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://wa.me/5491112345678" class="button">Contactar Cliente</a>
            </div>

            <div class="test-note">
              <p><strong>📧 Email de Prueba:</strong> Esta es una notificación de ejemplo para testing.</p>
            </div>
          </div>
          ${getEmailFooter()}
        </div>
      </body>
      </html>
    `,
  };
  return await sendEmailWithRetry(emailData);
}

// 6. Email de confirmación de pago
async function sendPaymentConfirmationTestEmail(testEmail) {
  const emailData = {
    to: testEmail,
    subject: '[PRUEBA] ✅ Pago Confirmado - Pedido #TEST123',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Pago Confirmado</title>
        ${getEmailStyles()}
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: #10b981;">
            <h1>✅ ¡Pago Confirmado!</h1>
          </div>
          <div class="content">
            <h2>Tu pago fue procesado exitosamente</h2>
            <p>¡Excelentes noticias! Hemos confirmado tu pago y ahora procederemos a preparar tu pedido.</p>
            
            <div class="payment-details">
              <h3>💳 Detalles del Pago</h3>
              <p><strong>Pedido:</strong> #TEST123</p>
              <p><strong>Fecha del pago:</strong> ${new Date().toLocaleDateString(
                'es-AR',
              )}</p>
              <p><strong>Método de pago:</strong> MercadoPago</p>
              <p><strong>ID de transacción:</strong> MP-TEST-789456</p>
              <p><strong>Monto pagado:</strong> $6200</p>
            </div>

            <div class="next-steps" style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📦 ¿Qué sigue ahora?</h3>
              <ul>
                <li>Preparamos tu pedido con mucho cuidado</li>
                <li>Te contactaremos para coordinar la entrega</li>
                <li>Recibirás un email cuando tu pedido esté en camino</li>
              </ul>
            </div>

            <div class="shipping-info">
              <h3>📍 Envío a:</h3>
              <p>Juan Pérez<br>
              Av. Corrientes 1234<br>
              Buenos Aires, 1000</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://wa.me/5491126907696" class="button">Contactar por WhatsApp</a>
            </div>

            <div class="test-note">
              <p><strong>📧 Email de Prueba:</strong> Este es un email de confirmación de pago de ejemplo.</p>
            </div>
          </div>
          ${getEmailFooter()}
        </div>
      </body>
      </html>
    `,
  };
  return await sendEmailWithRetry(emailData);
}

// 7. Email de notificación de pago al admin
async function sendAdminPaymentNotificationTestEmail(adminEmail) {
  const emailData = {
    to: adminEmail,
    subject: '[PRUEBA] 💰 Pago Confirmado - Orden #TEST123',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Pago Confirmado</title>
        ${getEmailStyles()}
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: #10b981;">
            <h1>💰 Pago Confirmado</h1>
          </div>
          <div class="content">
            <h2>Nueva confirmación de pago</h2>
            <p>Se ha confirmado el pago de la orden #TEST123.</p>
            
            <div class="payment-info">
              <h3>💳 Información del Pago</h3>
              <p><strong>Orden:</strong> #TEST123</p>
              <p><strong>Cliente:</strong> Juan Pérez (Cliente de Prueba)</p>
              <p><strong>Email:</strong> ${adminEmail}</p>
              <p><strong>Monto:</strong> $6200</p>
              <p><strong>Método:</strong> MercadoPago</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString(
                'es-AR',
              )}</p>
              <p><strong>Estado:</strong> Aprobado ✅</p>
            </div>

            <div class="actions" style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📋 Próximos Pasos</h3>
              <ul>
                <li>✅ Pago confirmado automáticamente</li>
                <li>📦 Preparar productos para envío</li>
                <li>📞 Contactar al cliente para coordinar entrega</li>
                <li>📋 Actualizar estado de la orden a "Preparando"</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${adminEmail}" class="button">Ver Orden en Admin</a>
            </div>

            <div class="test-note">
              <p><strong>📧 Email de Prueba:</strong> Esta es una notificación de pago de ejemplo para testing.</p>
            </div>
          </div>
          ${getEmailFooter()}
        </div>
      </body>
      </html>
    `,
  };
  return await sendEmailWithRetry(emailData);
}

// =============================================================================
// HELPERS PARA TEMPLATES
// =============================================================================

function getEmailStyles() {
  return `
    <style>
      body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6; 
        color: #333; 
        margin: 0; 
        padding: 20px;
        background-color: #f4f4f4;
      }
      .container { 
        max-width: 600px; 
        margin: 0 auto; 
        background: white; 
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .header { 
        color: white; 
        padding: 30px; 
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content { 
        padding: 30px; 
      }
      .button { 
        background: #4CAF50; 
        color: white; 
        padding: 12px 24px; 
        text-decoration: none; 
        border-radius: 6px; 
        display: inline-block; 
        font-weight: bold;
      }
      .order-details, .payment-details, .shipping-info, .order-summary, .payment-info, .actions {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
        border-left: 4px solid #4CAF50;
      }
      .total-section {
        background: #e8f5e8;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
      }
      .test-note {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        color: #856404;
      }
      .footer { 
        background: #f8f9fa; 
        padding: 20px; 
        text-align: center; 
        color: #666;
        border-top: 1px solid #e9ecef;
      }
    </style>
  `;
}

function getEmailFooter() {
  return `
    <div class="footer">
      <p style="margin: 0; font-size: 14px;">© ${new Date().getFullYear()} HAIZE - Sistema de Emails</p>
      <p style="margin: 5px 0 0 0; font-size: 12px;">📧 Test: ${new Date().toLocaleString(
        'es-AR',
      )}</p>
    </div>
  `;
}

function createBasicTestTemplate(title, message, color = '#4CAF50') {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background: ${color};">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; text-align: center; margin-bottom: 30px;">${message}</p>
          <div style="text-align: center;">
            <span style="background: #4CAF50; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold;">
              ✅ Sistema Funcionando
            </span>
          </div>
          <div class="test-note">
            <p><strong>📧 Email de Prueba:</strong> Este es un email de testing del sistema.</p>
          </div>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
}
