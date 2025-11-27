// Configuración de contacto de HAIZE
// Actualizar estos valores con tus datos reales

import { socialMediaConfig } from './socialMediaConfig';

export const contactConfig = {
  // WhatsApp
  whatsapp: {
    number: '5491112345678', // Formato: código país + código área + número (sin espacios, guiones ni +)
    defaultMessage: '¡Hola! Me gustaría hacer una consulta sobre HAIZE.',
  },

  // Email
  email: 'info@haize.com.ar',

  // Redes Sociales (importadas desde socialMediaConfig)
  socialMedia: socialMediaConfig,

  // Horarios de atención (opcional)
  businessHours: {
    weekdays: 'Lunes a Viernes: 10:00 - 19:00',
    saturday: 'Sábados: 10:00 - 14:00',
    sunday: 'Domingos: Cerrado',
  },
};

// Helper function para abrir WhatsApp
export const openWhatsApp = (customMessage) => {
  const message = encodeURIComponent(
    customMessage || contactConfig.whatsapp.defaultMessage
  );
  window.open(
    `https://wa.me/${contactConfig.whatsapp.number}?text=${message}`,
    '_blank'
  );
};

// Helper function para copiar email
export const copyEmailToClipboard = () => {
  return navigator.clipboard.writeText(contactConfig.email);
};
