import { createSelector } from 'reselect';

// Selector básico
const selectCartState = (state) => state.cart;

// Selectores memoizados
export const selectCartItems = createSelector(
  [selectCartState],
  (cart) => cart.items
);

export const selectCartTotal = createSelector(
  [selectCartState],
  (cart) => cart.total
);

export const selectCartItemCount = createSelector(
  [selectCartState],
  (cart) => cart.itemCount
);

// Selector compuesto - Total con impuestos
export const selectCartTotalWithTax = createSelector(
  [selectCartTotal],
  (total) => total * 1.21 // 21% IVA
);

// Selector compuesto - Items agrupados por categoría
export const selectCartItemsByCategory = createSelector(
  [selectCartItems],
  (items) => {
    return items.reduce((acc, item) => {
      const category = item.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  }
);

// Selector con parámetros - Buscar item por ID
export const selectCartItemById = (itemId) =>
  createSelector([selectCartItems], (items) =>
    items.find((item) => item.id === itemId)
  );
