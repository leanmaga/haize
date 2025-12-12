import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    // Código único del cupón
    code: {
      type: String,
      required: [true, 'El código del cupón es obligatorio'],
      unique: true,
      uppercase: true, // Siempre en mayúsculas
      trim: true,
      minlength: [3, 'El código debe tener al menos 3 caracteres'],
      maxlength: [20, 'El código no puede exceder 20 caracteres'],
    },

    // Descripción del cupón (opcional, para uso interno)
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'La descripción no puede exceder 200 caracteres'],
    },

    // Tipo de descuento: 'percentage' o 'fixed'
    discountType: {
      type: String,
      required: [true, 'El tipo de descuento es obligatorio'],
      enum: {
        values: ['percentage', 'fixed'],
        message: 'El tipo debe ser "percentage" o "fixed"',
      },
    },

    // Valor del descuento
    discountValue: {
      type: Number,
      required: [true, 'El valor del descuento es obligatorio'],
      min: [0, 'El valor del descuento no puede ser negativo'],
      validate: {
        validator: function (value) {
          // Si es porcentaje, no puede exceder 100
          if (this.discountType === 'percentage' && value > 100) {
            return false;
          }
          return true;
        },
        message: 'El porcentaje no puede exceder 100%',
      },
    },

    // Monto mínimo de compra para aplicar el cupón (opcional)
    minimumPurchase: {
      type: Number,
      default: 0,
      min: [0, 'El monto mínimo no puede ser negativo'],
    },

    // Tipo de uso: 'single' (un solo uso) o 'reusable' (reutilizable)
    usageType: {
      type: String,
      required: [true, 'El tipo de uso es obligatorio'],
      enum: {
        values: ['single', 'reusable'],
        message: 'El tipo de uso debe ser "single" o "reusable"',
      },
    },

    // Límite de usos (solo para cupones reutilizables)
    // null = ilimitado, número = límite específico
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'El límite de usos debe ser al menos 1'],
      validate: {
        validator: function (value) {
          // Solo validar si es reutilizable
          if (this.usageType === 'single') {
            return value === null || value === 1;
          }
          return true;
        },
        message: 'Cupones de un solo uso no pueden tener límite diferente a 1',
      },
    },

    // Contador de usos actuales
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'El contador no puede ser negativo'],
    },

    // Control de expiración: 'date' (fecha específica) o 'manual' (hasta que admin desactive)
    expirationType: {
      type: String,
      required: [true, 'El tipo de expiración es obligatorio'],
      enum: {
        values: ['date', 'manual'],
        message: 'El tipo de expiración debe ser "date" o "manual"',
      },
    },

    // Fecha de expiración (solo si expirationType es 'date')
    expirationDate: {
      type: Date,
      validate: {
        validator: function (value) {
          // Solo requerido si expirationType es 'date'
          if (this.expirationType === 'date' && !value) {
            return false;
          }
          // La fecha debe ser futura
          if (value && value < new Date()) {
            return false;
          }
          return true;
        },
        message: 'Fecha de expiración inválida o en el pasado',
      },
    },

    // Estado del cupón: activo o inactivo
    isActive: {
      type: Boolean,
      default: true,
    },

    // Usuarios que han usado este cupón (para cupones de un solo uso)
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        discountApplied: {
          type: Number,
          required: true,
        },
      },
    ],

    // Metadatos adicionales
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Añade createdAt y updatedAt automáticamente
  },
);

// Índices para optimizar consultas
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ expirationDate: 1 });

// Método para verificar si el cupón está disponible
couponSchema.methods.isAvailable = function () {
  // Verificar si está activo
  if (!this.isActive) {
    return { valid: false, reason: 'El cupón está desactivado' };
  }

  // Verificar expiración por fecha
  if (this.expirationType === 'date' && this.expirationDate < new Date()) {
    return { valid: false, reason: 'El cupón ha expirado' };
  }

  // Verificar límite de usos
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'El cupón alcanzó su límite de usos' };
  }

  return { valid: true };
};

// Método para verificar si un usuario puede usar este cupón
couponSchema.methods.canUserUse = function (userId) {
  // Si es de un solo uso, verificar si el usuario ya lo usó
  if (this.usageType === 'single') {
    const alreadyUsed = this.usedBy.some(
      (use) => use.userId.toString() === userId.toString(),
    );
    if (alreadyUsed) {
      return {
        valid: false,
        reason: 'Ya has usado este cupón anteriormente',
      };
    }
  }

  return { valid: true };
};

// Método para calcular el descuento
couponSchema.methods.calculateDiscount = function (subtotal) {
  // Verificar monto mínimo
  if (subtotal < this.minimumPurchase) {
    return {
      valid: false,
      discount: 0,
      reason: `El monto mínimo de compra es $${this.minimumPurchase.toLocaleString('es-AR')}`,
    };
  }

  let discount = 0;

  if (this.discountType === 'percentage') {
    // Descuento porcentual
    discount = (subtotal * this.discountValue) / 100;
  } else {
    // Descuento fijo
    discount = Math.min(this.discountValue, subtotal); // No puede exceder el subtotal
  }

  return {
    valid: true,
    discount: Math.round(discount), // Redondear a entero
    finalAmount: subtotal - Math.round(discount),
  };
};

// Método para registrar el uso del cupón
couponSchema.methods.recordUsage = async function (
  userId,
  orderId,
  discountApplied,
) {
  this.usedCount += 1;
  this.usedBy.push({
    userId,
    orderId,
    discountApplied,
    usedAt: new Date(),
  });
  await this.save();
};

// Middleware pre-save para validaciones adicionales
couponSchema.pre('save', function (next) {
  // Si es de un solo uso, establecer límite en 1
  if (this.usageType === 'single' && this.usageLimit !== 1) {
    this.usageLimit = 1;
  }

  // Si expirationType es manual, limpiar expirationDate
  if (this.expirationType === 'manual') {
    this.expirationDate = undefined;
  }

  next();
});

// Método estático para buscar cupón por código
couponSchema.statics.findByCode = async function (code) {
  return this.findOne({ code: code.toUpperCase() });
};

// Método estático para obtener cupones activos
couponSchema.statics.getActiveCoupons = async function () {
  return this.find({
    isActive: true,
    $or: [
      { expirationType: 'manual' },
      { expirationDate: { $gte: new Date() } },
    ],
  }).sort({ createdAt: -1 });
};

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

export default Coupon;
