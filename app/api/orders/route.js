import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

// GET - Obtener todas las órdenes
export async function GET() {
  try {
    await connectDB();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Buscar el usuario en la base de datos
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    let orders;

    // Si es admin, obtener todas las órdenes
    if (user.role === 'admin') {
      orders = await Order.find({})
        .populate('user', 'firstName lastName email')
        .populate('items.product', 'title images')
        .sort({ createdAt: -1 });
    } else {
      // Si es usuario normal, solo sus órdenes
      orders = await Order.find({ user: user._id })
        .populate('items.product', 'title images')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Error al obtener órdenes', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear nueva orden
export async function POST(request) {
  try {
    await connectDB();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Buscar el usuario en la base de datos
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const data = await request.json();

    // Validar datos requeridos
    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { message: 'La orden debe tener al menos un producto' },
        { status: 400 }
      );
    }

    if (!data.shippingAddress) {
      return NextResponse.json(
        { message: 'La dirección de envío es requerida' },
        { status: 400 }
      );
    }

    // Crear la orden
    const order = await Order.create({
      user: user._id,
      items: data.items,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod || 'mercadopago',
      subtotal: data.subtotal || 0,
      shippingPrice: data.shippingPrice || 0,
      taxPrice: data.taxPrice || 0,
      totalPrice: data.totalPrice || 0,
      status: 'pending',
    });

    // Agregar la orden al usuario
    user.orders.push(order._id);
    await user.save();

    // Poblar la orden con los datos del producto
    await order.populate('items.product', 'title images');

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'Error al crear orden', error: error.message },
      { status: 500 }
    );
  }
}
