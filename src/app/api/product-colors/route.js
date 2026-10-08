import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { availableProductColors } from '@/lib/product-colors';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({ isActive: { $ne: false }, isComplete: { $ne: false } })
      .select('colors variants.color variants.colorHex').lean();
    return NextResponse.json({ colors: availableProductColors(products) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'No se pudieron consultar los colores.' }, { status: 500 });
  }
}
