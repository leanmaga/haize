// app/api/admin/newsletter/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

export async function GET(request) {
  try {
    // Verificar autenticación (puedes ajustar según tu sistema de auth)
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    await dbConnect();

    // Filtro por status
    let filter = {};
    if (status !== 'all') {
      filter.status = status;
    }

    // Obtener suscriptores
    const subscribers = await Newsletter.find(filter)
      .select('-confirmationToken -metadata')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Contar total
    const total = await Newsletter.countDocuments(filter);

    // Estadísticas
    const stats = await Newsletter.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        confirmed: statsMap.confirmed || 0,
        pending: statsMap.pending || 0,
        unsubscribed: statsMap.unsubscribed || 0,
        total: stats.reduce((acc, stat) => acc + stat.count, 0),
      },
    });
  } catch (error) {
    console.error('Error al obtener suscriptores:', error);
    return NextResponse.json(
      { error: 'Error al obtener suscriptores' },
      { status: 500 }
    );
  }
}

// Endpoint para exportar emails (para usar en plataformas de email marketing)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { action } = await request.json();

    await dbConnect();

    if (action === 'export') {
      // Exportar solo emails confirmados
      const subscribers = await Newsletter.find({ status: 'confirmed' })
        .select('email')
        .lean();

      const emails = subscribers.map((s) => s.email);

      return NextResponse.json({
        emails,
        count: emails.length,
        exportDate: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error en acción admin:', error);
    return NextResponse.json(
      { error: 'Error al procesar acción' },
      { status: 500 }
    );
  }
}
