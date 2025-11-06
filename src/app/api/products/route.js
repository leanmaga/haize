// app/api/products/route.js - API ESPECÍFICA PARA POLLERÍA (SIN isNearExpiration)
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";

// Función para obtener o crear el modelo Product
function getProductModel() {
  // Si el modelo ya existe, lo devolvemos
  if (mongoose.models.Product) {
    console.log("✅ Modelo Product ya existe en cache");
    return mongoose.models.Product;
  }

  // Si no existe, lo creamos dinámicamente
  console.log("🔧 Creando modelo Product dinámicamente");

  const productSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, "Por favor proporcione un título"],
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      // Precio de venta (precio principal en tienda) - OBLIGATORIO
      salePrice: {
        type: Number,
        required: [true, "Por favor proporcione el precio de venta"],
        min: [0, "El precio no puede ser negativo"],
      },
      // Precio promocional opcional
      promoPrice: {
        type: Number,
        default: 0,
        min: [0, "El precio promocional no puede ser negativo"],
      },
      // Costo interno (no se muestra en tienda) - OPCIONAL
      cost: {
        type: Number,
        min: [0, "El costo no puede ser negativo"],
        default: 0,
      },
      // Margen de ganancia (%) calculado o manual - OPCIONAL
      profitMargin: {
        type: Number,
        min: [0, "El margen no puede ser negativo"],
        max: [100, "El margen no puede exceder el 100%"],
        default: 0,
      },
      stock: {
        type: Number,
        min: [0, "El stock no puede ser negativo"],
        default: 0,
      },
      category: {
        type: String,
        required: [true, "Por favor proporcione una categoría"],
        enum: [
          // Categorías de pollería
          "pollos-enteros",
          "cortes-pollo",
          "huevos",
          "marinados-pollo",
          "embutidos-pollo",
          "menudencias-pollo",

          // Categorías de carnicería
          "cortes-vacunos",
          "cortes-cerdo",
          "cortes-cordero",
          "milanesas",
          "carne-picada",
          "embutidos-vacunos",
          "vísceras",

          // Categorías generales
          "productos-organicos",
          "preparados",
          "promociones",
          "otros",
        ],
      },

      // === CAMPOS ESPECÍFICOS PARA POLLERÍA ===

      // Peso del producto (en kg o gramos)
      weight: {
        type: Number,
        min: [0, "El peso no puede ser negativo"],
        default: 0,
      },
      weightUnit: {
        type: String,
        enum: ["kg", "g", "unidad", "docena"],
        default: "kg",
      },

      // Tipo de producto (más general que poultryType)
      productType: {
        type: String,
        enum: [
          // Productos avícolas
          "pollo",
          "gallina",
          "gallo",
          "pollito",
          "huevos",

          // Productos vacunos
          "carne-vacuna",
          "ternera",

          // Productos porcinos
          "cerdo",
          "lechón",

          // Productos ovinos
          "cordero",
          "oveja",

          // Productos procesados
          "embutido",
          "milanesa",
          "preparado",
          "otro",
        ],
        default: "pollo",
      },

      // Tipo de crianza/origen
      farmingType: {
        type: String,
        enum: [
          "convencional",
          "organico",
          "libre-pastoreo",
          "sin-antibioticos",
          "grass-fed", // Para carnes vacunas
          "grain-fed", // Para carnes vacunas
          "natural",
          "premium",
        ],
        default: "convencional",
      },

      // Estado del producto
      productState: {
        type: String,
        enum: [
          "fresco",
          "congelado",
          "marinado",
          "cocido",
          "ahumado",
          "madurado", // Para carnes vacunas
          "empanizado", // Para milanesas
          "procesado",
        ],
        default: "fresco",
      },

      // Para cortes específicos (ahora incluye vacunos)
      cut: {
        type: String,
        enum: [
          // Cortes de pollo
          "entero",
          "trozado",
          "pechuga",
          "muslo",
          "contramuslo",
          "ala",
          "cuadril-pollo",
          "rabadilla",
          "menudencias",

          // Cortes vacunos
          "tortuguita",
          "bola-de-lomo",
          "peceto",
          "cuadril",
          "colita-de-cuadril",
          "bife-ancho",
          "bife-angosto",
          "osobuco",
          "cuadrada",
          "picaña",
          "nalga",
          "paleta",
          "roast-beef",
          "lomo",
          "entraña",
          "vacío",
          "falda",
          "aguja",
          "cogote",

          // Cortes de cerdo
          "bondiola",
          "costeleta",
          "matambre-cerdo",
          "paleta-cerdo",

          // Otros
          "carne-picada",
          "milanesa-suprema",
          "milanesa-nalga",
          "milanesa-peceto",
          "otro",
        ],
        default: "entero",
      },

      // Rangos de peso para productos variables
      weightRange: {
        min: {
          type: Number,
          default: 0,
        },
        max: {
          type: Number,
          default: 0,
        },
      },

      // Información nutricional
      nutritionalInfo: {
        calories: {
          type: Number,
          default: 0,
        },
        protein: {
          type: Number,
          default: 0,
        },
        fat: {
          type: Number,
          default: 0,
        },
        // Por cada 100g
        per100g: {
          type: Boolean,
          default: true,
        },
      },

      // Ingredientes y alérgenos
      ingredients: {
        type: [String],
        default: [],
      },
      allergens: {
        type: [String],
        default: [],
      },

      // Certificaciones
      certifications: {
        type: [String],
        enum: [
          "organico",
          "halal",
          "kosher",
          "sin-antibioticos",
          "bienestar-animal",
          "grass-fed",
          "angus",
          "hereford",
          "wagyu",
          "premium",
          "natural",
        ],
        default: [],
      },

      // Grado de carne (para vacunos)
      meatGrade: {
        type: String,
        enum: ["premium", "primera", "segunda", "especial", "comercial", ""],
        default: "",
      },

      // Preparación especial (para milanesas, marinados, etc.)
      specialPreparation: {
        type: String,
        enum: [
          "panko",
          "tradicional",
          "marinado-especias",
          "marinado-vino",
          "adobado",
          "",
        ],
        default: "",
      },

      // Variantes para diferentes pesos o presentaciones
      variants: {
        type: [
          {
            weight: Number,
            weightUnit: {
              type: String,
              enum: ["kg", "g", "unidad", "docena"],
              default: "kg",
            },
            price: Number,
            stock: {
              type: Number,
              default: 0,
              min: 0,
            },
            sku: String,
          },
        ],
        default: [],
      },

      // Campos para fotos y presentación
      imageUrl: {
        type: String,
        required: [true, "Por favor proporcione una imagen"],
      },

      // Información adicional de Cloudinary para la imagen principal
      imageCloudinaryInfo: {
        publicId: String,
        format: String,
        width: Number,
        height: Number,
        bytes: Number,
      },

      // Imágenes adicionales
      additionalImages: {
        type: [
          {
            imageUrl: String,
            description: String, // Ej: "producto marinado", "corte específico"
            imageCloudinaryInfo: {
              publicId: String,
              format: String,
              width: Number,
              height: Number,
              bytes: Number,
            },
          },
        ],
        default: [],
      },

      featured: {
        type: Boolean,
        default: false,
      },

      // Disponibilidad por días de la semana
      availability: {
        monday: { type: Boolean, default: true },
        tuesday: { type: Boolean, default: true },
        wednesday: { type: Boolean, default: true },
        thursday: { type: Boolean, default: true },
        friday: { type: Boolean, default: true },
        saturday: { type: Boolean, default: true },
        sunday: { type: Boolean, default: true },
      },

      // Campos para valoraciones
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      numReviews: {
        type: Number,
        default: 0,
      },

      // SKU único para inventario
      sku: {
        type: String,
        unique: true,
        sparse: true, // Permite que sea único solo si existe
      },

      // Estado del producto (activo/inactivo)
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

  // Crear índices para mejorar el rendimiento de las consultas
  productSchema.index({ category: 1 });
  productSchema.index({ productType: 1 });
  productSchema.index({ farmingType: 1 });
  productSchema.index({ productState: 1 });
  productSchema.index({ featured: 1 });
  productSchema.index({ salePrice: 1 });
  productSchema.index({ isActive: 1 });
  productSchema.index({ "variants.weight": 1 });
  productSchema.index({ createdAt: -1 });

  // Virtual para verificar si tiene descuento
  productSchema.virtual("hasDiscount").get(function () {
    return this.promoPrice > 0 && this.promoPrice < this.salePrice;
  });

  // Virtual para calcular porcentaje de descuento
  productSchema.virtual("discountPercentage").get(function () {
    if (this.hasDiscount) {
      return Math.round(
        ((this.salePrice - this.promoPrice) / this.salePrice) * 100
      );
    }
    return 0;
  });

  // Virtual para precio efectivo (promocional si existe, sino el de venta)
  productSchema.virtual("effectivePrice").get(function () {
    return this.hasDiscount ? this.promoPrice : this.salePrice;
  });

  // Virtual para verificar si está disponible hoy
  productSchema.virtual("availableToday").get(function () {
    const today = new Date().getDay(); // 0 = domingo, 1 = lunes, etc.
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return this.availability[days[today]];
  });

  // Virtual para calcular precio por kg (si el producto se vende por peso)
  productSchema.virtual("pricePerKg").get(function () {
    if (this.weight > 0 && this.weightUnit === "kg") {
      return this.effectivePrice / this.weight;
    } else if (this.weight > 0 && this.weightUnit === "g") {
      return (this.effectivePrice / this.weight) * 1000;
    }
    return this.effectivePrice;
  });

  // Middleware pre-save para cálculos automáticos
  productSchema.pre("save", function (next) {
    // Si hay variantes, calcular el stock total
    if (this.variants && this.variants.length > 0) {
      this.stock = this.variants.reduce((total, variant) => {
        return total + (variant.stock || 0);
      }, 0);
    }

    // Si se proporciona costo y precio de venta pero no margen, calcularlo
    if (this.cost > 0 && this.salePrice > 0 && this.profitMargin === 0) {
      this.profitMargin = ((this.salePrice - this.cost) / this.salePrice) * 100;
    }

    // Generar SKU automático si no existe
    if (!this.sku) {
      const categoryCode = this.category.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      this.sku = `${categoryCode}-${timestamp}`;
    }

    next();
  });

  return mongoose.model("Product", productSchema);
}

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const category = searchParams.get("category");
    const productType =
      searchParams.get("productType") || searchParams.get("poultryType"); // Compatibilidad
    const farmingType = searchParams.get("farmingType");
    const productState = searchParams.get("productState");
    const featured = searchParams.get("featured");
    const minPrice = parseFloat(searchParams.get("minPrice")) || 0;
    const maxPrice = parseFloat(searchParams.get("maxPrice"));
    const availableToday = searchParams.get("availableToday");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    // Conectar a la base de datos
    await connectDB();

    // Obtener el modelo Product
    const Product = getProductModel();
    console.log("🔍 Modelo Product:", typeof Product, Product.name);

    // Construir query base
    let query = { isActive: true }; // Solo productos activos

    // Filtros específicos para pollería
    if (category && category !== "all") {
      query.category = category;
    }

    if (productType && productType !== "all") {
      query.productType = productType;
    }

    if (farmingType && farmingType !== "all") {
      query.farmingType = farmingType;
    }

    if (productState && productState !== "all") {
      query.productState = productState;
    }

    if (featured === "true") {
      query.featured = true;
    }

    // Filtro de precio
    if (minPrice > 0 || maxPrice) {
      query.salePrice = {};
      if (minPrice > 0) query.salePrice.$gte = minPrice;
      if (maxPrice) query.salePrice.$lte = maxPrice;
    }

    // Filtro de disponibilidad para hoy
    if (availableToday === "true") {
      const today = new Date().getDay();
      const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      query[`availability.${days[today]}`] = true;
    }

    // Búsqueda por texto
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    console.log("🔍 Query construido:", JSON.stringify(query, null, 2));

    // Get total count with filters
    const total = await Product.countDocuments(query);
    console.log("📊 Total productos encontrados:", total);

    // Get products with pagination and filters
    const products = await Product.find(query)
      .sort({ featured: -1, createdAt: -1 }) // Destacados primero, luego por fecha
      .skip(skip)
      .limit(limit);

    console.log("📦 Productos obtenidos:", products.length);

    // Agregar información calculada a cada producto
    const productsWithInfo = products.map((product) => {
      const productObj = product.toObject();

      // Agregar virtuals manualmente
      productObj.hasDiscount = product.hasDiscount;
      productObj.discountPercentage = product.discountPercentage;
      productObj.effectivePrice = product.effectivePrice;
      productObj.availableToday = product.availableToday;
      productObj.pricePerKg = product.pricePerKg;
      // ❌ REMOVIDA LA LÍNEA PROBLEMÁTICA:
      // productObj.isNearExpiration = product.isNearExpiration();

      return productObj;
    });

    // Obtener filtros únicos para el frontend
    const [categories, productTypes, farmingTypes, productStates] =
      await Promise.all([
        Product.distinct("category", { isActive: true }),
        Product.distinct("productType", { isActive: true }),
        Product.distinct("farmingType", { isActive: true }),
        Product.distinct("productState", { isActive: true }),
      ]);

    return NextResponse.json({
      products: productsWithInfo,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      filters: {
        categories,
        productTypes, // Cambio de poultryTypes a productTypes
        farmingTypes,
        productStates,
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    console.error("Stack trace:", error.stack);

    return NextResponse.json(
      {
        message: "Error al obtener productos",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Autenticación: sólo admins pueden crear productos
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const data = await request.json();

    // Conectar a la base de datos
    await connectDB();

    // Obtener el modelo Product
    const Product = getProductModel();
    console.log("🔍 Modelo Product en POST:", typeof Product, Product.name);

    console.log(
      "📝 Datos recibidos para crear producto:",
      JSON.stringify(data, null, 2)
    );

    // Validaciones de campos obligatorios
    if (!data.title || !data.salePrice || !data.category || !data.imageUrl) {
      const missingFields = [];
      if (!data.title) missingFields.push("Nombre del producto");
      if (!data.salePrice) missingFields.push("Precio de venta");
      if (!data.category) missingFields.push("Categoría");
      if (!data.imageUrl) missingFields.push("Imagen principal");

      return NextResponse.json(
        {
          message: "Faltan campos obligatorios",
          missingFields,
          details: `Por favor completa los siguientes campos: ${missingFields.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validar que el precio de venta sea mayor a 0
    if (parseFloat(data.salePrice) <= 0) {
      return NextResponse.json(
        { message: "El precio de venta debe ser mayor a 0" },
        { status: 400 }
      );
    }

    // Validar categorías válidas para pollería y carnicería
    const validCategories = [
      // Categorías de pollería
      "pollos-enteros",
      "cortes-pollo",
      "huevos",
      "marinados-pollo",
      "embutidos-pollo",
      "menudencias-pollo",

      // Categorías de carnicería
      "cortes-vacunos",
      "cortes-cerdo",
      "cortes-cordero",
      "milanesas",
      "carne-picada",
      "embutidos-vacunos",
      "vísceras",

      // Categorías generales
      "productos-organicos",
      "preparados",
      "promociones",
      "otros",
    ];

    if (!validCategories.includes(data.category)) {
      return NextResponse.json(
        { message: "Categoría no válida" },
        { status: 400 }
      );
    }

    // Validar peso si se proporciona
    if (data.weight && parseFloat(data.weight) <= 0) {
      return NextResponse.json(
        { message: "El peso debe ser mayor a 0" },
        { status: 400 }
      );
    }

    // Preparar datos del producto
    const productData = {
      // Campos obligatorios
      title: data.title.trim(),
      salePrice: parseFloat(data.salePrice),
      category: data.category,
      imageUrl: data.imageUrl,

      // Campos con valores por defecto
      description: data.description || "",
      featured: data.featured || false,
      stock: parseInt(data.stock) || 0,
      cost: parseFloat(data.cost) || 0,
      profitMargin: parseFloat(data.profitMargin) || 0,
      promoPrice: parseFloat(data.promoPrice) || 0,

      // Campos específicos de pollería y carnicería
      weight: parseFloat(data.weight) || 0,
      weightUnit: data.weightUnit || "kg",
      productType: data.productType || data.poultryType || "pollo", // Compatibilidad hacia atrás
      farmingType: data.farmingType || "convencional",
      productState: data.productState || "fresco",
      cut: data.cut || "entero",

      // Nuevos campos para carnicería
      meatGrade: data.meatGrade || "",
      specialPreparation: data.specialPreparation || "",

      // Información nutricional
      nutritionalInfo: {
        calories: parseFloat(data.nutritionalInfo?.calories) || 0,
        protein: parseFloat(data.nutritionalInfo?.protein) || 0,
        fat: parseFloat(data.nutritionalInfo?.fat) || 0,
        per100g: data.nutritionalInfo?.per100g !== false,
      },

      // Arrays
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
      allergens: Array.isArray(data.allergens) ? data.allergens : [],
      certifications: Array.isArray(data.certifications)
        ? data.certifications
        : [],

      // Rango de peso
      weightRange: {
        min: parseFloat(data.weightRange?.min) || 0,
        max: parseFloat(data.weightRange?.max) || 0,
      },

      // Disponibilidad (por defecto todos los días)
      availability: {
        monday: data.availability?.monday !== false,
        tuesday: data.availability?.tuesday !== false,
        wednesday: data.availability?.wednesday !== false,
        thursday: data.availability?.thursday !== false,
        friday: data.availability?.friday !== false,
        saturday: data.availability?.saturday !== false,
        sunday: data.availability?.sunday !== false,
      },

      // SKU manual o se generará automáticamente
      sku: data.sku || undefined,
      isActive: data.isActive !== false,
    };

    // Información adicional de Cloudinary para imagen principal
    if (data.imageCloudinaryInfo) {
      productData.imageCloudinaryInfo = {
        publicId: data.imageCloudinaryInfo.publicId,
        format: data.imageCloudinaryInfo.format,
        width: data.imageCloudinaryInfo.width,
        height: data.imageCloudinaryInfo.height,
        bytes: data.imageCloudinaryInfo.bytes,
      };
    }

    // Procesar variantes de peso/precio
    if (data.variants && Array.isArray(data.variants)) {
      productData.variants = data.variants.map((variant) => ({
        weight: parseFloat(variant.weight) || 0,
        weightUnit: variant.weightUnit || "kg",
        price: parseFloat(variant.price) || 0,
        stock: parseInt(variant.stock) || 0,
        sku: variant.sku || "",
      }));
    }

    // Procesar imágenes adicionales
    if (data.additionalImages && Array.isArray(data.additionalImages)) {
      productData.additionalImages = data.additionalImages.map((img) => ({
        imageUrl: img.imageUrl,
        description: img.description || "",
        ...(img.imageCloudinaryInfo && {
          imageCloudinaryInfo: {
            publicId: img.imageCloudinaryInfo.publicId,
            format: img.imageCloudinaryInfo.format,
            width: img.imageCloudinaryInfo.width,
            height: img.imageCloudinaryInfo.height,
            bytes: img.imageCloudinaryInfo.bytes,
          },
        }),
      }));
    } else {
      productData.additionalImages = [];
    }

    // Verificar si el SKU ya existe (si se proporcionó)
    if (productData.sku) {
      const existingProduct = await Product.findOne({
        sku: productData.sku,
      });

      if (existingProduct) {
        return NextResponse.json(
          { message: "El SKU ya existe. Por favor utilice uno diferente." },
          { status: 400 }
        );
      }
    }

    console.log(
      "💾 Creando producto con datos:",
      JSON.stringify(productData, null, 2)
    );

    // Crear el nuevo producto
    const newProduct = await Product.create(productData);

    console.log("✅ Producto creado exitosamente:", newProduct._id);

    // Convertir a objeto y agregar virtuals
    const productResponse = newProduct.toObject();
    productResponse.hasDiscount = newProduct.hasDiscount;
    productResponse.discountPercentage = newProduct.discountPercentage;
    productResponse.effectivePrice = newProduct.effectivePrice;
    productResponse.availableToday = newProduct.availableToday;
    productResponse.pricePerKg = newProduct.pricePerKg;
    // ❌ REMOVIDA LA LÍNEA PROBLEMÁTICA:
    // productResponse.isNearExpiration = newProduct.isNearExpiration();

    return NextResponse.json(
      {
        message: "Producto creado correctamente",
        product: productResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    console.error("Stack trace:", error.stack);

    // Manejo de errores más específico
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors).map((field) => ({
        field,
        message: error.errors[field].message,
      }));

      return NextResponse.json(
        {
          message: "Error de validación",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Error de duplicado de SKU
    if (error.code === 11000 && error.keyPattern?.sku) {
      return NextResponse.json(
        { message: "El SKU ya existe. Por favor utilice uno diferente." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Error al crear producto",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
