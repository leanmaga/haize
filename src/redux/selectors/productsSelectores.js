import { createSelector } from "reselect";

// Selectores básicos
const selectProductsState = (state) => state.products;

// Selectores memoizados
export const selectAllProducts = createSelector(
  [selectProductsState],
  (products) => products.items
);

export const selectSelectedProduct = createSelector(
  [selectProductsState],
  (products) => products.selectedProduct
);

export const selectProductsLoading = createSelector(
  [selectProductsState],
  (products) => products.loading
);

export const selectProductsFilters = createSelector(
  [selectProductsState],
  (products) => products.filters
);

// Selector compuesto - Productos filtrados
export const selectFilteredProducts = createSelector(
  [selectAllProducts, selectProductsFilters],
  (products, filters) => {
    return products.filter((product) => {
      // Filtro por categoría
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Filtro por rango de precio
      if (
        product.price < filters.priceRange.min ||
        product.price > filters.priceRange.max
      ) {
        return false;
      }

      // Filtro por búsqueda
      if (
        filters.search &&
        !product.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }
);

// Selector - Productos por categoría
export const selectProductsByCategory = (category) =>
  createSelector([selectAllProducts], (products) =>
    products.filter((product) => product.category === category)
  );
