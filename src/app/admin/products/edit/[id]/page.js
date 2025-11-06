// src/app/admin/products/edit/[id]/page.js
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data";
import ProductForm from "@/components/admin/ProductForm";
import PropTypes from "prop-types";

export async function generateMetadata({ params }) {
  // Esperar a que params esté resuelto
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    return {
      title: "Producto no encontrado | TiendaOnline",
    };
  }

  return {
    title: `Editar ${product.title} | TiendaOnline`,
  };
}

// Validación de props para generateMetadata
generateMetadata.propTypes = {
  params: PropTypes.instanceOf(Promise).isRequired,
};

export default async function EditProductPage({ params }) {
  // Esperar a que params esté resuelto
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return <ProductForm product={product} />;
}

// Validación de props para el componente principal
EditProductPage.propTypes = {
  params: PropTypes.instanceOf(Promise).isRequired,
};
