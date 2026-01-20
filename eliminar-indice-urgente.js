// eliminar-indice-urgente.js
// Script para eliminar el índice category_1 que causa E11000

const mongoose = require('mongoose');

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://nicolasurbainski:qK8dIzFd80VUaMPD@cluster0.gcwao.mongodb.net/haize-staging?retryWrites=true&w=majority';

async function eliminarIndice() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('sizeguides');

    // Listar índices actuales
    console.log('\n📋 Índices actuales:');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Buscar el índice problemático
    const hasIndex = indexes.some((idx) => idx.name === 'category_1');

    if (hasIndex) {
      console.log('\n⚠️  Encontrado índice problemático: category_1');
      console.log('🗑️  Eliminando índice...');

      await collection.dropIndex('category_1');

      console.log('✅ Índice category_1 eliminado exitosamente');
    } else {
      console.log('\n✅ El índice category_1 no existe (ya está bien)');
    }

    // Verificar índices después
    console.log('\n📋 Índices después de la eliminación:');
    const indexesAfter = await collection.indexes();
    console.log(JSON.stringify(indexesAfter, null, 2));

    // Contar documentos con category null
    console.log('\n📊 Estadísticas:');
    const nullCount = await collection.countDocuments({ category: null });
    const totalCount = await collection.countDocuments({});
    console.log(`Total de guías: ${totalCount}`);
    console.log(`Guías con category: null: ${nullCount}`);

    console.log('\n✅ Proceso completado exitosamente');
    console.log('\n🎯 Ahora puedes crear guías de talles sin problemas');
  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
    process.exit(0);
  }
}

eliminarIndice();
