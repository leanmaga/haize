import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

// GET - Obtener las órdenes del usuario o todas las órdenes (para admin)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    await connectDB();

    let orders;

    // Si es admin, obtener todas las órdenes, sino solo las del usuario
    if (session.user.role === "admin") {
      orders = await Order.find()
        .populate("user", "name email phone")
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: session.user.id }).sort({
        createdAt: -1,
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return NextResponse.json(
      { message: "Error al obtener las órdenes" },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva orden
export async function POST() {
  // Endpoint legado sin consumidores. Se bloquea para que no exista una vía
  // alternativa que acepte importes enviados por el navegador.
  return NextResponse.json(
    { message: 'Usá el endpoint seguro /api/orders' },
    { status: 410 },
  );
}
