// src/app/api/users/orders/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(request, { params }) {
  try {
    // Verificar la sesión del usuario
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Obtener el ID de la orden desde params
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: 'ID de orden no proporcionado' },
        { status: 400 },
      );
    }

    // Conectar a la base de datos
    await connectDB();

    // Buscar al usuario por email
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 },
      );
    }

    // Buscar la orden
    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json(
        { message: 'Orden no encontrada' },
        { status: 404 },
      );
    }

    // Verificar que la orden pertenezca al usuario (a menos que sea admin)
    if (
      session.user.role !== 'admin' &&
      order.user.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { message: 'No autorizado para ver esta orden' },
        { status: 403 },
      );
    }

    // Devolver la orden
    return NextResponse.json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error('Error al obtener orden:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener la orden: ' + error.message,
      },
      { status: 500 },
    );
  }
}

// Método OPTIONS para CORS
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
