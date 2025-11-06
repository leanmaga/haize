import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data";
import ProductForm from "@/components/admin/ProductForm";
import PropTypes from "prop-types";

export async function generateMetadata({ params }) {
  const product = await getProductById(params.id);

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
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default async function EditProductPage({ params }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return <ProductForm product={product} />;
}

// Validación de props para el componente principal
EditProductPage.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};
