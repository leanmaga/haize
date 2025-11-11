// scripts/fixGoogleUsers.js
// Script para arreglar usuarios de Google que no tienen googleId

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    '❌ ERROR: No se encontró MONGODB_URI en las variables de entorno'
  );
  process.exit(1);
}

async function fixGoogleUsers() {
  try {
    console.log(
      '╔════════════════════════════════════════════════════════════╗'
    );
    console.log(
      '║     ARREGLAR USUARIOS DE GOOGLE - Haize E-commerce        ║'
    );
    console.log(
      '╚════════════════════════════════════════════════════════════╝\n'
    );

    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Buscar usuarios problemáticos
    const problematicUsers = await usersCollection
      .find({ googleAuth: true, googleId: { $exists: false } })
      .toArray();

    console.log(
      `📊 Usuarios con googleAuth pero sin googleId: ${problematicUsers.length}\n`
    );

    if (problematicUsers.length === 0) {
      console.log('✅ No hay usuarios problemáticos. Todo está bien.');
      return;
    }

    // Mostrar usuarios y pedir confirmación
    console.log('👤 Usuarios encontrados:');
    problematicUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - ${user.name}`);
      console.log(`      ID: ${user._id}`);
      console.log(`      Creado: ${user.createdAt}`);
      console.log(`      Verificado: ${user.isVerified ? 'Sí' : 'No'}`);
      console.log(`      Google Auth: ${user.googleAuth ? 'Sí' : 'No'}`);
      console.log(`      Google ID: ${user.googleId || 'NO TIENE'}\n`);
    });

    console.log('\n🔄 OPCIONES:');
    console.log(
      '1. Eliminar estos usuarios (recomendado si son usuarios de prueba)'
    );
    console.log(
      '2. Convertirlos a usuarios de credenciales (remover googleAuth)'
    );
    console.log('3. Salir sin hacer cambios\n');

    // Para automatizar, vamos a ofrecer ambas opciones
    console.log(
      '⚠️  EJECUTANDO OPCIÓN 1 (Eliminar usuarios problemáticos)...\n'
    );

    // OPCIÓN 1: Eliminar usuarios
    const deleteResult = await usersCollection.deleteMany({
      googleAuth: true,
      googleId: { $exists: false },
    });

    console.log(`✅ Usuarios eliminados: ${deleteResult.deletedCount}`);

    // Verificar que no queden usuarios problemáticos
    const remainingProblematic = await usersCollection.countDocuments({
      googleAuth: true,
      googleId: { $exists: false },
    });

    console.log('\n📊 Verificación final:');
    const totalUsers = await usersCollection.countDocuments();
    const googleUsers = await usersCollection.countDocuments({
      googleAuth: true,
    });
    const googleUsersWithId = await usersCollection.countDocuments({
      googleAuth: true,
      googleId: { $exists: true },
    });

    console.log(`   Total de usuarios: ${totalUsers}`);
    console.log(`   Usuarios con Google Auth: ${googleUsers}`);
    console.log(`   Usuarios con Google Auth y googleId: ${googleUsersWithId}`);
    console.log(`   Usuarios problemáticos restantes: ${remainingProblematic}`);

    if (remainingProblematic === 0) {
      console.log(
        '\n✅ Todos los usuarios de Google ahora tienen googleId o fueron eliminados'
      );
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 CORRECCIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(60));

    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('1. Reinicia tu servidor de desarrollo (npm run dev)');
    console.log('2. Intenta iniciar sesión con Google');
    console.log('3. Se creará un nuevo usuario con googleId correctamente');
    console.log('4. Ya no deberías ver errores de E11000 duplicate key');
  } catch (error) {
    console.error('\n❌ ERROR durante la corrección:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar el script
fixGoogleUsers().catch((error) => {
  console.error('\n💥 Error fatal:', error.message);
  process.exit(1);
});
