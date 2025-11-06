// app/api/products/[id]/route.js - API LIMPIA PARA POLLERÍA
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

// GET para obtener un producto específico por ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { message: "Error al obtener producto" },
      { status: 500 }
    );
  }
}

// PUT para actualizar un producto - POLLERÍA
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación y permisos
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    await connectDB();

    // Verificar si el producto existe
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Validaciones de campos obligatorios
    if (!data.title || !data.salePrice || !data.category) {
      const missingFields = [];
      if (!data.title) missingFields.push("Nombre del producto");
      if (!data.salePrice) missingFields.push("Precio de venta");
      if (!data.category) missingFields.push("Categoría");

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

    // Validar categorías válidas para pollería
    const validCategories = [
      "pollos-enteros",
      "cortes-pollo",
      "huevos",
      "marinados",
      "embutidos",
      "menudencias",
      "productos-organicos",
      "preparados",
      "promociones",
      "otros",
    ];

    if (!validCategories.includes(data.category)) {
      return NextResponse.json(
        { message: "Categoría no válida para pollería" },
        { status: 400 }
      );
    }

    // Preparar datos del producto para actualizar
    const productData = {
      title: data.title.trim(),
      description: data.description || "",
      salePrice: parseFloat(data.salePrice),
      category: data.category,
      featured: data.featured || false,
    };

    // Manejo de imagen principal
    if (data.imageUrl) {
      productData.imageUrl = data.imageUrl;
    }

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

    // Procesar imágenes adicionales
    if (data.additionalImages !== undefined) {
      if (Array.isArray(data.additionalImages)) {
        productData.additionalImages = data.additionalImages.map((img) => ({
          imageUrl: img.imageUrl,
          color: img.color || "",
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
    }

    // Campos financieros opcionales
    if (data.promoPrice !== undefined) {
      if (data.promoPrice === "" || data.promoPrice === null) {
        productData.promoPrice = 0;
      } else {
        productData.promoPrice = parseFloat(data.promoPrice) || 0;
      }
    }

    if (data.cost !== undefined) {
      if (data.cost === "" || data.cost === null) {
        productData.cost = 0;
      } else {
        productData.cost = parseFloat(data.cost) || 0;
      }
    }

    if (data.profitMargin !== undefined) {
      if (data.profitMargin === "" || data.profitMargin === null) {
        productData.profitMargin = 0;
      } else {
        productData.profitMargin = parseFloat(data.profitMargin) || 0;
      }
    }

    // Stock - Simple para pollería
    if (data.stock !== undefined) {
      if (data.stock === "" || data.stock === null) {
        productData.stock = 0;
      } else {
        productData.stock = parseInt(data.stock) || 0;
      }
    }

    // Actualizar el producto
    const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
      new: true, // Devuelve el documento actualizado
      runValidators: true, // Ejecuta las validaciones del modelo
    });

    return NextResponse.json({
      message: "Producto actualizado correctamente",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);

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

    if (error.name === "CastError") {
      return NextResponse.json(
        { message: "ID de producto inválido" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error al actualizar producto: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE para eliminar un producto
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json(
        { message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Producto eliminado con éxito",
      deletedId: id,
    });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);

    if (error.name === "CastError") {
      return NextResponse.json(
        { message: "ID de producto inválido" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error al eliminar producto: " + error.message },
      { status: 500 }
    );
  }
}
