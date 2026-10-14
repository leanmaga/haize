import mongoose from 'mongoose';

const mercadoLibreConfigSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    sellerId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

mercadoLibreConfigSchema.index({ isActive: 1 });

export default mongoose.models.MercadoLibreConfig ||
  mongoose.model('MercadoLibreConfig', mercadoLibreConfigSchema);
