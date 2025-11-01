import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    costPrice: {
      type: Number,
      required: [true, 'El precio de costo es requerido'],
      min: 0,
    },
    salePrice: {
      type: Number,
      required: [true, 'El precio de venta es requerido'],
      min: 0,
    },
    offerPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    sizes: [
      {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
    ],
    colors: [
      {
        name: String,
        hexCode: String,
      },
    ],
    category: {
      type: String,
      required: [true, 'La categoría es requerida'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas más eficientes
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ category: 1, featured: 1 });

export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema);
