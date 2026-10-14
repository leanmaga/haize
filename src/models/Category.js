import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  slug: { type: String, required: true, unique: true, trim: true },
}, { timestamps: true });
export default mongoose.models.Category || mongoose.model('Category', schema);
