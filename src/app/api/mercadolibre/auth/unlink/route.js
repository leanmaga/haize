import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import MercadoLibreConfig from '@/models/MercadoLibreConfig';

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  await connectDB();
  await MercadoLibreConfig.updateMany({ isActive: true }, { isActive: false });
  return NextResponse.json({ success: true });
}
