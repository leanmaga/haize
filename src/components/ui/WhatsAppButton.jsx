// components/ui/WhatsAppButton.jsx
'use client';

import { useCartStore } from '@/lib/store';
import { FaWhatsapp } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import {
  sendOrderConfirmationToCustomer,
  sendNewOrderNotificationToAdmin,
} from '@/lib/order-emails';

export default function WhatsAppButton({
  userData,
  isDisabled,
  handleBeforeSubmit,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const { items, getTotal, getTotalWithDiscount, getDiscountInfo, clearCart } =
    useCartStore();

  const router = useRouter();

  const subtotal = getTotal();
  const total = getTotalWithDiscount();
  const discountInfo = getDiscountInfo();

  const handleWhatsAppOrder = async () => {
    if (handleBeforeSubmit && !handleBeforeSubmit()) {
      return;
    }

    if (!session) {
      toast.error('Debes iniciar sesión para realizar un pedido');
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    if (
      !userData?.name ||
      !userData?.email ||
      !userData?.phone ||
      !userData?.address ||
      !userData?.city ||
      !userData?.postalCode
    ) {
      toast.error('Por favor completa todos los datos de envío');
      return;
    }

    setIsLoading(true);

    try {
      const orderId = `whatsapp_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;

      const orderItems = items.map((item) => ({
        product: item.id,
        title: item.name || item.title,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.image || '',
        size: item.variant?.size || undefined,
        color: item.variant?.color || undefined,
      }));

      const orderData = {
        items: orderItems,
        subtotal: subtotal,
        discountAmount: discountInfo ? discountInfo.amount : 0,
        totalAmount: total,
        appliedCoupon: discountInfo
          ? {
              code: discountInfo.code,
              discountAmount: discountInfo.amount,
            }
          : null,
        paymentMethod: 'whatsapp',
        shippingInfo: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          postalCode: userData.postalCode,
        },
        status: 'whatsapp_pendiente',
        whatsappOrder: true,
        idempotencyKey: orderId,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el pedido');
      }

      const result = await response.json();

      // Enviar emails
      try {
        const orderForEmail = {
          _id: result.orderId,
          items: orderItems,
          subtotal: subtotal,
          discountAmount: discountInfo ? discountInfo.amount : 0,
          totalAmount: total,
          status: 'whatsapp_pendiente',
          paymentMethod: 'whatsapp',
          shippingInfo: orderData.shippingInfo,
          appliedCoupon: orderData.appliedCoupon,
          createdAt: new Date(),
          whatsappOrder: true,
        };

        const userForEmail = {
          _id: session.user?.id || session.user?.email,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        };

        const customerEmailResult = await sendOrderConfirmationToCustomer(
          orderForEmail,
          userForEmail,
        );

        const adminEmailResult = await sendNewOrderNotificationToAdmin(
          orderForEmail,
          userForEmail,
        );

        if (customerEmailResult.success && adminEmailResult.success) {
          toast.success('📧 Emails de confirmación enviados');
        } else if (customerEmailResult.success || adminEmailResult.success) {
          toast('📧 Algunos emails enviados', { icon: '⚠️' });
        }
      } catch (emailError) {
        console.error('❌ Error enviando emails de WhatsApp:', emailError);
      }

      // Guardar datos del pedido en localStorage
      localStorage.setItem(
        `whatsapp_order_${orderId}`,
        JSON.stringify({
          items,
          subtotal,
          discountAmount: discountInfo ? discountInfo.amount : 0,
          total,
          appliedCoupon: discountInfo,
          userData,
          timestamp: new Date().toISOString(),
          dbOrderId: result.orderId,
        }),
      );

      // ✅ CREAR MENSAJE DE WHATSAPP CON VARIANTES CORRECTAS
      const phoneNumber = '5491126205030';

      let message =
        '¡Hola! Quiero hacer un pedido con los siguientes productos:\n\n';

      items.forEach((item) => {
        message += `• ${item.name || item.title} x ${item.quantity} - $${(
          item.price * item.quantity
        ).toFixed(2)}\n`;

        // ✅ MOSTRAR SIZE Y COLOR CORRECTAMENTE
        if (item.variant) {
          const variantParts = [];

          if (item.variant.size) {
            variantParts.push(`Talle: ${item.variant.size}`);
          }

          if (item.variant.color) {
            variantParts.push(`Color: ${item.variant.color}`);
          }

          if (variantParts.length > 0) {
            message += `  - ${variantParts.join(' | ')}\n`;
          }
        }
      });

      message += `\n*Subtotal: $${subtotal.toFixed(2)}*`;

      if (discountInfo) {
        message += `\n*Descuento (${discountInfo.code}): -$${discountInfo.amount.toFixed(2)}*`;
      }

      message += `\n*Total: $${total.toFixed(2)}*`;

      message += '\n\n*Datos de contacto:*';
      message += `\nNombre: ${userData.name}`;
      message += `\nEmail: ${userData.email}`;
      message += `\nTeléfono: ${userData.phone}`;
      message += `\nDirección: ${userData.address}`;
      message += `\nCiudad: ${userData.city}`;
      message += `\nCódigo Postal: ${userData.postalCode}`;

      const orderUrl = `${window.location.origin}/order-summary/${orderId}`;
      message += `\n\n*Ver resumen con imágenes:*\n${orderUrl}`;

      message += `\n\n*Número de pedido:* #${result.orderId.substring(0, 8)}`;
      message +=
        '\n\nPor favor, confirma disponibilidad y costos de envío. ¡Gracias!';

      const encodedMessage = encodeURIComponent(message);
      const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      clearCart();

      // Abrir WhatsApp
      window.location.href = whatsappLink;

      toast.success('¡Abriendo WhatsApp...');
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      toast.error('No se pudo procesar el pedido: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleWhatsAppOrder}
      className="w-full bg-green-500 text-white py-3 flex items-center justify-center rounded-md hover:bg-green-600 transition-colors"
      disabled={isLoading || isDisabled || items.length === 0}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
          <span>Procesando...</span>
        </>
      ) : (
        <>
          <FaWhatsapp className="h-5 w-5 mr-2" />
          <span>
            Pedir por WhatsApp - ${total.toFixed(2)}
            {discountInfo && (
              <span className="text-xs ml-1">
                (¡${discountInfo.amount.toFixed(2)} OFF!)
              </span>
            )}
          </span>
        </>
      )}
    </button>
  );
}
