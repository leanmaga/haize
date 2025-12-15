// src/models/SizeGuide.js
import mongoose from 'mongoose';

/**
 * Modelo para almacenar las guías de talles con medidas físicas
 * Cada categoría tiene sus propias medidas por talle
 */
const sizeGuideSchema = new mongoose.Schema(
  {
    // Categoría del producto
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      unique: true,
      enum: ['camisas', 'remeras', 'conjuntos', 'shorts', 'musculosas'],
    },

    // Descripción opcional de la guía
    description: {
      type: String,
      default: 'Todas las medidas están en centímetros (cm)',
    },

    // Medidas por talle
    measurements: {
      type: [
        {
          size: {
            type: String,
            required: true,
            enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
          },
          // Largo de la prenda (en cm)
          length: {
            type: Number,
            required: true,
            min: [0, 'El largo no puede ser negativo'],
          },
          // Ancho de la prenda (en cm)
          width: {
            type: Number,
            required: true,
            min: [0, 'El ancho no puede ser negativo'],
          },
          // Ancho estirado (para shorts con elasticidad)
          stretchedWidth: {
            type: Number,
            min: [0, 'El ancho estirado no puede ser negativo'],
          },
        },
      ],
      default: [],
    },

    // Notas adicionales (ej: "medidas tomadas de forma recta")
    notes: {
      type: String,
      default: '',
    },

    // Si está activa o no
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Método para obtener las medidas de un talle específico
sizeGuideSchema.methods.getMeasurementsBySize = function (size) {
  return this.measurements.find((m) => m.size === size);
};

// Método para verificar si un talle existe en la guía
sizeGuideSchema.methods.hasSizeMeasurements = function (size) {
  return this.measurements.some((m) => m.size === size);
};

// Método para obtener todos los talles disponibles
sizeGuideSchema.methods.getAvailableSizes = function () {
  return this.measurements.map((m) => m.size);
};

// Prevenir sobrescritura del modelo en desarrollo (hot reload)
const SizeGuide =
  mongoose.models.SizeGuide || mongoose.model('SizeGuide', sizeGuideSchema);

export default SizeGuide;
