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
        'sacos',

        // Ropa inferior
        'pantalones',
        'jeans',
        'bermudas',
        'shorts',

        // Ropa interior y calcetines
        'ropa-interior',
        'medias',
        'boxers',
        'slips',

        // Calzado
        'zapatillas',
        'zapatos',
        'botas',
        'sandalias',
        'ojotas',

        // Accesorios
        'cinturones',
        'carteras',
        'mochilas',
        'gorras',
        'sombreros',
        'bufandas',
        'guantes',
        'billeteras',
        'lentes',
        'relojes',

        // Estilos
        'deportivo',
        'formal',
        'casual',
        'urbano',
        'elegante-sport',

        // Otros
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
              // Talles de ropa
              'XS',
              'S',
              'M',
              'L',
              'XL',
              'XXL',
              'XXXL',
              // Talles numéricos de pantalones y camisas
              '36',
              '38',
              '40',
              '42',
              '44',
              '46',
              '48',
              '50',
              '52',
              // Talles de calzado (argentino)
              '39',
              '40',
              '41',
              '42',
              '43',
              '44',
              '45',
              '46',
              // Talles únicos
              'UNICO',
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

    // Peso (para cálculo de envío)
    weight: {
      type: Number,
      min: [0, 'El peso no puede ser negativo'],
      default: 0,
    },

    // Dimensiones del paquete (para envío)
    dimensions: {
      length: {
        type: Number,
        default: 0,
      },
      width: {
        type: Number,
        default: 0,
      },
      height: {
        type: Number,
        default: 0,
      },
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
          imageUrl: {
            type: String,
            required: true,
          },
          description: String, // Ej: "vista frontal", "detalle", "modelo usando"
          color: String, // Color asociado a esta imagen
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

    // === DESTACADOS Y PROMOCIONES ===

    featured: {
      type: Boolean,
      default: false,
    },

    // ✅ CAMBIO: Renombrado de isNew a productIsNew para evitar conflicto con Mongoose
    productIsNew: {
      type: Boolean,
      default: false,
    },

    // Producto en oferta
    onSale: {
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

    // Temporada
    season: {
      type: String,
      enum: ['primavera-verano', 'otoño-invierno', 'todo-el-año'],
      default: 'todo-el-año',
    },

    // === ETIQUETAS Y FILTROS ===

    // Tags para búsqueda y filtrado
    tags: {
      type: [String],
      default: [],
    },

    // Estilo del producto
    style: {
      type: [String],
      enum: [
        'casual',
        'formal',
        'deportivo',
        'urbano',
        'elegante-sport',
        'streetwear',
        'clasico',
        'moderno',
      ],
      default: [],
    },

    // Ocasión de uso
    occasion: {
      type: [String],
      enum: [
        'trabajo',
        'fiesta',
        'deportes',
        'casual',
        'playa',
        'noche',
        'dia',
      ],
      default: [],
    },

    // === SEO Y METADATA ===

    // ✅ CAMBIO: Removido index: true para evitar duplicación
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },

    metaTitle: {
      type: String,
      trim: true,
    },

    metaDescription: {
      type: String,
      trim: true,
    },

    metaKeywords: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    // ✅ AGREGADO: Suprimir el warning de isNew
    suppressReservedKeysWarning: true,
  }
);

// Crear índices para mejorar el rendimiento de las consultas
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ salePrice: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ season: 1 });
productSchema.index({ productIsNew: 1 }); // ✅ CAMBIO: Actualizado de isNew a productIsNew
productSchema.index({ onSale: 1 });
productSchema.index({ createdAt: -1 });
// ✅ CAMBIO: Este ya crea el índice, no necesitamos index: true en el schema
productSchema.index({ slug: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ style: 1 });
productSchema.index({ 'colors.name': 1 });
productSchema.index({ 'sizes.size': 1 });

// Índice de texto para búsqueda
productSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
  tags: 'text',
});

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
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    this.sku = `${categoryCode}-${timestamp}-${random}`;
  }

  // Calcular stock total si hay talles o colores con stock
  if (this.sizes && this.sizes.length > 0) {
    this.stock = this.sizes.reduce((total, size) => total + size.stock, 0);
  } else if (this.colors && this.colors.length > 0) {
    this.stock = this.colors.reduce((total, color) => total + color.stock, 0);
  }

  // Generar slug si no existe
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios por guiones
      .replace(/-+/g, '-') // Eliminar guiones duplicados
      .trim();

    // Agregar timestamp si el slug ya existe y el documento es nuevo
    if (this.isNew) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }

  // Auto-establecer onSale si hay precio promocional
  if (this.promoPrice > 0 && this.promoPrice < this.salePrice) {
    this.onSale = true;
  } else {
    this.onSale = false;
  }

  // Auto-generar meta tags si no existen
  if (!this.metaTitle) {
    this.metaTitle = this.title;
  }

  if (!this.metaDescription) {
    this.metaDescription = this.description
      ? this.description.substring(0, 160)
      : `${this.title} - Indumentaria masculina de calidad`;
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

// Virtual para obtener todas las imágenes (principal + adicionales)
productSchema.virtual('allImages').get(function () {
  const images = [{ imageUrl: this.imageUrl, description: 'Imagen principal' }];
  if (this.additionalImages && this.additionalImages.length > 0) {
    images.push(...this.additionalImages);
  }
  return images;
});

// Virtual para verificar si tiene variantes (colores o talles)
productSchema.virtual('hasVariants').get(function () {
  return (
    (this.colors && this.colors.length > 0) ||
    (this.sizes && this.sizes.length > 0)
  );
});

// ✅ AGREGADO: Virtual para compatibilidad con código existente que usa "isNew"
productSchema.virtual('isNew').get(function () {
  return this.productIsNew;
});

// Método para obtener stock de un talle específico
productSchema.methods.getStockBySize = function (size) {
  const sizeVariant = this.sizes.find((s) => s.size === size);
  return sizeVariant ? sizeVariant.stock : 0;
};

// Método para obtener stock de un color específico
productSchema.methods.getStockByColor = function (colorName) {
  const colorVariant = this.colors.find((c) => c.name === colorName);
  return colorVariant ? colorVariant.stock : 0;
};

// Método para actualizar stock de un talle
productSchema.methods.updateStockBySize = function (size, quantity) {
  const sizeVariant = this.sizes.find((s) => s.size === size);
  if (sizeVariant) {
    sizeVariant.stock = Math.max(0, sizeVariant.stock + quantity);
    // Recalcular stock total
    this.stock = this.sizes.reduce((total, s) => total + s.stock, 0);
    return true;
  }
  return false;
};

// Método para actualizar stock de un color
productSchema.methods.updateStockByColor = function (colorName, quantity) {
  const colorVariant = this.colors.find((c) => c.name === colorName);
  if (colorVariant) {
    colorVariant.stock = Math.max(0, colorVariant.stock + quantity);
    // Recalcular stock total
    this.stock = this.colors.reduce((total, c) => total + c.stock, 0);
    return true;
  }
  return false;
};

// Método para verificar disponibilidad
productSchema.methods.isAvailable = function (size = null, color = null) {
  if (size && this.sizes.length > 0) {
    const sizeVariant = this.sizes.find((s) => s.size === size);
    return sizeVariant && sizeVariant.stock > 0;
  }

  if (color && this.colors.length > 0) {
    const colorVariant = this.colors.find((c) => c.name === color);
    return colorVariant && colorVariant.stock > 0;
  }

  return this.stock > 0;
};

// Configurar para que los virtuals se incluyan en JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Verificar si el modelo ya existe para evitar sobreescribirlo
const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
