// lib/order-emails.js - VERSIÓN ACTUALIZADA CON MANEJO DE ERRORES MEJORADO
'use server';

import { sendEmailWithRetry } from './email-config';

// Función para obtener la URL base normalizada
function getBaseUrl() {
  const url =
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

// Función para formatear precio
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(price);
};

// Función para formatear fecha
const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date));
};

// EMAIL 1: Confirmación de orden al cliente
export async function sendOrderConfirmationToCustomer(order, user) {
  try {
    const baseUrl = getBaseUrl();
    const logoUrl =
      'https://www.haize.com.ar/_next/image?url=%2Fimages%2Flogo.jpeg&w=96&q=75';
    const orderUrl = `${baseUrl}/profile/orders/${order._id}`;

    // Generar HTML de productos
    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e5e5;">
          <div style="display: flex; align-items: center;">
            <img src="${item.imageUrl || ''}" alt="${item.title}" 
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
            <div>
              <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">${
                item.title
              }</div>
              <div style="color: #666; font-size: 14px;">Cantidad: ${
                item.quantity
              }</div>
              <div style="color: #666; font-size: 14px;">Precio: ${formatPrice(
                item.price
              )}</div>
            </div>
          </div>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e5e5; text-align: right; font-weight: 600;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>
    `
      )
      .join('');

    const statusBadge =
      order.status === 'whatsapp_pendiente'
        ? '<span style="background-color: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">WHATSAPP - PENDIENTE</span>'
        : '<span style="background-color: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">PENDIENTE</span>';

    const paymentMethodText =
      order.paymentMethod === 'whatsapp'
        ? 'WhatsApp (Pago a coordinar)'
        : 'MercadoPago';

    const emailData = {
      to: user.email,
      subject: `Confirmación de Pedido #${order._id
        .toString()
        .substring(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Pedido</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f7f7f7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <tr>
              <td style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                <img src="${logoUrl}" alt="HAIZE" width="120">
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #000000; text-align: center;">
                  ¡PEDIDO CONFIRMADO!
                </h1>
                <p style="text-align: center; color: #666; margin-bottom: 30px;">
                  Gracias por tu compra, <strong>${user.name}</strong>
                </p>
                
                <!-- Order Info -->
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 8px 0;"><strong>Número de Pedido:</strong></td>
                      <td style="padding: 8px 0; text-align: right;">#${order._id
                        .toString()
                        .substring(0, 8)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Fecha:</strong></td>
                      <td style="padding: 8px 0; text-align: right;">${formatDate(
                        order.createdAt
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Estado:</strong></td>
                      <td style="padding: 8px 0; text-align: right;">${statusBadge}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Método de Pago:</strong></td>
                      <td style="padding: 8px 0; text-align: right;">${paymentMethodText}</td>
                    </tr>
                  </table>
                </div>
                
                <!-- Items -->
                <h3 style="color: #1a1a1a; margin-bottom: 15px;">Productos Pedidos:</h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                  ${itemsHtml}
                  <tr style="background-color: #f9f9f9;">
                    <td style="padding: 20px; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                      TOTAL
                    </td>
                    <td style="padding: 20px; text-align: right; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                      ${formatPrice(order.totalAmount)}
                    </td>
                  </tr>
                </table>
                
                <!-- Shipping Info -->
                <h3 style="color: #1a1a1a; margin: 30px 0 15px 0;">Información de Envío:</h3>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                  <p style="margin: 5px 0;"><strong>Nombre:</strong> ${
                    order.shippingInfo.name
                  }</p>
                  <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${
                    order.shippingInfo.phone
                  }</p>
                  <p style="margin: 5px 0;"><strong>Dirección:</strong> ${
                    order.shippingInfo.address
                  }</p>
                  <p style="margin: 5px 0;"><strong>Ciudad:</strong> ${
                    order.shippingInfo.city
                  }</p>
                  <p style="margin: 5px 0;"><strong>Código Postal:</strong> ${
                    order.shippingInfo.postalCode
                  }</p>
                </div>
                
                ${
                  order.paymentMethod === 'whatsapp'
                    ? `
                <!-- WhatsApp Contact -->
                <div style="background-color: #dcf3f1; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
                  <h3 style="color: #047857; margin-bottom: 10px;">📱 Próximos Pasos</h3>
                  <p style="color: #065f46; margin-bottom: 20px;">
                    Nos pondremos en contacto contigo por WhatsApp para coordinar el pago y envío.
                  </p>
                  <a href="https://wa.me/5491126907696" 
                     style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Contactar por WhatsApp
                  </a>
                </div>
                `
                    : `
                <!-- Payment Pending -->
                <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
                  <h3 style="color: #92400e; margin-bottom: 10px;">💳 Completar Pago</h3>
                  <p style="color: #92400e; margin-bottom: 20px;">
                    Tu pedido está pendiente de pago. Completa tu pago para que podamos procesar tu orden.
                  </p>
                  <a href="${orderUrl}" 
                     style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Ver Pedido
                  </a>
                </div>
                `
                }
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #f7f7f7; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #999;">
                  © ${new Date().getFullYear()} HAIZE. Todos los derechos reservados.
                </p>
                <a href="https://www.instagram.com/haize" style="margin: 0 10px;">
                  <img src="https://i.ibb.co/NNwdYSF/instagram-icon.png" alt="Instagram" width="20" height="20">
                </a>
                <p style="margin: 20px 0 0 0; font-size: 12px; color: #999;">
                  ¿Preguntas? Contactanos en <a href="mailto:patagoniascript@gmail.com" style="color: #000;">patagoniascript@gmail.com</a>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    return await sendEmailWithRetry(emailData);
  } catch (error) {
    console.error('❌ Error enviando confirmación de orden al cliente:', error);
    return { success: false, error: error.message };
  }
}

// EMAIL 2: Notificación de nueva orden al administrador
export async function sendNewOrderNotificationToAdmin(order, user) {
  try {
    const baseUrl = getBaseUrl();
    const adminOrderUrl = `${baseUrl}/admin/orders/${order._id}`;

    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">
          ${item.title} (x${item.quantity})
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: right;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>
    `
      )
      .join('');

    const emailData = {
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🛒 Nueva Orden #${order._id
        .toString()
        .substring(0, 8)} - ${formatPrice(order.totalAmount)}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nueva Orden</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #1f2937; color: white;">
                <h1 style="margin: 0; font-size: 24px;">🛒 NUEVA ORDEN RECIBIDA</h1>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 30px;">
                <div style="background-color: #3b82f6; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="margin: 0; text-align: center;">Orden #${order._id
                    .toString()
                    .substring(0, 8)}</h2>
                </div>
                
                <h3>📋 Información del Cliente:</h3>
                <table width="100%" style="margin-bottom: 20px;">
                  <tr><td><strong>Nombre:</strong></td><td>${
                    user.name
                  }</td></tr>
                  <tr><td><strong>Email:</strong></td><td>${
                    user.email
                  }</td></tr>
                  <tr><td><strong>Teléfono:</strong></td><td>${
                    order.shippingInfo.phone
                  }</td></tr>
                </table>
                
                <h3>📦 Información de Envío:</h3>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p><strong>Dirección:</strong> ${
                    order.shippingInfo.address
                  }</p>
                  <p><strong>Ciudad:</strong> ${order.shippingInfo.city}</p>
                  <p><strong>Código Postal:</strong> ${
                    order.shippingInfo.postalCode
                  }</p>
                </div>
                
                <h3>🛍️ Productos:</h3>
                <table width="100%" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                  ${itemsHtml}
                  <tr style="background-color: #1f2937; color: white;">
                    <td style="padding: 15px; font-weight: 600;">TOTAL</td>
                    <td style="padding: 15px; text-align: right; font-weight: 600;">${formatPrice(
                      order.totalAmount
                    )}</td>
                  </tr>
                </table>
                
                <h3>💳 Método de Pago:</h3>
                <p><strong>${
                  order.paymentMethod === 'whatsapp'
                    ? 'WhatsApp (Pago a coordinar)'
                    : 'MercadoPago'
                }</strong></p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${adminOrderUrl}" 
                     style="display: inline-block; background-color: #1f2937; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    VER ORDEN EN ADMIN
                  </a>
                </div>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
                  <p style="margin: 0; color: #92400e;">
                    <strong>⏰ Acción requerida:</strong> 
                    ${
                      order.paymentMethod === 'whatsapp'
                        ? 'Contactar al cliente por WhatsApp para coordinar pago y envío.'
                        : 'Confirmar pago y procesar envío una vez que se complete el pago.'
                    }
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    return await sendEmailWithRetry(emailData);
  } catch (error) {
    console.error(
      '❌ Error enviando notificación de nueva orden al admin:',
      error
    );
    return { success: false, error: error.message };
  }
}

// EMAIL 3: Confirmación de pago exitoso al cliente
export async function sendPaymentConfirmationToCustomer(
  order,
  user,
  paymentDetails = null
) {
  try {
    const baseUrl = getBaseUrl();
    const logoUrl =
      'https://www.www.haize.com.ar/_next/image?url=%2Fimages%2Flogo.jpeg&w=96&q=75';
    const orderUrl = `${baseUrl}/profile/orders/${order._id}`;

    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e5e5;">
          <div style="display: flex; align-items: center;">
            <img src="${item.imageUrl || ''}" alt="${item.title}" 
                 style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; margin-right: 12px;">
            <div>
              <div style="font-weight: 600; color: #1a1a1a;">${item.title}</div>
              <div style="color: #666; font-size: 14px;">Cantidad: ${
                item.quantity
              }</div>
            </div>
          </div>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #e5e5e5; text-align: right; font-weight: 600;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>
    `
      )
      .join('');

    const emailData = {
      to: user.email,
      subject: `✅ Pago Confirmado - Pedido #${order._id
        .toString()
        .substring(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pago Confirmado</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <tr>
              <td style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                <img src="${logoUrl}" alt="HAIZE Logo" width="120">
              </td>
            </tr>
            
            <tr>
              <td style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span style="color: white; font-size: 40px;">✓</span>
                  </div>
                  <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 600; color: #10b981;">
                    ¡PAGO CONFIRMADO!
                  </h1>
                  <p style="color: #666; margin: 0;">
                    Hola <strong>${
                      user.name
                    }</strong>, tu pago ha sido procesado exitosamente
                  </p>
                </div>
                
                <!-- Payment Info -->
                <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #10b981;">
                  <h3 style="color: #047857; margin: 0 0 15px 0;">💳 Información del Pago</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 5px 0;"><strong>Orden:</strong></td>
                      <td style="padding: 5px 0; text-align: right;">#${order._id
                        .toString()
                        .substring(0, 8)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0;"><strong>Monto Pagado:</strong></td>
                      <td style="padding: 5px 0; text-align: right; font-weight: 600; color: #10b981;">${formatPrice(
                        order.totalAmount
                      )}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0;"><strong>Fecha de Pago:</strong></td>
                      <td style="padding: 5px 0; text-align: right;">${formatDate(
                        new Date()
                      )}</td>
                    </tr>
                    ${
                      paymentDetails?.id
                        ? `
                    <tr>
                      <td style="padding: 5px 0;"><strong>ID de Pago:</strong></td>
                      <td style="padding: 5px 0; text-align: right; font-family: monospace;">${paymentDetails.id}</td>
                    </tr>
                    `
                        : ''
                    }
                  </table>
                </div>
                
                <!-- Items -->
                <h3 style="color: #1a1a1a; margin-bottom: 15px;">📦 Productos Pagados:</h3>
                <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
                  ${itemsHtml}
                  <tr style="background-color: #f9f9f9;">
                    <td style="padding: 20px; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                      TOTAL PAGADO
                    </td>
                    <td style="padding: 20px; text-align: right; font-size: 18px; font-weight: 600; color: #10b981;">
                      ${formatPrice(order.totalAmount)}
                    </td>
                  </tr>
                </table>
                
                <!-- Next Steps -->
                <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                  <h3 style="color: #1e40af; margin: 0 0 15px 0;">📋 Próximos Pasos</h3>
                  <ul style="color: #1e3a8a; margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Nos pondremos en contacto contigo para coordinar el envío</li>
                    <li style="margin-bottom: 8px;">Recibirás una notificación cuando tu pedido sea enviado</li>
                    <li style="margin-bottom: 8px;">Puedes seguir el estado de tu pedido en cualquier momento</li>
                  </ul>
                </div>
                
                <!-- Action Buttons -->
                <div style="text-align: center;">
                  <a href="${orderUrl}" 
                     style="display: inline-block; background-color: #000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-right: 10px;">
                    Ver Mi Pedido
                  </a>
                  <a href="https://wa.me/5491126907696" 
                     style="display: inline-block; background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Contactar por WhatsApp
                  </a>
                </div>
                
                <!-- Shipping Info -->
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                  <h3 style="color: #1a1a1a; margin-bottom: 10px;">🚚 Dirección de Envío:</h3>
                  <p style="color: #666; margin: 5px 0;">${
                    order.shippingInfo.name
                  }</p>
                  <p style="color: #666; margin: 5px 0;">${
                    order.shippingInfo.address
                  }</p>
                  <p style="color: #666; margin: 5px 0;">${
                    order.shippingInfo.city
                  }, ${order.shippingInfo.postalCode}</p>
                  <p style="color: #666; margin: 5px 0;">Tel: ${
                    order.shippingInfo.phone
                  }</p>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #f7f7f7; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0 0 15px 0; color: #10b981; font-weight: 600;">¡Gracias por confiar en HAIZE!</p>
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #999;">
                  © ${new Date().getFullYear()} HAIZE. Todos los derechos reservados.
                </p>
                <a href="https://www.instagram.com/patagonia_script" style="margin: 0 10px;">
                  <img src="https://i.ibb.co/NNwdYSF/instagram-icon.png" alt="Instagram" width="20" height="20">
                </a>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    return await sendEmailWithRetry(emailData);
  } catch (error) {
    console.error('❌ Error enviando confirmación de pago al cliente:', error);
    return { success: false, error: error.message };
  }
}

// EMAIL 4: Notificación de pago exitoso al administrador
export async function sendPaymentNotificationToAdmin(
  order,
  user,
  paymentDetails = null
) {
  try {
    const baseUrl = getBaseUrl();
    const adminOrderUrl = `${baseUrl}/admin/orders/${order._id}`;

    const emailData = {
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `💰 Pago Recibido - Orden #${order._id
        .toString()
        .substring(0, 8)} - ${formatPrice(order.totalAmount)}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pago Recibido</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <tr>
              <td style="padding: 30px; text-align: center; background-color: #10b981; color: white;">
                <h1 style="margin: 0; font-size: 24px;">💰 PAGO RECIBIDO</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: 600;">${formatPrice(
                  order.totalAmount
                )}</p>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 30px;">
                <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                  <h2 style="margin: 0; color: #047857;">✅ Orden #${order._id
                    .toString()
                    .substring(0, 8)} - PAGADA</h2>
                </div>
                
                <h3>💳 Información del Pago:</h3>
                <table width="100%" style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <tr><td><strong>Monto:</strong></td><td style="text-align: right; color: #10b981; font-weight: 600;">${formatPrice(
                    order.totalAmount
                  )}</td></tr>
                  <tr><td><strong>Fecha:</strong></td><td style="text-align: right;">${formatDate(
                    new Date()
                  )}</td></tr>
                  ${
                    paymentDetails?.id
                      ? `<tr><td><strong>ID de Pago:</strong></td><td style="text-align: right; font-family: monospace;">${paymentDetails.id}</td></tr>`
                      : ''
                  }
                  ${
                    paymentDetails?.payment_method_id
                      ? `<tr><td><strong>Método:</strong></td><td style="text-align: right;">${paymentDetails.payment_method_id}</td></tr>`
                      : ''
                  }
                </table>
                
                <h3>👤 Cliente:</h3>
                <table width="100%" style="margin-bottom: 20px;">
                  <tr><td><strong>Nombre:</strong></td><td>${
                    user.name
                  }</td></tr>
                  <tr><td><strong>Email:</strong></td><td>${
                    user.email
                  }</td></tr>
                  <tr><td><strong>Teléfono:</strong></td><td>${
                    order.shippingInfo.phone
                  }</td></tr>
                </table>
                
                <h3>📦 Dirección de Envío:</h3>
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0;"><strong>${
                    order.shippingInfo.name
                  }</strong></p>
                  <p style="margin: 5px 0;">${order.shippingInfo.address}</p>
                  <p style="margin: 5px 0;">${order.shippingInfo.city}, ${
        order.shippingInfo.postalCode
      }</p>
                  <p style="margin: 5px 0;">Tel: ${order.shippingInfo.phone}</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${adminOrderUrl}" 
                     style="display: inline-block; background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    VER ORDEN Y PROCESAR ENVÍO
                  </a>
                </div>
                
                <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin-top: 20px;">
                  <p style="margin: 0; color: #047857;">
                    <strong>✅ Acción requerida:</strong> El pago ha sido confirmado. Procesa el envío de la orden.
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    return await sendEmailWithRetry(emailData);
  } catch (error) {
    console.error('❌ Error enviando notificación de pago al admin:', error);
    return { success: false, error: error.message };
  }
}

