import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      variables: {
        EMAIL_SERVICE: process.env.EMAIL_SERVICE || '❌ NO CONFIGURADO',
        EMAIL_USER: process.env.EMAIL_USER || '❌ NO CONFIGURADO',
        EMAIL_PASS: process.env.EMAIL_PASS
          ? '✅ CONFIGURADO (oculto)'
          : '❌ NO CONFIGURADO',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || '❌ NO CONFIGURADO',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
