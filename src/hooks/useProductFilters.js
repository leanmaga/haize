import { useMemo, useState } from 'react';

export const useProductFilters = (products) => {
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: { min: 0, max: 100000 },
    sizes: [],
    colors: [],
    searchTerm: '',
  });

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.filter((product) => {
      // Filtro por búsqueda de texto
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          product.title.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Filtro por categoría
      if (filters.category !== 'all' && product.category !== filters.category) {
        return false;
      }

      // Filtro por precio (usar promoPrice si existe y es menor, sino salePrice)
      const productPrice =
        product.promoPrice > 0 && product.promoPrice < product.salePrice
          ? product.promoPrice
          : product.salePrice;

      if (
        productPrice < filters.priceRange.min ||
        productPrice > filters.priceRange.max
      ) {
        return false;
      }

      // Filtro por talle
      if (filters.sizes.length > 0) {
        const productSizes = product.sizes?.map((s) => s.size) || [];
        const hasMatchingSize = filters.sizes.some((size) =>
          productSizes.includes(size)
        );
        if (!hasMatchingSize) {
          return false;
        }
      }

      // Filtro por color
      if (filters.colors.length > 0) {
        const productColors = product.colors?.map((c) => c.name) || [];
        const hasMatchingColor = filters.colors.some((color) =>
          productColors.includes(color)
        );
        if (!hasMatchingColor) {
          return false;
        }
      }

      return true;
    });
  }, [products, filters]);

  return {
    filters,
    setFilters,
    filteredProducts,
    hasActiveFilters:
      filters.category !== 'all' ||
      filters.sizes.length > 0 ||
      filters.colors.length > 0 ||
      filters.priceRange.min > 0 ||
      filters.priceRange.max < 100000 ||
      filters.searchTerm !== '',
  };
};
