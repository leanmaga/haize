import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema(
  {
    motivo: {
      type: String,
      required: [true, 'El motivo es requerido'],
    },
    nombreApellido: {
      type: String,
      required: [true, 'El nombre y apellido es requerido'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder los 100 caracteres'],
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es requerido'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Por favor ingresa un email válido',
      ],
    },
    localidad: {
      type: String,
      required: [true, 'La localidad es requerida'],
      trim: true,
    },
    pais: {
      type: String,
      required: [true, 'El país es requerido'],
      trim: true,
    },
    comentarios: {
      type: String,
      trim: true,
      maxlength: [
        2000,
        'Los comentarios no pueden exceder los 2000 caracteres',
      ],
    },
    estado: {
      type: String,
      enum: ['pendiente', 'leido', 'respondido', 'archivado'],
      default: 'pendiente',
    },
    notasInternas: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

ContactSchema.index({ estado: 1 });
ContactSchema.index({ motivo: 1 });
ContactSchema.index({ createdAt: -1 });

// Prevenir múltiples compilaciones del modelo
const Contact =
  mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

export default Contact;
