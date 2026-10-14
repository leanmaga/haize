import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  try {
    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select('name email phone savedShippingInfo').lean();
    if (!user) return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    return NextResponse.json({
      shippingInfo: user.savedShippingInfo || { name: user.name, email: user.email, phone: user.phone },
      hasSavedShippingInfo: !!user.savedShippingInfo,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ message: 'No se pudieron cargar tus datos de envío.' }, { status: 500 });
  }
}
