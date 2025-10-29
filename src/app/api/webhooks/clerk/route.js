import { Webhook } from 'svix';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  console.log('🔔 Webhook recibido en /api/webhooks/clerk');

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('❌ CLERK_WEBHOOK_SECRET no está definido');
    return new Response('Error: WEBHOOK_SECRET no configurado', {
      status: 500,
    });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Headers de Svix faltantes');
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
    console.log('✅ Firma del webhook verificada');
  } catch (err) {
    console.error('❌ Error verificando webhook:', err.message);
    return new Response('Error: Verification failed', { status: 400 });
  }

  await connectDB();

  const eventType = evt.type;
  const { id, email_addresses, username, first_name, last_name, image_url } =
    evt.data;

  console.log(`📥 Evento recibido: ${eventType}`);
  console.log(`👤 Usuario ID: ${id}`);

  try {
    switch (eventType) {
      case 'user.created':
        const newUser = await User.create({
          clerkId: id,
          email: email_addresses[0].email_address,
          username: username || email_addresses[0].email_address.split('@')[0],
          firstName: first_name || '',
          lastName: last_name || '',
          imageUrl: image_url || '',
          role: 'user',
        });
        console.log('✅ Usuario creado en MongoDB:', newUser._id);
        break;

      case 'user.updated':
        const updatedUser = await User.findOneAndUpdate(
          { clerkId: id },
          {
            email: email_addresses[0].email_address,
            username:
              username || email_addresses[0].email_address.split('@')[0],
            firstName: first_name || '',
            lastName: last_name || '',
            imageUrl: image_url || '',
          },
          { new: true }
        );
        console.log('✅ Usuario actualizado en MongoDB:', updatedUser?._id);
        break;

      case 'user.deleted':
        const deletedUser = await User.findOneAndDelete({ clerkId: id });
        console.log('✅ Usuario eliminado de MongoDB:', deletedUser?._id);
        break;

      default:
        console.log(`⚠️ Evento no manejado: ${eventType}`);
    }

    return new Response('Webhook procesado exitosamente', { status: 200 });
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
