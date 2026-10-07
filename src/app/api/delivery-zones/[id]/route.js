import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import DeliveryZone from '@/models/DeliveryZone';

export async function PUT(request, { params }) {
  try { const session = await getServerSession(authOptions); if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 }); await connectDB(); const data = await request.json(); if (!data.name || !data.slug || !data.geometry?.type || !Array.isArray(data.geometry.coordinates)) return NextResponse.json({ error: 'Datos de zona incompletos' }, { status: 400 }); const zone = await DeliveryZone.findByIdAndUpdate(params.id, data, { new: true, runValidators: true }); if (!zone) return NextResponse.json({ error: 'Zona no encontrada' }, { status: 404 }); return NextResponse.json(zone); }
  catch (error) { return NextResponse.json({ error: error.code === 11000 ? 'El slug ya existe' : error.message }, { status: error.code === 11000 ? 409 : 500 }); }
}

export async function DELETE(request, { params }) {
  try { const session = await getServerSession(authOptions); if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 }); await connectDB(); const zone = await DeliveryZone.findByIdAndDelete(params.id); if (!zone) return NextResponse.json({ error: 'Zona no encontrada' }, { status: 404 }); return NextResponse.json({ success: true }); }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
