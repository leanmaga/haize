import { createSelector } from 'reselect';

// Selector básico
const selectOrdersState = (state) => state.orders;

// Selectores memoizados básicos
export const selectAllOrders = createSelector(
  [selectOrdersState],
  (orders) => orders.orders
);

export const selectSelectedOrder = createSelector(
  [selectOrdersState],
  (orders) => orders.selectedOrder
);

export const selectOrdersLoading = createSelector(
  [selectOrdersState],
  (orders) => orders.loading
);

export const selectOrdersError = createSelector(
  [selectOrdersState],
  (orders) => orders.error
);

export const selectCreateOrderLoading = createSelector(
  [selectOrdersState],
  (orders) => orders.createOrderLoading
);

export const selectCreateOrderError = createSelector(
  [selectOrdersState],
  (orders) => orders.createOrderError
);

// Selectores derivados/compuestos

// Total de órdenes
export const selectOrdersCount = createSelector(
  [selectAllOrders],
  (orders) => orders.length
);

// Órdenes por estado
export const selectOrdersByStatus = (status) =>
  createSelector([selectAllOrders], (orders) =>
    orders.filter((order) => order.status === status)
  );

// Órdenes pendientes
export const selectPendingOrders = createSelector([selectAllOrders], (orders) =>
  orders.filter((order) => order.status === 'pending')
);

// Órdenes completadas
export const selectCompletedOrders = createSelector(
  [selectAllOrders],
  (orders) => orders.filter((order) => order.status === 'completed')
);

// Órdenes canceladas
export const selectCancelledOrders = createSelector(
  [selectAllOrders],
  (orders) => orders.filter((order) => order.status === 'cancelled')
);

// Total gastado en todas las órdenes
export const selectTotalSpent = createSelector([selectAllOrders], (orders) =>
  orders.reduce((sum, order) => sum + (order.total || 0), 0)
);

// Órdenes ordenadas por fecha (más recientes primero)
export const selectOrdersSortedByDate = createSelector(
  [selectAllOrders],
  (orders) => {
    return [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
);

// Órdenes del último mes
export const selectRecentOrders = createSelector(
  [selectAllOrders],
  (orders) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return orders.filter((order) => new Date(order.createdAt) >= oneMonthAgo);
  }
);

// Buscar orden por ID
export const selectOrderById = (orderId) =>
  createSelector([selectAllOrders], (orders) =>
    orders.find((order) => order.id === orderId)
  );

// Estadísticas de órdenes
export const selectOrdersStats = createSelector([selectAllOrders], (orders) => {
  const stats = {
    total: orders.length,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  };

  orders.forEach((order) => {
    if (stats[order.status] !== undefined) {
      stats[order.status]++;
    }
    if (order.status !== 'cancelled') {
      stats.totalRevenue += order.total || 0;
    }
  });

  return stats;
});
