import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Por favor proporcione un título"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Precio de venta (precio principal en tienda) - OBLIGATORIO
    salePrice: {
      type: Number,
      required: [true, "Por favor proporcione el precio de venta"],
      min: [0, "El precio no puede ser negativo"],
    },
    // Precio promocional opcional
    promoPrice: {
      type: Number,
      default: 0,
      min: [0, "El precio promocional no puede ser negativo"],
    },
    // Costo interno (no se muestra en tienda) - OPCIONAL
    cost: {
      type: Number,
      min: [0, "El costo no puede ser negativo"],
      default: 0,
    },
    // Margen de ganancia (%) calculado o manual - OPCIONAL
    profitMargin: {
      type: Number,
      min: [0, "El margen no puede ser negativo"],
      max: [100, "El margen no puede exceder el 100%"],
      default: 0,
    },
    stock: {
      type: Number,
      min: [0, "El stock no puede ser negativo"],
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Por favor proporcione una categoría"],
      enum: [
        // Categorías de pollería
        "pollos-enteros",
        "cortes-pollo",
        "huevos",
        "marinados-pollo",
        "embutidos-pollo",
        "menudencias-pollo",

        // Categorías de carnicería
        "cortes-vacunos",
        "cortes-cerdo",
        "cortes-cordero",
        "milanesas",
        "carne-picada",
        "embutidos-vacunos",
        "vísceras",

        // Categorías generales
        "productos-organicos",
        "preparados",
        "promociones",
        "otros",
      ],
    },

    // === CAMPOS BÁSICOS DE PESO ===

    // Peso del producto (en kg o gramos)
    weight: {
      type: Number,
      min: [0, "El peso no puede ser negativo"],
      default: 0,
    },
    weightUnit: {
      type: String,
      enum: ["kg", "g", "unidad", "docena"],
      default: "kg",
    },

    // Rangos de peso para productos variables
    weightRange: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
    },

    // === INFORMACIÓN NUTRICIONAL ===

    // Información nutricional
    nutritionalInfo: {
      calories: {
        type: Number,
        default: 0,
      },
      protein: {
        type: Number,
        default: 0,
      },
      fat: {
        type: Number,
        default: 0,
      },
      // Por cada 100g
      per100g: {
        type: Boolean,
        default: true,
      },
    },

    // Ingredientes y alérgenos
    ingredients: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },

    // === CAMPOS DE IMAGEN ===

    // Campos para fotos y presentación
    imageUrl: {
      type: String,
      required: [true, "Por favor proporcione una imagen"],
    },

    // Información adicional de Cloudinary para la imagen principal
    imageCloudinaryInfo: {
      publicId: String,
      format: String,
      width: Number,
      height: Number,
      bytes: Number,
    },

    // Imágenes adicionales
    additionalImages: {
      type: [
        {
          imageUrl: String,
          description: String, // Ej: "corte específico", "preparación especial"
          imageCloudinaryInfo: {
            publicId: String,
            format: String,
            width: Number,
            height: Number,
            bytes: Number,
          },
        },
      ],
      default: [],
    },

    featured: {
      type: Boolean,
      default: false,
    },

    // === DISPONIBILIDAD Y CONTROL ===

    // Disponibilidad por días de la semana
    availability: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true },
    },

    // Campos para valoraciones
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },

    // SKU único para inventario
    sku: {
      type: String,
      unique: true,
      sparse: true, // Permite que sea único solo si existe
    },

    // Estado del producto (activo/inactivo)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Crear índices para mejorar el rendimiento de las consultas (solo los necesarios)
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ salePrice: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ weight: 1 });
productSchema.index({ createdAt: -1 });

// Middleware pre-save para cálculos automáticos
productSchema.pre("save", function (next) {
  // Si se proporciona costo y precio de venta pero no margen, calcularlo
  if (this.cost > 0 && this.salePrice > 0 && this.profitMargin === 0) {
    this.profitMargin = ((this.salePrice - this.cost) / this.salePrice) * 100;
  }

  // Generar SKU automático si no existe
  if (!this.sku) {
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.sku = `${categoryCode}-${timestamp}`;
  }

  next();
});

// Virtual para verificar si tiene descuento
productSchema.virtual("hasDiscount").get(function () {
  return this.promoPrice > 0 && this.promoPrice < this.salePrice;
});

// Virtual para calcular porcentaje de descuento
productSchema.virtual("discountPercentage").get(function () {
  if (this.hasDiscount) {
    return Math.round(
      ((this.salePrice - this.promoPrice) / this.salePrice) * 100
    );
  }
  return 0;
});

// Virtual para precio efectivo (promocional si existe, sino el de venta)
productSchema.virtual("effectivePrice").get(function () {
  return this.hasDiscount ? this.promoPrice : this.salePrice;
});

// Virtual para verificar si está disponible hoy
productSchema.virtual("availableToday").get(function () {
  const today = new Date().getDay(); // 0 = domingo, 1 = lunes, etc.
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return this.availability[days[today]];
});

// Virtual para calcular precio por kg (si el producto se vende por peso)
productSchema.virtual("pricePerKg").get(function () {
  if (this.weight > 0 && this.weightUnit === "kg") {
    return this.effectivePrice / this.weight;
  } else if (this.weight > 0 && this.weightUnit === "g") {
    return (this.effectivePrice / this.weight) * 1000;
  }
  return this.effectivePrice;
});

// Verificar si el modelo ya existe para evitar sobreescribirlo
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
