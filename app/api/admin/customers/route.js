import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';

// GET - Obtener todos los clientes
export async function GET() {
  try {
    await connectDB();

    const customers = await User.find({ role: 'user' })
      .populate('orders')
      .sort({ createdAt: -1 });

    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { message: 'Error al obtener clientes', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear cliente (admin)
export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();

    const customer = await User.create({
      ...data,
      role: 'user',
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { message: 'Error al crear cliente', error: error.message },
      { status: 500 }
    );
  }
}
