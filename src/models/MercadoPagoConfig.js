import mongoose from 'mongoose';
import { decryptToken, encryptToken, isEncryptedToken } from '@/lib/mercadopago-token-crypto';

const tokenFields = ['accessToken', 'refreshToken'];
const mercadoPagoConfigSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    publicKey: { type: String },
    userIdMP: { type: String },
    isProduction: { type: Boolean, default: true },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

mercadoPagoConfigSchema.pre('save', function () {
  for (const field of tokenFields) {
    if (this[field]) this[field] = encryptToken(this[field]);
  }
});

// OAuth uses findOneAndUpdate, which does not execute document save hooks.
for (const operation of ['findOneAndUpdate', 'updateOne', 'updateMany', 'replaceOne', 'findOneAndReplace']) {
  mercadoPagoConfigSchema.pre(operation, function () {
    const update = this.getUpdate();
    if (Array.isArray(update)) throw new Error('Token update pipelines are not supported');
    for (const values of [update, update?.$set, update?.$setOnInsert]) {
      for (const field of tokenFields) {
        if (values?.[field]) values[field] = encryptToken(values[field]);
      }
    }
  });
}

mercadoPagoConfigSchema.methods.getDecryptedAccessToken = function () {
  return decryptToken(this.accessToken);
};

mercadoPagoConfigSchema.methods.getDecryptedRefreshToken = function () {
  return decryptToken(this.refreshToken);
};

mercadoPagoConfigSchema.statics.getActiveConfig = async function () {
  const config = await this.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!config) return null;
  const legacyFields = tokenFields.filter((field) => config[field] && !isEncryptedToken(config[field]));
  if (!legacyFields.length) return config;

  // Keep existing connections usable until the stable encryption key is configured.
  if (!process.env.ENCRYPTION_KEY) {
    console.warn('Mercado Pago: ENCRYPTION_KEY pendiente; tokens heredados aún sin migrar');
    return config;
  }

  // Compare-and-swap prevents a concurrent OAuth reconnect from being overwritten.
  const filter = { _id: config._id, isActive: true };
  const encrypted = {};
  for (const field of legacyFields) {
    filter[field] = config[field];
    encrypted[field] = encryptToken(config[field]);
  }
  const migrated = await this.findOneAndUpdate(filter, { $set: encrypted }, { new: true });
  if (migrated) return migrated;
  return this.findOne({ isActive: true }).sort({ createdAt: -1 });
};

export default mongoose.models.MercadoPagoConfig || mongoose.model('MercadoPagoConfig', mercadoPagoConfigSchema);