// EMAIL 5: Función para reenviar emails existentes
export async function resendEmails(
  order,
  user,
  emailTypes = ['customer', 'admin']
) {
  try {
    const results = [];

    if (emailTypes.includes('customer')) {
      const customerResult = await sendOrderConfirmationToCustomer(order, user);
      results.push({
        type: 'customer_order',
        success: customerResult.success,
        messageId: customerResult.messageId,
        error: customerResult.error,
        to: user.email,
      });
    }

    if (emailTypes.includes('admin')) {
      const adminResult = await sendNewOrderNotificationToAdmin(order, user);
      results.push({
        type: 'admin_order',
        success: adminResult.success,
        messageId: adminResult.messageId,
        error: adminResult.error,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      });
    }

    return {
      success: results.every((r) => r.success),
      results,
      orderData: {
        orderId: order._id,
        userEmail: user.email,
        status: order.status,
        emailTypes: emailTypes,
      },
    };
  } catch (error) {
    console.error('❌ Error general reenviando emails:', error);
    return {
      success: false,
      error: error.message,
      results: [],
    };
  }
}

// Función combinada para enviar emails de pago confirmado
export async function sendPaymentConfirmedEmails(order, user, paymentDetails) {
  try {
    const customerResult = await sendPaymentConfirmationToCustomer(
      order,
      user,
      paymentDetails
    );
    const adminResult = await sendPaymentNotificationToAdmin(
      order,
      user,
      paymentDetails
    );

    return {
      success: customerResult.success && adminResult.success,
      customerResult,
      adminResult,
      orderId: order._id,
    };
  } catch (error) {
    console.error('❌ Error enviando emails de pago confirmado:', error);
    return {
      success: false,
      error: error.message,
      orderId: order._id,
    };
  }
}
