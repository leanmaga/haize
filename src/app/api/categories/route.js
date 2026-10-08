import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { seedCategories } from '@/lib/categories';
import { categoryInput } from '@/lib/category-options';

export async function GET() {
  try {
    await connectDB();
    await seedCategories();
    return NextResponse.json({ categories: await Category.find().select('name slug').sort({ createdAt: 1, name: 1 }).lean() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'No se pudieron cargar las categorías.' }, { status: 500 });
  }
}
export async function POST(request) {
  if ((await getServerSession(authOptions))?.user?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  let category;
  try { category = categoryInput((await request.json()).name); }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }); }
  try {
    await connectDB();
    await seedCategories();
    const created = await Category.create(category);
    return NextResponse.json({ category: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.code === 11000 ? 'Esa categoría ya existe.' : 'No se pudo guardar la categoría.' }, { status: error.code === 11000 ? 409 : 500 });
  }
}
