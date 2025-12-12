import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'La cantidad debe ser al menos 1'],
        },
        price: {
          type: Number,
          required: true,
        },
        imageUrl: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          required: false,
        },
        color: {
          type: String,
          required: false,
        },
      },
    ],

    // ========== CAMPOS DE CUPONES ==========

    // Subtotal antes de descuento
    subtotal: {
      type: Number,
      required: true,
    },

    // Información del cupón aplicado (si hay)
    appliedCoupon: {
      couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
      },
      code: {
        type: String,
        uppercase: true,
      },
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
      discountValue: {
        type: Number,
      },
      discountAmount: {
        type: Number,
        default: 0,
      },
    },

    // Monto del descuento aplicado
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'El descuento no puede ser negativo'],
    },

    // ========================================

    // Total final (subtotal - descuento)
    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        'pendiente',
        'pagado',
        'enviado',
        'entregado',
        'cancelado',
        'whatsapp_pendiente',
      ],
      default: 'pendiente',
    },
    paymentId: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['mercadopago', 'credit_card', 'debit_card', 'whatsapp'],
    },
    whatsappOrder: {
      type: Boolean,
      default: false,
    },
    shippingInfo: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
    },
    // Campo agregado para detalles del pago y/o errores
    paymentDetails: {
      type: Object,
      default: {},
    },
    // Si usas idempotencyKey, asegúrate de incluirlo en el modelo
    idempotencyKey: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// ========== ÍNDICES ==========
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'appliedCoupon.couponId': 1 });

// ========== MÉTODOS DE INSTANCIA ==========

// Calcular subtotal a partir de items
orderSchema.methods.calculateSubtotal = function () {
  return this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

// Calcular total final
orderSchema.methods.calculateTotal = function () {
  const subtotal = this.subtotal || this.calculateSubtotal();
  const discount = this.discountAmount || 0;
  return Math.max(0, subtotal - discount);
};

// Verificar si tiene cupón aplicado
orderSchema.methods.hasCoupon = function () {
  return !!(this.appliedCoupon && this.appliedCoupon.couponId);
};

// ========== MIDDLEWARE PRE-SAVE ==========

orderSchema.pre('save', function (next) {
  // Si no hay subtotal, calcularlo
  if (!this.subtotal || this.subtotal === 0) {
    this.subtotal = this.calculateSubtotal();
  }

  // Asegurar que discountAmount no sea mayor que subtotal
  if (this.discountAmount > this.subtotal) {
    this.discountAmount = this.subtotal;
  }

  // Calcular totalAmount si no está definido o es 0
  if (!this.totalAmount || this.totalAmount === 0) {
    this.totalAmount = this.calculateTotal();
  }

  next();
});

// ========== MÉTODOS ESTÁTICOS ==========

// Crear orden con cupón aplicado
orderSchema.statics.createWithCoupon = async function (
  orderData,
  couponData = null,
) {
  // Calcular subtotal
  const subtotal = orderData.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Preparar datos de la orden
  const newOrderData = {
    ...orderData,
    subtotal: subtotal,
    discountAmount: 0,
    totalAmount: subtotal,
  };

  // Si hay cupón, agregarlo a la orden
  if (couponData && couponData.couponId) {
    newOrderData.appliedCoupon = {
      couponId: couponData.couponId,
      code: couponData.code,
      discountType: couponData.discountType,
      discountValue: couponData.discountValue,
      discountAmount: couponData.discountAmount,
    };
    newOrderData.discountAmount = couponData.discountAmount;
    newOrderData.totalAmount = subtotal - couponData.discountAmount;
  }

  // Crear la orden
  const order = new this(newOrderData);
  await order.save();

  // Si hay cupón, registrar su uso
  if (couponData && couponData.couponId) {
    try {
      const Coupon = mongoose.model('Coupon');
      const coupon = await Coupon.findById(couponData.couponId);

      if (coupon) {
        await coupon.recordUsage(
          order.user,
          order._id,
          couponData.discountAmount,
        );
      }
    } catch (error) {
      console.error('Error al registrar uso del cupón:', error);
      // No fallar la orden si falla el registro del cupón
    }
  }

  return order;
};

// Buscar órdenes con cupón específico
orderSchema.statics.findByCoupon = async function (couponId) {
  return this.find({
    'appliedCoupon.couponId': couponId,
  })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

// Obtener estadísticas de cupones usados
orderSchema.statics.getCouponStats = async function (startDate, endDate) {
  const matchStage = {
    'appliedCoupon.couponId': { $exists: true },
  };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$appliedCoupon.code',
        count: { $sum: 1 },
        totalDiscount: { $sum: '$discountAmount' },
        totalRevenue: { $sum: '$totalAmount' },
        avgDiscount: { $avg: '$discountAmount' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// ========== MÉTODOS DE QUERY ==========

// Query helper para órdenes con descuento
orderSchema.query.withDiscount = function () {
  return this.where('discountAmount').gt(0);
};

// Query helper para órdenes sin descuento
orderSchema.query.withoutDiscount = function () {
  return this.where('discountAmount').equals(0);
};

// ========== VIRTUALS ==========

// Porcentaje de descuento aplicado
orderSchema.virtual('discountPercentage').get(function () {
  if (this.subtotal === 0) return 0;
  return Math.round((this.discountAmount / this.subtotal) * 100);
});

// Ahorro total
orderSchema.virtual('savings').get(function () {
  return this.discountAmount;
});

// ========== OPCIONES ==========

// Incluir virtuals al convertir a JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// Prevenir que el modelo se sobrescriba durante el desarrollo debido al hot reloading
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
