// scripts/populate-size-guides.js
/**
 * Script para poblar la base de datos con las guías de talles iniciales
 *
 * Ejecutar con: node scripts/populate-size-guides.js
 */

import mongoose from 'mongoose';
import SizeGuide from '../src/models/SizeGuide.js';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/haize';

const sizeGuides = [
  {
    category: 'remeras',
    description: 'Todas las medidas están en centímetros (cm)',
    measurements: [
      { size: 'M', length: 70, width: 52 },
      { size: 'L', length: 71, width: 53 },
      { size: 'XL', length: 70, width: 56 },
      { size: 'XXL', length: 72, width: 58 },
    ],
    notes: 'Medidas tomadas de forma recta sobre superficie plana',
    isActive: true,
  },
  {
    category: 'camisas',
    description: 'Todas las medidas están en centímetros (cm)',
    measurements: [
      { size: 'M', length: 68, width: 55 },
      { size: 'L', length: 71, width: 57 },
      { size: 'XL', length: 72, width: 60 },
      { size: 'XXL', length: 76, width: 63 },
    ],
    notes: 'Medidas tomadas de forma recta sobre superficie plana',
    isActive: true,
  },
  {
    category: 'musculosas',
    description: 'Todas las medidas están en centímetros (cm)',
    measurements: [
      { size: 'M', length: 68, width: 50 },
      { size: 'L', length: 70, width: 53 },
      { size: 'XL', length: 71, width: 56 },
      { size: 'XXL', length: 72, width: 57 },
    ],
    notes: 'Medidas tomadas de forma recta sobre superficie plana',
    isActive: true,
  },
  {
    category: 'shorts',
    description:
      'Todas las medidas están en centímetros (cm). El ancho estirado indica la máxima elasticidad.',
    measurements: [
      { size: 'M', length: 51, width: 30, stretchedWidth: 50 },
      { size: 'L', length: 53, width: 32, stretchedWidth: 55 },
      { size: 'XL', length: 56, width: 33, stretchedWidth: 60 },
      { size: 'XXL', length: 59, width: 35, stretchedWidth: 65 },
    ],
    notes:
      'El ancho se mide de forma natural, el ancho estirado indica la elasticidad máxima del material',
    isActive: true,
  },
];

async function populateSizeGuides() {
  try {
    await mongoose.connect(MONGODB_URI);

    for (const guideData of sizeGuides) {
      await SizeGuide.findOneAndUpdate(
        { category: guideData.category },
        guideData,
        { upsert: true, new: true },
      );
    }
  } finally {
    await mongoose.connection.close();
  }
}

populateSizeGuides();
