import mongoose from 'mongoose';

const deliveryZoneSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  detail: { type: String, default: 'Zona de cobertura' },
  geometry: { type: { type: String, enum: ['Polygon', 'MultiPolygon'], required: true }, coordinates: { type: mongoose.Schema.Types.Mixed, required: true } },
  cutoffTime: { type: String, default: '11:00' },
  municipalityId: { type: String },
  shippingPrice: { type: Number, min: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.DeliveryZone || mongoose.model('DeliveryZone', deliveryZoneSchema);
