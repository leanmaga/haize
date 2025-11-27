// models/Newsletter.js
import mongoose from 'mongoose';

const NewsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingresa un email válido',
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'unsubscribed'],
      default: 'pending',
    },
    confirmationToken: {
      type: String,
      required: true,
    },
    discountCode: {
      type: String,
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      default: 'footer',
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas rápidas
NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ status: 1 });
NewsletterSchema.index({ confirmationToken: 1 });

// Método para generar código de descuento
NewsletterSchema.methods.generateDiscountCode = function () {
  // Genera un código único como "HAIZE10-XXXX"
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HAIZE10-${randomSuffix}`;
};

export default mongoose.models.Newsletter ||
  mongoose.model('Newsletter', NewsletterSchema);
