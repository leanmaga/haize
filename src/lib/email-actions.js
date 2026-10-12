// =============================================================================
// ARCHIVO: src/lib/email-actions.js
// ACTUALIZADO PARA USAR CONFIGURACIÓN UNIFICADA
// =============================================================================

'use server';

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectDB from './db';
import { sendEmailWithRetry } from './email-config';

// Función para obtener la URL base normalizada
function getBaseUrl() {
  const url = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

// ✅ ENVIAR EMAIL DE VERIFICACIÓN
export async function sendVerificationEmail(email) {
  try {
    console.log('📧 Iniciando envío de email de verificación para:', email);

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (user.isVerified) {
      return { success: false, error: 'Este correo ya está verificado' };
    }

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    // Actualizar el usuario con el token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    const verificationUrl = `${getBaseUrl()}/auth/verify-email?token=${verificationToken}`;

    const emailData = {
      to: user.email,
      subject: 'Verifica tu cuenta en HAIZE',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verificación de Cuenta</title>
          <style>
            body { margin: 0; padding: 0; font-family: 'Nexa', 'Sora', Arial, sans-serif; color: #1a1a1a; background-color: #f7f7f7; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse; }
            .header { padding: 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 15px 45px; border-radius: 2px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .footer { padding: 30px; text-align: center; background-color: #f7f7f7; border-top: 1px solid #e5e5e5; }
          </style>
        <style>@font-face{font-family:Nexa;src:url('https://www.haize.com.ar/fonts/Nexa/NexaRegular.otf') format('opentype');font-weight:400}@font-face{font-family:Nexa;src:url('https://www.haize.com.ar/fonts/Nexa/NexaBold.otf') format('opentype');font-weight:700}</style></head>
        <body>
          <table class="container" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="header" style="background:#000000;color:#ffffff">
                <span style="font-family:Nexa,Sora,Arial,sans-serif;font-size:36px;letter-spacing:4px;font-weight:700;color:#ffffff">HAIZE</span>
              </td>
            </tr>
            <tr>
              <td class="content">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 1px; text-align: center;">VERIFICA TU CUENTA</h1>
                <p style="text-align: center; color: #666666; font-size: 16px; line-height: 24px;">¡Gracias por registrarte en HAIZE! Para completar tu registro, por favor verifica tu dirección de correo electrónico.</p>
                <p style="text-align: center; color: #666666; font-size: 16px; line-height: 24px;">Haz clic en el botón para verificar tu cuenta:</p>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button" style="display:inline-block;background:#000000;color:#ffffff;padding:16px 28px;text-decoration:none;font-family:Nexa,Sora,Arial,sans-serif;font-weight:700;letter-spacing:1px;border-radius:2px">VERIFICAR CUENTA</a>
                </div>
                <p style="text-align: center; color: #666666; font-size: 14px; line-height: 20px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #999999; text-align: center;">${verificationUrl}</p>
                <p style="text-align: center; color: #666666; font-size: 14px; line-height: 20px;">Este enlace expirará en 24 horas por razones de seguridad.</p>
              </td>
            </tr>
            <tr>
              <td class="footer">
                <p style="margin: 0; font-size: 14px; color: #999999;">© ${new Date().getFullYear()} HAIZE. Todos los derechos reservados.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // Usar la función unificada de envío
    const result = await sendEmailWithRetry(emailData);

    if (result.success) {
      console.log('✅ Email de verificación enviado exitosamente:', {
        email: user.email,
        messageId: result.messageId,
      });
    } else {
      console.error('❌ Error enviando email de verificación:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error en sendVerificationEmail:', error);
    return { success: false, error: error.message };
  }
}

// ✅ ENVIAR EMAIL DE RESTABLECIMIENTO DE CONTRASEÑA
export async function sendPasswordResetEmail(email) {
  try {
    console.log('📧 Iniciando envío de email de reset para:', email);

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      // Por seguridad, no revelar si el email existe
      return {
        success: true,
        message: 'Si el correo existe, se ha enviado un enlace de recuperación',
      };
    }

    if (user.googleAuth && !user.password) {
      return {
        success: false,
        error:
          'Esta cuenta usa Google para iniciar sesión, no se puede restablecer la contraseña',
      };
    }

    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

    // Actualizar el usuario con el token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    const resetUrl = `${getBaseUrl()}/auth/reset-password/${resetToken}`;

    const emailData = {
      to: user.email,
      subject: 'Restablece tu contraseña',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablecer Contraseña</title>
          <style>
            body { margin: 0; padding: 0; font-family: 'Nexa', 'Sora', Arial, sans-serif; color: #1a1a1a; background-color: #f7f7f7; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse; }
            .header { padding: 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 15px 45px; border-radius: 2px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .footer { padding: 30px; text-align: center; background-color: #f7f7f7; border-top: 1px solid #e5e5e5; }
          </style>
        <style>@font-face{font-family:Nexa;src:url('https://www.haize.com.ar/fonts/Nexa/NexaRegular.otf') format('opentype');font-weight:400}@font-face{font-family:Nexa;src:url('https://www.haize.com.ar/fonts/Nexa/NexaBold.otf') format('opentype');font-weight:700}</style></head>
        <body>
          <table class="container" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="header" style="background:#000000;color:#ffffff">
                <span style="font-family:Nexa,Sora,Arial,sans-serif;font-size:36px;letter-spacing:4px;font-weight:700;color:#ffffff">HAIZE</span>
              </td>
            </tr>
            <tr>
              <td class="content">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 1px; text-align: center;">RESTABLECER CONTRASEÑA</h1>
                <p style="text-align: center; color: #666666; font-size: 16px; line-height: 24px;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no has realizado esta solicitud, puedes ignorar este mensaje.</p>
                <p style="text-align: center; color: #666666; font-size: 16px; line-height: 24px;">Haz clic en el botón para crear una nueva contraseña:</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button" style="display:inline-block;background:#000000;color:#ffffff;padding:16px 28px;text-decoration:none;font-family:Nexa,Sora,Arial,sans-serif;font-weight:700;letter-spacing:1px;border-radius:2px">RESTABLECER</a>
                </div>
                <p style="text-align: center; color: #666666; font-size: 14px; line-height: 20px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #999999; text-align: center;">${resetUrl}</p>
                <p style="text-align: center; color: #666666; font-size: 14px; line-height: 20px;">Este enlace expirará en 1 hora por razones de seguridad.</p>
              </td>
            </tr>
            <tr>
              <td class="footer">
                <p style="margin: 0; font-size: 14px; color: #999999;">© ${new Date().getFullYear()} HAIZE. Todos los derechos reservados.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // Usar la función unificada de envío
    const result = await sendEmailWithRetry(emailData);

    if (result.success) {
      console.log('✅ Email de reset enviado exitosamente:', {
        email: user.email,
        messageId: result.messageId,
      });
    } else {
      console.error('❌ Error enviando email de reset:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Error en sendPasswordResetEmail:', error);
    return { success: false, error: error.message };
  }
}

// ✅ VERIFICAR TOKEN DE EMAIL
export async function verifyEmailToken(token) {
  try {
    console.log(
      '🔍 Verificando token de email:',
      token?.substring(0, 8) + '...'
    );

    await connectDB();

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return {
        success: false,
        error: 'Token de verificación inválido o expirado',
      };
    }

    // Actualizar el usuario como verificado
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log('✅ Email verificado exitosamente:', user.email);

    return { success: true, email: user.email };
  } catch (error) {
    console.error('❌ Error verificando email:', error);
    return { success: false, error: error.message };
  }
}

// ✅ RESTABLECER CONTRASEÑA CON TOKEN
export async function resetPasswordWithToken(token, password) {
  try {
    console.log(
      '🔐 Restableciendo contraseña con token:',
      token?.substring(0, 8) + '...'
    );

    if (!token || !password) {
      return {
        success: false,
        error: 'Token y nueva contraseña son requeridos',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres',
      };
    }

    await connectDB();

    // Buscar usuario con el token proporcionado y no expirado
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return { success: false, error: 'Token inválido o expirado' };
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Actualizar la contraseña y eliminar el token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('✅ Contraseña restablecida exitosamente para:', user.email);

    return { success: true };
  } catch (error) {
    console.error('❌ Error restableciendo contraseña:', error);
    return { success: false, error: error.message };
  }
}
