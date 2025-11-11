// scripts/cleanClerkData.js
// Script para eliminar completamente los datos de Clerk de MongoDB

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    '❌ ERROR: No se encontró MONGODB_URI en las variables de entorno'
  );
  console.log('Asegúrate de tener un archivo .env.local con:');
  console.log('MONGODB_URI=tu_uri_de_mongodb');
  process.exit(1);
}

async function cleanClerkData() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    console.log(
      'URI:',
      MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
    ); // Ocultar credenciales

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // 1. Verificar usuarios antes de la limpieza
    console.log('📊 Estado ANTES de la limpieza:');
    const totalUsersBefore = await usersCollection.countDocuments();
    const usersWithClerkId = await usersCollection.countDocuments({
      clerkId: { $exists: true },
    });
    console.log(`   Total de usuarios: ${totalUsersBefore}`);
    console.log(`   Usuarios con clerkId: ${usersWithClerkId}`);

    // 2. Listar índices actuales
    console.log('\n📑 Índices actuales:');
    const indexes = await usersCollection.listIndexes().toArray();
    const hasClerkIdIndex = indexes.some((idx) => idx.name === 'clerkId_1');
    indexes.forEach((index) => {
      const marker = index.name === 'clerkId_1' ? '❌' : '✅';
      console.log(`   ${marker} ${index.name}:`, JSON.stringify(index.key));
    });

    // 3. Eliminar el índice de clerkId
    console.log('\n🗑️  Eliminando índice clerkId_1...');
    if (hasClerkIdIndex) {
      try {
        await usersCollection.dropIndex('clerkId_1');
        console.log('✅ Índice clerkId_1 eliminado correctamente');
      } catch (error) {
        if (error.code === 27) {
          console.log('ℹ️  Índice clerkId_1 no existe (ya fue eliminado)');
        } else {
          console.error('⚠️  Error al eliminar índice:', error.message);
        }
      }
    } else {
      console.log('ℹ️  Índice clerkId_1 no existe (ya fue eliminado)');
    }

    // 4. Eliminar el campo clerkId de todos los usuarios
    console.log('\n🧹 Eliminando campo clerkId de todos los usuarios...');
    const updateResult = await usersCollection.updateMany(
      { clerkId: { $exists: true } },
      { $unset: { clerkId: '' } }
    );
    console.log(
      `✅ Campo clerkId eliminado de ${updateResult.modifiedCount} usuarios`
    );

    // 5. Verificar usuarios después de la limpieza
    console.log('\n📊 Estado DESPUÉS de la limpieza:');
    const totalUsersAfter = await usersCollection.countDocuments();
    const usersWithClerkIdAfter = await usersCollection.countDocuments({
      clerkId: { $exists: true },
    });
    const googleUsers = await usersCollection.countDocuments({
      googleAuth: true,
    });
    const credentialUsers = await usersCollection.countDocuments({
      googleAuth: false,
    });
    const verifiedUsers = await usersCollection.countDocuments({
      isVerified: true,
    });

    console.log(`   Total de usuarios: ${totalUsersAfter}`);
    console.log(
      `   Usuarios con clerkId: ${usersWithClerkIdAfter} (debería ser 0)`
    );
    console.log(`   Usuarios con Google Auth: ${googleUsers}`);
    console.log(`   Usuarios con credenciales: ${credentialUsers}`);
    console.log(`   Usuarios verificados: ${verifiedUsers}`);

    // 6. Verificar usuarios de Google sin googleId
    const googleUsersWithoutId = await usersCollection.countDocuments({
      googleAuth: true,
      googleId: { $exists: false },
    });

    if (googleUsersWithoutId > 0) {
      console.log(
        `\n⚠️  ADVERTENCIA: ${googleUsersWithoutId} usuarios con googleAuth=true pero sin googleId`
      );
      console.log(
        '   Estos usuarios podrían tener problemas al iniciar sesión'
      );
      console.log('   Considera eliminarlos o actualizarlos manualmente');

      // Mostrar estos usuarios
      const problematicUsers = await usersCollection
        .find({ googleAuth: true, googleId: { $exists: false } })
        .project({ email: 1, name: 1, googleAuth: 1 })
        .toArray();

      console.log('\n   Usuarios problemáticos:');
      problematicUsers.forEach((user) => {
        console.log(`   - ${user.email} (${user.name})`);
      });
    } else {
      console.log('\n✅ Todos los usuarios de Google tienen googleId');
    }

    // 7. Listar índices finales
    console.log('\n📑 Índices finales:');
    const finalIndexes = await usersCollection.listIndexes().toArray();
    finalIndexes.forEach((index) => {
      console.log(`   ✅ ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 LIMPIEZA COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(60));

    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('1. Reinicia tu servidor de desarrollo (npm run dev)');
    console.log('2. Intenta iniciar sesión con Google nuevamente');
    console.log('3. El error E11000 duplicate key no debería aparecer más');

    if (googleUsersWithoutId > 0) {
      console.log(
        '\n⚠️  NOTA: Tienes usuarios con googleAuth pero sin googleId.'
      );
      console.log('   Considera ejecutar este comando para limpiarlos:');
      console.log(
        '   db.users.deleteMany({ googleAuth: true, googleId: { $exists: false } })'
      );
    }
  } catch (error) {
    console.error('\n❌ ERROR durante la limpieza:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar el script
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     LIMPIEZA DE DATOS DE CLERK - Haize E-commerce         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

cleanClerkData().catch((error) => {
  console.error('\n💥 Error fatal:', error.message);
  process.exit(1);
});
