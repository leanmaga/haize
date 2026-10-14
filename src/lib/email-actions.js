// =============================================================================
// ARCHIVO: src/lib/email-actions.js
// ACTUALIZADO PARA USAR CONFIGURACIÓN UNIFICADA
// =============================================================================

'use server';

import { accountEmailTemplate } from './message-email-templates';
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
      html: accountEmailTemplate(verificationUrl),
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
      html: accountEmailTemplate(resetUrl, true),
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
