// models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    // ============ PASO 1: CARACTERÍSTICAS PRINCIPALES ============
    brand: {
      type: String,
      default: 'Haize',
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    gender: {
      type: String,
      enum: ['Hombre', 'Mujer', 'Unisex', 'Niño', 'Niña'],
      required: true,
    },

    // ============ INFORMACIÓN BÁSICA ============
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: false, // No requerido para borradores del wizard
      enum: [
        'remeras',
        'camisas',
        'pantalones',
        'shorts',
        'musculosas',
        'conjuntos',
      ],
      default: 'remeras',
    },

    // ============ PRECIOS ============
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    promoPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    profitMargin: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ============ STOCK Y SKU ============
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      sparse: true,
      trim: true,
    },

    // ============ PASO 2: VARIANTES COMBINADAS (Color + Size) ============
    variants: [
      {
        size: {
          type: String,
          required: true,
          trim: true,
        },
        color: {
          type: String,
          required: true,
          trim: true,
        },
        colorHex: {
          type: String,
          default: '#808080',
        },
        fabricDesign: {
          type: String,
          trim: true,
        },
        stock: {
          type: Number,
          required: true,
          default: 0,
          min: 0,
        },
        sku: {
          type: String,
          trim: true,
        },
        universalCode: {
          type: String,
          trim: true,
        },
        images: [
          {
            type: String,
          },
        ],
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // ============ VARIANTES SEPARADAS (Backward compatibility) ============
    sizes: [
      {
        type: String,
        trim: true,
      },
    ],
    colors: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============ PASO 2: GUÍA DE TALLES ============
    sizeGuide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SizeGuide',
    },
    hasSizeGuide: {
      type: Boolean,
      default: false,
    },

    // ============ IMÁGENES ============
    imageUrl: {
      type: String,
      required: true,
    },
    imageCloudinaryInfo: {
      publicId: String,
      width: Number,
      height: Number,
      format: String,
    },
    additionalImages: [
      {
        url: String,
        publicId: String,
        isPrimary: Boolean,
      },
    ],

    // ============ DETALLES DEL PRODUCTO ============
    material: {
      type: String,
      default: '',
      trim: true,
    },
    composition: [
      {
        type: String,
        trim: true,
      },
    ],
    careInstructions: [
      {
        type: String,
        trim: true,
      },
    ],
    origin: {
      type: String,
      default: '',
      trim: true,
    },
    weight: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ============ CATEGORIZACIÓN ============
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    season: {
      type: String,
      enum: ['verano', 'otoño', 'invierno', 'primavera', 'todo-el-año'],
      default: 'todo-el-año',
    },

    // ============ ESTADO DEL PRODUCTO ============
    featured: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ============ METADATA DEL WIZARD ============
    creationStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 6,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },

    // ============ SEO ============
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  },
);

// ============ ÍNDICES ============
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ featured: 1, isActive: 1 });
ProductSchema.index({ isNew: 1, isActive: 1 });
ProductSchema.index({ season: 1 });
ProductSchema.index({ salePrice: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ slug: 1 }, { unique: true, sparse: true });
ProductSchema.index({ sku: 1 }, { unique: true, sparse: true });

// ============ MÉTODOS ============

// Generar slug automáticamente
ProductSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    if (!this.slug || this.isNew) {
      const baseSlug = (this.title || `${this.brand}-${this.model}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Si es un borrador del wizard, agregar timestamp para evitar duplicados
      if (!this.isComplete) {
        this.slug = `${baseSlug}-${Date.now()}`;
      } else {
        this.slug = baseSlug;
      }
    }
  }
  next();
});

// Calcular stock total desde variantes
ProductSchema.pre('save', function (next) {
  if (this.variants && this.variants.length > 0) {
    this.stock = this.variants.reduce((total, variant) => {
      return total + (variant.stock || 0);
    }, 0);
  }
  next();
});

// ============ VIRTUALS ============

// Precio con descuento
ProductSchema.virtual('finalPrice').get(function () {
  return this.promoPrice > 0 && this.promoPrice < this.salePrice
    ? this.promoPrice
    : this.salePrice;
});

// Está en oferta
ProductSchema.virtual('onSale').get(function () {
  return this.promoPrice > 0 && this.promoPrice < this.salePrice;
});

// Porcentaje de descuento
ProductSchema.virtual('discountPercent').get(function () {
  if (this.promoPrice > 0 && this.promoPrice < this.salePrice) {
    return Math.round(
      ((this.salePrice - this.promoPrice) / this.salePrice) * 100,
    );
  }
  return 0;
});

// ============ MÉTODOS DE INSTANCIA ============

// Verificar si hay stock disponible
ProductSchema.methods.hasStock = function (quantity = 1) {
  return this.stock >= quantity;
};

// Verificar stock por variante
ProductSchema.methods.hasVariantStock = function (size, color, quantity = 1) {
  const variant = this.variants.find(
    (v) => v.size === size && v.color === color,
  );
  return variant ? variant.stock >= quantity : false;
};

// Reducir stock
ProductSchema.methods.reduceStock = function (quantity) {
  this.stock = Math.max(0, this.stock - quantity);
  return this.save();
};

// Reducir stock por variante
ProductSchema.methods.reduceVariantStock = async function (
  size,
  color,
  quantity,
) {
  const variant = this.variants.find(
    (v) => v.size === size && v.color === color,
  );

  if (variant) {
    variant.stock = Math.max(0, variant.stock - quantity);

    // Recalcular stock total
    this.stock = this.variants.reduce((total, v) => total + v.stock, 0);

    return this.save();
  }

  throw new Error('Variante no encontrada');
};

// ============ OPCIONES DE ESQUEMA ============
ProductSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

ProductSchema.set('toObject', { virtuals: true });

// ============ EXPORTAR MODELO ============
const Product =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
