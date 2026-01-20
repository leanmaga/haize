// models/SizeGuide.js - SCHEMA CORREGIDO CON TODOS LOS CAMPOS
import mongoose from 'mongoose';

const SizeGuideSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false, // Puede ser una guía genérica sin producto asociado
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'remeras',
        'camisas',
        'pantalones',
        'shorts',
        'musculosas',
        'conjuntos',
      ],
      required: false, // Opcional para guías genéricas
    },
    method: {
      type: String,
      required: true,
      enum: ['corporales', 'prenda', 'ambas'],
      default: 'corporales',
    },
    sizes: [
      {
        // Talle etiqueta (ej: "S", "M", "38", "40")
        labelSize: {
          type: String,
          required: true,
          trim: true,
        },
        // Equivalencias (ej: ["S", "Small", "Chico"])
        equivalencies: [
          {
            type: String,
            trim: true,
          },
        ],
        // Medidas corporales
        bodyMeasurements: {
          bustCircumference: Number, // Contorno de busto
          waistCircumference: Number, // Contorno de cintura
          hipCircumference: Number, // Contorno de cadera
          neckCircumference: Number, // Contorno de cuello
          height: Number, // Altura
        },
        // ✅ MEDIDAS DE LA PRENDA - SCHEMA UNIVERSAL
        garmentMeasurements: {
          // ═══════════════════════════════════════
          // CAMPOS COMUNES
          // ═══════════════════════════════════════
          length: Number, // Largo total

          // ═══════════════════════════════════════
          // REMERAS / CAMISAS / MUSCULOSAS
          // ═══════════════════════════════════════
          chestWidth: Number, // Ancho de pecho (también puede llamarse 'chest')
          chest: Number, // Alias de chestWidth
          shoulderWidth: Number, // Ancho de hombros (también puede llamarse 'shoulder')
          shoulder: Number, // Alias de shoulderWidth
          sleeveLength: Number, // Largo de manga (también puede llamarse 'sleeve')
          sleeve: Number, // Alias de sleeveLength
          neck: Number, // Contorno de cuello (camisas)

          // ═══════════════════════════════════════
          // PANTALONES / SHORTS
          // ═══════════════════════════════════════
          waist: Number, // Cintura
          hip: Number, // Cadera
          inseam: Number, // Tiro / entrepierna
          thigh: Number, // Pierna / muslo

          // ═══════════════════════════════════════
          // CONJUNTOS (híbrido)
          // ═══════════════════════════════════════
          topLength: Number, // Largo del buzo/remera
          topChest: Number, // Pecho del buzo
          bottomLength: Number, // Largo del pantalón

          // ═══════════════════════════════════════
          // CAMPOS ADICIONALES
          // ═══════════════════════════════════════
          rise: Number, // Tiro (alternativo a inseam)
          legOpening: Number, // Boca de pierna
          armhole: Number, // Sisa
          bicep: Number, // Circunferencia de bíceps
          forearm: Number, // Circunferencia de antebrazo
          wrist: Number, // Circunferencia de muñeca
          backLength: Number, // Largo de espalda
          frontLength: Number, // Largo de frente
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // ✅ IMPORTANTE: Permitir campos adicionales sin definir en el schema
    strict: false, // Esto permite guardar campos no definidos en garmentMeasurements
  },
);

// Índices
SizeGuideSchema.index({ productId: 1 });
SizeGuideSchema.index({ name: 1 });
SizeGuideSchema.index({ isActive: 1 });
SizeGuideSchema.index({ category: 1 });

const SizeGuide =
  mongoose.models.SizeGuide || mongoose.model('SizeGuide', SizeGuideSchema);

export default SizeGuide;
