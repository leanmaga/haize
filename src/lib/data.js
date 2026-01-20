import connectDB from './db';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order';

// Función para obtener productos destacados
export async function getFeaturedProducts() {
  try {
    console.log('Conectando a la base de datos...');
    await connectDB();
    console.log('Conexión exitosa, buscando productos...');

    const featuredProducts = await Product.find({ featured: true }).limit(8);
    console.log('Productos encontrados:', featuredProducts.length);

    if (featuredProducts.length === 0) {
      const regularProducts = await Product.find().limit(8);
      console.log('Productos regulares encontrados:', regularProducts.length);
      return JSON.parse(JSON.stringify(regularProducts));
    }

    return JSON.parse(JSON.stringify(featuredProducts));
  } catch (error) {
    console.error('Error completo:', error);
    throw new Error(`Error al obtener productos destacados: ${error.message}`);
  }
}

// Función para obtener todos los productos con filtros opcionales
export async function getProducts(options = {}) {
  try {
    await connectDB();

    const {
      category,
      sort = 'createdAt',
      order = -1,
      limit = 100,
      page = 1,
    } = options;

    const skip = (page - 1) * parseInt(limit);
    const sortOptions = { [sort]: order };

    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    return {
      products: JSON.parse(JSON.stringify(products)),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return { products: [], pagination: { total: 0, page: 1, pages: 0 } };
  }
}

// // Función para obtener un producto por ID
// export async function getProductById(id) {
//   try {
//     await connectDB();

//     // ✅ CAMBIO: Usar .lean() para mejor serialización
//     const product = await Product.findById(id).lean();

//     if (!product) {
//       return null;
//     }

//     // ✅ CAMBIO: Asegurar que variants existe como array
//     if (!product.variants) {
//       product.variants = [];
//     }

//     // Asegurar que sizes existe como array (backward compatibility)
//     if (!product.sizes) {
//       product.sizes = [];
//     }

//     // Asegurar que colors existe como array (backward compatibility)
//     if (!product.colors) {
//       product.colors = [];
//     }

//     return JSON.parse(JSON.stringify(product));
//   } catch (error) {
//     console.error('Error al obtener producto por ID:', error);
//     return null;
//   }
// }

export async function getOrderById(id) {
  try {
    console.log('🔍 getOrderById llamada con ID:', id);

    // Validar que el ID no esté vacío
    if (!id) {
      console.log('❌ ID no proporcionado');
      return null;
    }

    // Validar que el ID tenga formato válido de MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ ID no es un ObjectId válido:', id);
      return null;
    }

    // Conectar a la base de datos
    console.log('🔌 Conectando a la base de datos...');
    await connectDB();
    console.log('✅ Conectado a la base de datos');

    // Buscar la orden
    console.log('🔍 Buscando orden con ID:', id);
    const order = await Order.findById(id).lean(); // .lean() para mejor performance

    if (!order) {
      console.log('❌ Orden no encontrada para ID:', id);
      return null;
    }

    console.log('✅ Orden encontrada:', order._id);

    // Convertir el objeto a JSON serializable
    const serializedOrder = JSON.parse(JSON.stringify(order));

    return serializedOrder;
  } catch (error) {
    console.error('❌ Error completo en getOrderById:', {
      message: error.message,
      stack: error.stack,
      id: id,
    });

    // En lugar de lanzar el error, retornar null
    // Esto evita que la página se rompa
    return null;
  }
}

// Función para obtener órdenes de un usuario
export async function getUserOrders(userId) {
  try {
    await connectDB();
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error('Error al obtener órdenes del usuario:', error);
    return [];
  }
}

// Función para obtener todas las órdenes (para admin)
export async function getAllOrders() {
  try {
    await connectDB();
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error('Error al obtener todas las órdenes:', error);
    return [];
  }
}

// Función para obtener todos los usuarios (para admin)
export async function getAllUsers() {
  try {
    await connectDB();
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
}

// Obtener productos relacionados por categoría y excluyendo el producto actual
export async function getRelatedProducts(
  category,
  currentProductId,
  limit = 3,
) {
  await connectDB();

  try {
    // Buscar productos de la misma categoría, excluyendo el actual
    const relatedProducts = await Product.find({
      category: category,
      _id: { $ne: currentProductId },
      stock: { $gt: 0 }, // Solo productos con stock
    })
      .sort({ featured: -1 }) // Priorizar productos destacados
      .limit(limit);

    return JSON.parse(JSON.stringify(relatedProducts));
  } catch (error) {
    console.error('Error al obtener productos relacionados:', error);
    return [];
  }
}
// Función para obtener un producto por ID CON GUÍA DE TALLES
export async function getProductById(id) {
  try {
    await connectDB();

    // ✅ POPULATE sizeGuide para traer medidas completas
    const product = await Product.findById(id)
      .populate('sizeGuide') // ← NUEVO: Trae la guía completa
      .lean();

    if (!product) {
      return null;
    }

    // ✅ Asegurar que variants existe como array
    if (!product.variants) {
      product.variants = [];
    }

    // Asegurar que sizes existe como array (backward compatibility)
    if (!product.sizes) {
      product.sizes = [];
    }

    // Asegurar que colors existe como array (backward compatibility)
    if (!product.colors) {
      product.colors = [];
    }

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    return null;
  }
}
