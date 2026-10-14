// =============================================================================
// ARCHIVO: src/lib/email-config.js
// LOGO PATH CORREGIDO - REEMPLAZA COMPLETAMENTE
// =============================================================================

import { basicTestEmailTemplate } from './message-email-templates';
import nodemailer from 'nodemailer';

// Función para obtener la URL base normalizada
function getBaseUrl() {
  const url = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

// ✅ FUNCIÓN PARA OBTENER URL DEL LOGO CORREGIDA
function getLogoUrl() { return 'https://www.haize.com.ar/haizelogo.png'; }

// ✅ FUNCIÓN PRINCIPAL PARA CREAR TRANSPORTADOR
export async function createEmailTransporter() {
  try {
    console.log('🔧 Creando transportador de email...');

    // Verificar variables de entorno
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    console.log('📋 Variables de entorno:', {
      EMAIL_SERVICE: emailService,
      EMAIL_USER: emailUser ? '✅ Configurado' : '❌ Faltante',
      EMAIL_PASS: emailPass ? '✅ Configurado' : '❌ Faltante',
      NODE_ENV: process.env.NODE_ENV,
      LOGO_URL: getLogoUrl(), // ← AGREGAR LOG DEL LOGO
    });

    // En desarrollo sin configuración, usar Ethereal
    if (process.env.NODE_ENV === 'development' && (!emailUser || !emailPass)) {
      console.log('🧪 Modo desarrollo sin configuración - Usando Ethereal');
      const testAccount = await nodemailer.createTestAccount();

      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    // Verificar configuración requerida
    if (!emailUser || !emailPass) {
      throw new Error(
        `Variables de entorno faltantes: ${[
          !emailUser && 'EMAIL_USER',
          !emailPass && 'EMAIL_PASS',
        ]
          .filter(Boolean)
          .join(', ')}`
      );
    }

    // Configuración base
    const transportConfig = {
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    };

    // Configurar según el servicio
    switch (emailService.toLowerCase()) {
      case 'gmail':
        console.log('📧 Configurando Gmail');
        return nodemailer.createTransport({
          service: 'gmail',
          ...transportConfig,
        });

      case 'outlook':
      case 'hotmail':
        console.log('📧 Configurando Outlook/Hotmail');
        return nodemailer.createTransport({
          service: 'hotmail',
          ...transportConfig,
        });

      case 'smtp':
        console.log('📧 Configurando SMTP personalizado');
        return nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: process.env.EMAIL_PORT === '465',
          ...transportConfig,
        });

      default:
        console.log('📧 Usando Gmail como fallback');
        return nodemailer.createTransport({
          service: 'gmail',
          ...transportConfig,
        });
    }
  } catch (error) {
    console.error('❌ Error creando transportador:', error);
    throw error;
  }
}

// ✅ FUNCIÓN PARA VERIFICAR CONFIGURACIÓN
export async function verifyEmailConfig() {
  try {
    console.log('🔍 Verificando configuración de email...');

    const transporter = await createEmailTransporter();

    // Verificar conexión
    const isConnected = await transporter.verify();

    if (isConnected) {
      console.log('✅ Configuración de email válida');
      return {
        success: true,
        message: 'Email configurado correctamente',
        config: {
          service: process.env.EMAIL_SERVICE || 'gmail',
          user: process.env.EMAIL_USER,
          adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
          logoUrl: getLogoUrl(), // ← INCLUIR LOGO EN RESPUESTA
        },
      };
    } else {
      throw new Error('No se pudo verificar la conexión');
    }
  } catch (error) {
    console.error('❌ Error verificando configuración:', error);

    let suggestions = [
      'Verifica que EMAIL_USER y EMAIL_PASS estén configurados en .env.local',
      'Si usas Gmail, habilita la autenticación de 2 factores y usa una contraseña de aplicación',
      'Verifica que EMAIL_SERVICE esté configurado correctamente (gmail, outlook, smtp)',
    ];

    // Sugerencias específicas según el error
    if (error.message.includes('Invalid login')) {
      suggestions = [
        'Credenciales incorrectas - verifica EMAIL_USER',
        'Si usas Gmail, necesitas una contraseña de aplicación (App Password)',
        'Activa la autenticación de 2 factores en Gmail primero',
      ];
    } else if (error.message.includes('ENOTFOUND')) {
      suggestions = [
        'Error de conexión - verifica tu internet',
        'Comprueba que EMAIL_SERVICE sea válido',
        'Verifica el firewall y configuración de red',
      ];
    }

    return {
      success: false,
      error: error.message,
      suggestions,
    };
  }
}

