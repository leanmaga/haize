import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import DeliveryZone from '@/models/DeliveryZone';

export async function GET() { const session = await getServerSession(authOptions); if (session?.user?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 }); await connectDB(); return NextResponse.json({ zones: await DeliveryZone.find().sort({ name: 1 }).lean() }); }
