import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import DeliveryZone from '@/models/DeliveryZone';
import { zonePayload } from '@/lib/delivery-coverage';

const admin = (s) => s?.user?.role === 'admin';
const validGeometry = (g) => g && ['Polygon', 'MultiPolygon'].includes(g.type) && Array.isArray(g.coordinates);

export async function GET() {
  try { await connectDB(); const zones = await DeliveryZone.find({ isActive: true }).sort({ name: 1 }).lean(); return NextResponse.json({ type: 'FeatureCollection', features: zones.map((z) => ({ type: 'Feature', id: String(z._id), properties: { name: z.name, slug: z.slug, detail: z.detail, cutoffTime: z.cutoffTime, municipalityId: z.municipalityId, shippingPrice: z.shippingPrice ?? null }, geometry: z.geometry })) }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return NextResponse.json({ error: 'No se pudieron cargar las zonas', details: error.message }, { status: 500 }); }
}

export async function POST(request) {
  try { if (!admin(await getServerSession(authOptions))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 }); await connectDB(); let data; try { data = zonePayload(await request.json()); } catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }); } if (!data.name || !data.slug || !validGeometry(data.geometry)) return NextResponse.json({ error: 'Nombre, slug y geometría GeoJSON son requeridos' }, { status: 400 }); return NextResponse.json(await DeliveryZone.create(data), { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error.code === 11000 ? 'El slug ya existe' : error.message }, { status: error.code === 11000 ? 409 : 500 }); }
}
