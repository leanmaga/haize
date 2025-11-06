// src/app/products/page.js
import { getProducts } from '@/lib/data';
import FilterableProducts from '@/components/product/FilterableProducts';

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const { category = 'all' } = resolvedSearchParams;
  const { products } = await getProducts({ category });
  return <FilterableProducts products={products} />;
}
