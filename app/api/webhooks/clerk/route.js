import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
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
  } catch (err) {
    console.error('❌ Error verificando webhook:', err.message);
    return new Response('Error: Verification failed', { status: 400 });
  }

  await connectDB();

  const eventType = evt.type;
  const { id, email_addresses, username, first_name, last_name, image_url } =
    evt.data;

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

        // 🔥 Sincronizar publicMetadata si es admin
        if (newUser.role === 'admin') {
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
              role: 'admin',
            },
          });
          console.log(`✅ Usuario ${id} sincronizado como admin en Clerk`);
        }
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

        // 🔥 Sincronizar publicMetadata cuando se actualiza
        if (updatedUser) {
          const currentMetadata =
            (await clerkClient.users.getUser(id)).publicMetadata || {};

          // Solo actualizar si el rol ha cambiado
          if (currentMetadata.role !== updatedUser.role) {
            await clerkClient.users.updateUserMetadata(id, {
              publicMetadata: {
                role: updatedUser.role,
              },
            });
            console.log(
              `✅ Usuario ${id} sincronizado con rol: ${updatedUser.role}`
            );
          }
        }
        break;

      case 'user.deleted':
        await User.deleteOne({ clerkId: id });
        console.log(`✅ Usuario ${id} eliminado de MongoDB`);
        break;
    }

    return new Response('Webhook procesado exitosamente', { status: 200 });
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
