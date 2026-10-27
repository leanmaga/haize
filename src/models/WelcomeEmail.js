import mongoose from 'mongoose';

// Email identity is shared by account registration and newsletter signup.
const schema = new mongoose.Schema({
  _id: { type: String },
  sentAt: Date,
  sendingAt: Date,
}, { timestamps: true });

export default mongoose.models.WelcomeEmail || mongoose.model('WelcomeEmail', schema);
