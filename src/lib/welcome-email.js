import Coupon from '@/models/Coupon';
import WelcomeEmail from '@/models/WelcomeEmail';
import { sendEmailWithRetry } from '@/lib/email-config';
import { emailLayout, emailButton, emailBaseUrl, escapeHtml } from '@/lib/email-design';

export const WELCOME_CODE = 'HAIZE10';

export async function ensureWelcomeCoupon() {
  let coupon;
  try {
    coupon = await Coupon.findOneAndUpdate({ code: WELCOME_CODE }, {
      $setOnInsert: {
        code: WELCOME_CODE, description: 'Bienvenida: 10% de descuento, un uso por cuenta',
        discountType: 'percentage', discountValue: 10, minimumPurchase: 0,
        usageType: 'reusable', usageLimit: null, oncePerUser: true,
        expirationType: 'manual', isActive: true, systemCreated: true,
      },
    }, { upsert: true, new: true, runValidators: true });
  } catch (error) {
    if (error.code !== 11000) throw error;
    coupon = await Coupon.findByCode(WELCOME_CODE);
  }
  // Never overwrite an existing coupon or reset its redemption history.
  if (!coupon || coupon.discountType !== 'percentage' || coupon.discountValue !== 10 ||
      !coupon.oncePerUser || coupon.usageType !== 'reusable' ||
      coupon.usageLimit !== null || coupon.minimumPurchase !== 0 ||
      coupon.expirationType !== 'manual' || !coupon.isActive) {
    throw new Error('HAIZE10 ya existe con otra configuración o está desactivado');
  }
  return coupon;
}

export function welcomeEmailHtml(name = '') {
  return emailLayout('Bienvenido a HAIZE', `
    <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;color:#666;text-transform:uppercase">Tu primera elección, con un beneficio</p>
    <h1 style="margin:0 0 20px;font-size:30px;line-height:1.2;text-transform:uppercase">Bienvenido a HAIZE</h1>
    <p>${name ? `Hola ${escapeHtml(name)}. ` : ''}Gracias por sumarte. Tenés un 10% de descuento para elegir tus próximos favoritos.</p>
    <div style="margin:28px 0;padding:28px 16px;border:1px solid #111;text-align:center">
      <p style="margin:0;font-size:48px;font-weight:700;line-height:1.2">10% OFF</p>
      <p style="margin:16px 0 6px;font-size:12px;color:#555">Ingresá este código en tu carrito</p>
      <p style="margin:0;font-size:26px;letter-spacing:4px;font-weight:700">HAIZE10</p>
    </div>
    ${emailButton('Descubrir la colección', emailBaseUrl())}
    <p style="font-size:12px;color:#666;text-align:center">Un uso por cuenta. El descuento se aplica a los productos, no al envío. Creá tu cuenta o iniciá sesión para usarlo.</p>
  `, 'Tu bienvenida tiene un 10% OFF. Usá HAIZE10.');
}

// Call after connecting to MongoDB. A failed delivery remains retryable.
export async function sendWelcomeEmail(email, name = '') {
  const identity = String(email).trim().toLowerCase();
  let claim;
  try {
    await ensureWelcomeCoupon();
    try {
      await WelcomeEmail.updateOne({ _id: identity }, { $setOnInsert: { _id: identity } }, { upsert: true });
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
    claim = await WelcomeEmail.findOneAndUpdate({
      _id: identity, sentAt: null,
      $or: [{ sendingAt: null }, { sendingAt: { $lt: new Date(Date.now() - 10 * 60 * 1000) } }],
    }, { $set: { sendingAt: new Date() } }, { new: true });
    if (!claim) return { success: true, skipped: true };
    const result = await sendEmailWithRetry({
      to: identity, subject: 'Bienvenido a HAIZE · Tu 10% OFF', html: welcomeEmailHtml(name),
    });
    if (!result.success) throw new Error(result.error || 'No se pudo enviar la bienvenida');
    await WelcomeEmail.updateOne({ _id: identity, sendingAt: claim.sendingAt }, {
      $set: { sentAt: new Date() }, $unset: { sendingAt: 1 },
    });
    return { success: true };
  } catch (error) {
    if (claim) await WelcomeEmail.updateOne({ _id: identity, sendingAt: claim.sendingAt }, { $unset: { sendingAt: 1 } }).catch(() => {});
    console.error('Error al enviar bienvenida HAIZE10:', error.message);
    return { success: false };
  }
}
