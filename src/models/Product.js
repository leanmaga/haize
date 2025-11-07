import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Por favor proporcione un título'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Precio de venta (precio principal en tienda) - OBLIGATORIO
    salePrice: {
      type: Number,
      required: [true, 'Por favor proporcione el precio de venta'],
      min: [0, 'El precio no puede ser negativo'],
    },
    // Precio promocional opcional
    promoPrice: {
      type: Number,
      default: 0,
      min: [0, 'El precio promocional no puede ser negativo'],
    },
    // Costo interno (no se muestra en tienda) - OPCIONAL
    cost: {
      type: Number,
      min: [0, 'El costo no puede ser negativo'],
      default: 0,
    },
    // Margen de ganancia (%) calculado o manual - OPCIONAL
    profitMargin: {
      type: Number,
      min: [0, 'El margen no puede ser negativo'],
      max: [100, 'El margen no puede exceder el 100%'],
      default: 0,
    },

    // === CATEGORÍAS DE INDUMENTARIA MASCULINA ===
    category: {
      type: String,
      required: [true, 'Por favor proporcione una categoría'],
      enum: [
        // Ropa superior
        'camisas',
        'remeras',
        'polos',
        'sweaters',
        'buzos',
        'camperas',
        'chalecos',
        'trajes',

        // Ropa inferior
        'pantalones',
        'jeans',
        'bermudas',
        'shorts',

        // Ropa interior y calcetines
        'ropa-interior',
        'medias',

        // Calzado
        'zapatillas',
        'zapatos',
        'botas',
        'sandalias',

        // Otros
        'deportivo',
        'formal',
        'casual',
        'otros',
      ],
    },

    // === TALLES Y VARIANTES ===

    // Sistema de talles
    sizes: {
      type: [
        {
          size: {
            type: String,
            enum: [
              'XS',
              'S',
              'M',
              'L',
              'XL',
              'XXL',
              'XXXL',
              '36',
              '38',
              '40',
              '42',
              '44',
              '46',
              '48',
              '50',
            ],
            required: true,
          },
          stock: {
            type: Number,
            min: [0, 'El stock no puede ser negativo'],
            default: 0,
          },
          sku: {
            type: String,
          },
        },
      ],
      default: [],
    },

    // Colores disponibles
    colors: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
          hexCode: {
            type: String, // Ej: "#000000" para negro
          },
          stock: {
            type: Number,
            min: [0, 'El stock no puede ser negativo'],
            default: 0,
          },
          imageUrl: {
            type: String, // Imagen del producto en ese color
          },
        },
      ],
      default: [],
    },

    // Stock total (calculado automáticamente o manual)
    stock: {
      type: Number,
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },

    // === INFORMACIÓN DEL PRODUCTO ===

    // Material y composición
    material: {
      type: String,
      trim: true,
    },
    composition: {
      type: [String], // Ej: ["100% Algodón"] o ["60% Algodón", "40% Poliéster"]
      default: [],
    },

    // Marca
    brand: {
      type: String,
      trim: true,
    },

    // Cuidado del producto
    careInstructions: {
      type: [String], // Ej: ["Lavar a máquina", "No usar blanqueador", "Planchar a temperatura media"]
      default: [],
    },

    // País de origen
    origin: {
      type: String,
      trim: true,
    },

    // === CAMPOS DE IMAGEN ===

    // Imagen principal
    imageUrl: {
      type: String,
      required: [true, 'Por favor proporcione una imagen'],
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
          description: String, // Ej: "vista frontal", "detalle", "modelo usando"
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

    // === VALORACIONES Y CONTROL ===

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

    // Producto nuevo
    isNew: {
      type: Boolean,
      default: false,
    },

    // Temporada
    season: {
      type: String,
      enum: ['primavera-verano', 'otoño-invierno', 'todo-el-año'],
      default: 'todo-el-año',
    },
  },
  {
    timestamps: true,
  }
);

// Crear índices para mejorar el rendimiento de las consultas
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ salePrice: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ season: 1 });
productSchema.index({ isNew: 1 });
productSchema.index({ createdAt: -1 });

// Middleware pre-save para cálculos automáticos
productSchema.pre('save', function (next) {
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

  // Calcular stock total si hay talles o colores con stock
  if (this.sizes && this.sizes.length > 0) {
    this.stock = this.sizes.reduce((total, size) => total + size.stock, 0);
  } else if (this.colors && this.colors.length > 0) {
    this.stock = this.colors.reduce((total, color) => total + color.stock, 0);
  }

  next();
});

// Virtual para verificar si tiene descuento
productSchema.virtual('hasDiscount').get(function () {
  return this.promoPrice > 0 && this.promoPrice < this.salePrice;
});

// Virtual para calcular porcentaje de descuento
productSchema.virtual('discountPercentage').get(function () {
  if (this.hasDiscount) {
    return Math.round(
      ((this.salePrice - this.promoPrice) / this.salePrice) * 100
    );
  }
  return 0;
});

// Virtual para precio efectivo (promocional si existe, sino el de venta)
productSchema.virtual('effectivePrice').get(function () {
  return this.hasDiscount ? this.promoPrice : this.salePrice;
});

// Virtual para verificar si tiene stock disponible
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Virtual para verificar si está por agotarse
productSchema.virtual('lowStock').get(function () {
  return this.stock > 0 && this.stock <= 5;
});

// Verificar si el modelo ya existe para evitar sobreescribirlo
const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
