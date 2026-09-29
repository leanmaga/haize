import mongoose from 'mongoose';

// Hace idempotente el webhook: Mercado Libre puede reenviar una notificación.
const mercadoLibreSaleSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.models.MercadoLibreSale ||
  mongoose.model('MercadoLibreSale', mercadoLibreSaleSchema);
