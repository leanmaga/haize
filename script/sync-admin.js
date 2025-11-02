// scripts/sync-admin.js
import 'dotenv/config';
import { clerkClient } from '@clerk/clerk-sdk-node';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

const UserSchema = new mongoose.Schema({
  clerkId: String,
  email: String,
  role: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function syncAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const adminUsers = await User.find({ role: 'admin' });
    console.log(`📋 Encontrados ${adminUsers.length} usuarios admin`);

    for (const user of adminUsers) {
      console.log(`\n🔄 Sincronizando: ${user.email} (${user.clerkId})`);

      await clerkClient.users.updateUserMetadata(user.clerkId, {
        publicMetadata: {
          role: 'admin',
        },
      });

      console.log('Sincronizado exitosamente');
    }

    console.log('Sincronización completada');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncAdmin();
