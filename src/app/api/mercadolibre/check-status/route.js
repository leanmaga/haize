import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import MercadoLibreConfig from '@/models/MercadoLibreConfig';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  await connectDB();
  const config = await MercadoLibreConfig.findOne({ isActive: true }).lean();
  return NextResponse.json({ isConnected: Boolean(config), sellerId: config?.sellerId, expiresAt: config?.expiresAt });
}
