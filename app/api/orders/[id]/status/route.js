import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

// PATCH - Actualizar estado de la orden (solo admin)
export async function PATCH(request, context) {
  try {
    await connectDB();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Verificar que sea admin
    const user = await User.findOne({ clerkId: userId });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Solo los administradores pueden actualizar órdenes' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const { status } = await request.json();

    // Validar estado
    const validStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Estado inválido' }, { status: 400 });
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { message: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar estado
    order.status = status;

    // Si está entregada, marcar como entregada
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();

    // Poblar con datos del usuario y productos
    await order.populate('user', 'firstName lastName email');
    await order.populate('items.product', 'title images');

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { message: 'Error al actualizar estado', error: error.message },
      { status: 500 }
    );
  }
}
