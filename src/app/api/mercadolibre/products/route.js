import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  await connectDB();
  const products = await Product.find({}, 'title sku stock variants mercadoLibre').sort({ title: 1 }).lean();
  return NextResponse.json({ products });
}

export async function PATCH(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const { productId, itemId, variationMappings = [] } = await request.json();
  if (!productId) return NextResponse.json({ error: 'Falta productId' }, { status: 400 });
  await connectDB();
  const product = await Product.findByIdAndUpdate(
    productId,
    { mercadoLibre: { itemId: itemId?.trim() || undefined, variationMappings } },
    { new: true },
  );
  if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  return NextResponse.json({ product });
}
