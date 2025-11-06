// =============================================================================
// API para verificar configuración de email
// Archivo: src/app/api/admin/test-email-config/route.js
// =============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createEmailTransporter } from "@/lib/email-config";

export async function POST(request) {
  try {
    // Verificar que es admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Verificar variables de entorno
    const requiredVars = ["EMAIL_SERVICE", "EMAIL_USER", "EMAIL_PASS"];
    const missing = requiredVars.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Variables de entorno faltantes: ${missing.join(", ")}`,
        suggestions: [
          "Verifica que EMAIL_USER y EMAIL_PASS estén configurados en .env.local",
          "Si usas Gmail, usa una contraseña de aplicación",
          "Asegúrate de que EMAIL_SERVICE esté configurado (gmail, outlook, etc.)",
        ],
      });
    }

    // Intentar crear transportador
    try {
      const transporter = await createEmailTransporter();

      // Verificar conexión
      await transporter.verify();

      return NextResponse.json({
        success: true,
        message: "Configuración de email válida",
        config: {
          service: process.env.EMAIL_SERVICE,
          user: process.env.EMAIL_USER,
          adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        },
      });
    } catch (transportError) {
      console.error("Error en transportador:", transportError);

      let errorMessage = "Error de configuración del transportador";
      let suggestions = [];

      if (transportError.message.includes("Invalid login")) {
        errorMessage = "Credenciales inválidas";
        suggestions = [
          "Verifica que EMAIL_USER sea correcto",
          "Si usas Gmail, necesitas una contraseña de aplicación",
          "Activa la autenticación de 2 factores en Gmail",
        ];
      } else if (transportError.message.includes("ENOTFOUND")) {
        errorMessage = "Error de conexión a servidor de email";
        suggestions = [
          "Verifica tu conexión a internet",
          "Comprueba que EMAIL_SERVICE sea válido",
        ];
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        suggestions,
        details: transportError.message,
      });
    }
  } catch (error) {
    console.error("Error verificando configuración:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