// ✅ FUNCIÓN PARA ENVIAR EMAILS CON RETRY
export async function sendEmailWithRetry(emailData, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `📧 Intento ${attempt}/${maxRetries} - Enviando email a: ${emailData.to}`
      );

      const transporter = await createEmailTransporter();

      const info = await transporter.sendMail({
        from: `"HAIZE" <${process.env.EMAIL_USER}>`,
        ...emailData,
      });

      // Log en desarrollo para Ethereal
      if (
        process.env.NODE_ENV === 'development' &&
        info.messageId?.includes('ethereal')
      ) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('🔗 Preview URL (Ethereal):', previewUrl);
      }

      console.log(`✅ Email enviado exitosamente:`, {
        to: emailData.to,
        subject: emailData.subject,
        messageId: info.messageId,
        attempt,
      });

      return {
        success: true,
        messageId: info.messageId,
        attempt,
        previewUrl:
          process.env.NODE_ENV === 'development' &&
          info.messageId?.includes('ethereal')
            ? nodemailer.getTestMessageUrl(info)
            : null,
      };
    } catch (error) {
      lastError = error;
      console.error(`❌ Intento ${attempt}/${maxRetries} falló:`, {
        error: error.message,
        to: emailData.to,
        subject: emailData.subject,
      });

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries) {
        const delay = 1000 * attempt; // Incrementar delay
        console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error(`❌ Email falló después de ${maxRetries} intentos:`, {
    to: emailData.to,
    subject: emailData.subject,
    finalError: lastError.message,
  });

  return {
    success: false,
    error: lastError.message,
    attempts: maxRetries,
  };
}

// ✅ FUNCIÓN PARA TESTEAR EMAIL (CON LOGO CORREGIDO)
export async function sendTestEmail(testEmail) {
  try {
    const baseUrl = getBaseUrl();
    const logoUrl = getLogoUrl(); // ← USAR LOGO LOCAL CORREGIDO

    const emailData = {
      to: testEmail,
      subject: '🧪 Test de Email - HAIZE',
      html: basicTestEmailTemplate(),
    };

    const result = await sendEmailWithRetry(emailData);

    return {
      ...result,
      testEmail,
      timestamp: new Date().toISOString(),
      logoUrl, // ← INCLUIR LOGO URL EN RESPUESTA
    };
  } catch (error) {
    console.error('❌ Error en sendTestEmail:', error);
    return {
      success: false,
      error: error.message,
      testEmail,
      timestamp: new Date().toISOString(),
    };
  }
}

// ✅ FUNCIÓN PARA LOG DE DETALLES
export function logEmailDetails(emailData, result) {
  const logData = {
    timestamp: new Date().toISOString(),
    to: emailData.to,
    subject: emailData.subject,
    success: result.success,
    messageId: result.messageId,
    attempt: result.attempt,
    error: result.error,
    environment: process.env.NODE_ENV,
  };

  if (result.success) {
    console.log('📧 ✅ Email Log:', logData);
  } else {
    console.error('📧 ❌ Email Log:', logData);
  }

  return logData;
}

// ✅ EXPORTAR FUNCIÓN HELPER PARA OTROS ARCHIVOS
export { getLogoUrl };
