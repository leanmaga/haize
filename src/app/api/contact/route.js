import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contact from '@/models/Contact';
import { Resend } from 'resend';

// Inicializar Resend (solo si hay API key)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email donde recibirás las notificaciones
const NOTIFICATION_EMAIL =
  process.env.CONTACT_NOTIFICATION_EMAIL || 'tu-email@ejemplo.com';

// Mapear valores de motivo a texto legible
const motivoLabels = {
  'atencion-cliente': 'Atención al cliente',
  cambios: 'Cambios - (Compra Online)',
  marketing: 'Marketing',
  corporativo: 'Atención Corporativa y Vtas. Mayoristas',
};

// POST /api/contact - Recibir nueva consulta
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      motivo,
      nombreApellido,
      telefono,
      email,
      localidad,
      pais,
      comentarios,
    } = body;

    // Validación de campos obligatorios
    if (
      !motivo ||
      !nombreApellido ||
      !telefono ||
      !email ||
      !localidad ||
      !pais
    ) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    await connectDB();

    // Crear el documento de contacto
    const contactData = {
      motivo: motivoLabels[motivo] || motivo,
      nombreApellido,
      telefono,
      email,
      localidad,
      pais,
      comentarios: comentarios || '',
      estado: 'pendiente',
    };

    const newContact = await Contact.create(contactData);
    console.log('✅ Consulta guardada en MongoDB:', newContact._id);

    // Enviar email de notificación si Resend está configurado
    if (resend) {
      try {
        await resend.emails.send({
          from: 'HAIZE <noreply@haize.com.ar>',
          to: [NOTIFICATION_EMAIL],
          subject: `Nueva consulta de ${nombreApellido} - ${contactData.motivo}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #000; color: #fff; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; }
                .content { padding: 30px; background: #f9f9f9; }
                .field { margin-bottom: 20px; }
                .label { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 5px; }
                .value { font-size: 16px; color: #000; }
                .comments { background: #fff; padding: 15px; border-left: 3px solid #000; margin-top: 20px; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                .badge { display: inline-block; background: #000; color: #fff; padding: 5px 15px; font-size: 12px; border-radius: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>HAIZE</h1>
                  <p style="margin: 10px 0 0; font-size: 14px;">Nueva consulta recibida</p>
                </div>
                
                <div class="content">
                  <div style="margin-bottom: 25px;">
                    <span class="badge">${contactData.motivo}</span>
                  </div>
                  
                  <div class="field">
                    <div class="label">Nombre y Apellido</div>
                    <div class="value">${nombreApellido}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Email</div>
                    <div class="value"><a href="mailto:${email}" style="color: #000;">${email}</a></div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Teléfono</div>
                    <div class="value"><a href="tel:${telefono}" style="color: #000;">${telefono}</a></div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Ubicación</div>
                    <div class="value">${localidad}, ${pais}</div>
                  </div>
                  
                  ${
                    comentarios
                      ? `
                  <div class="comments">
                    <div class="label">Comentarios</div>
                    <div class="value" style="white-space: pre-wrap;">${comentarios}</div>
                  </div>
                  `
                      : ''
                  }
                </div>
                
                <div class="footer">
                  <p>Este mensaje fue enviado desde el formulario de contacto de HAIZE</p>
                  <p>${new Date().toLocaleString('es-AR', {
                    timeZone: 'America/Argentina/Buenos_Aires',
                  })}</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        console.log('✅ Email de notificación enviado a:', NOTIFICATION_EMAIL);
      } catch (emailError) {
        console.error(
          '⚠️ Error al enviar email (la consulta se guardó igual):',
          emailError
        );
        // No fallamos la request si el email falla - la consulta ya está guardada
      }
    } else {
      console.log('⚠️ Resend no configurado - email no enviado');
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Consulta enviada exitosamente',
        id: newContact._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error al procesar formulario de contacto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/contact - Obtener todas las consultas (para admin)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    // Filtros
    const query = {};
    if (estado && estado !== 'todos') {
      query.estado = estado;
    }

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments(query),
    ]);

    // Contar por estado
    const counts = await Contact.aggregate([
      { $group: { _id: '$estado', count: { $sum: 1 } } },
    ]);

    const estadoCounts = {
      pendiente: 0,
      leido: 0,
      respondido: 0,
      archivado: 0,
      total: 0,
    };

    counts.forEach((c) => {
      estadoCounts[c._id] = c.count;
      estadoCounts.total += c.count;
    });

    return NextResponse.json({
      contacts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      counts: estadoCounts,
    });
  } catch (error) {
    console.error('❌ Error al obtener consultas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/contact - Actualizar estado de una consulta
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, estado, notasInternas } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de consulta requerido' },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData = {};
    if (estado) updateData.estado = estado;
    if (notasInternas !== undefined) updateData.notasInternas = notasInternas;

    const updatedContact = await Contact.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedContact) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      contact: updatedContact,
    });
  } catch (error) {
    console.error('❌ Error al actualizar consulta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/contact - Eliminar una consulta
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de consulta requerido' },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return NextResponse.json(
        { error: 'Consulta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Consulta eliminada correctamente',
    });
  } catch (error) {
    console.error('❌ Error al eliminar consulta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
