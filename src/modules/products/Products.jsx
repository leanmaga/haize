// app/products/page.js
import { getProducts } from '@/lib/data';
import FilterableProducts from '@/components/product/FilterableProducts';

export default async function ProductsPage({ searchParams }) {
  // ✅ CORRECCIÓN: Manejar searchParams que puede ser undefined o una Promise
  const resolvedSearchParams = searchParams ? await searchParams : {};

  // ✅ CORRECCIÓN: Ahora sí podemos acceder con seguridad a category
  const category = resolvedSearchParams?.category || 'all';

  // Obtener productos con la categoría
  const { products } = await getProducts({ category });

  return <FilterableProducts products={products} />;
}
