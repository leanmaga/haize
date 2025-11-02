import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

// GET - Obtener una orden por ID
export async function GET(request, context) {
  try {
    await connectDB();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await context.params;

    const order = await Order.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'title images');

    if (!order) {
      return NextResponse.json(
        { message: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el usuario sea el dueño de la orden o sea admin
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (
      user.role !== 'admin' &&
      order.user.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { message: 'No tienes permiso para ver esta orden' },
        { status: 403 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'Error al obtener orden', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar orden
export async function DELETE(request, context) {
  try {
    await connectDB();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await context.params;

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { message: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (
      user.role !== 'admin' &&
      order.user.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { message: 'No tienes permiso para cancelar esta orden' },
        { status: 403 }
      );
    }

    // Cambiar estado a cancelado
    order.status = 'cancelled';
    await order.save();

    return NextResponse.json(
      { message: 'Orden cancelada correctamente', order },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { message: 'Error al cancelar orden', error: error.message },
      { status: 500 }
    );
  }
}
