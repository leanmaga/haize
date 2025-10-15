import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  createOrderLoading: false,
  createOrderError: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // Fetch all orders
    fetchOrdersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action) => {
      state.loading = false;
      state.orders = action.payload;
      state.error = null;
    },
    fetchOrdersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single order by ID
    fetchOrderByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrderByIdSuccess: (state, action) => {
      state.loading = false;
      state.selectedOrder = action.payload;
      state.error = null;
    },
    fetchOrderByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create new order
    createOrderRequest: (state) => {
      state.createOrderLoading = true;
      state.createOrderError = null;
    },
    createOrderSuccess: (state, action) => {
      state.createOrderLoading = false;
      state.orders.unshift(action.payload);
      state.createOrderError = null;
    },
    createOrderFailure: (state, action) => {
      state.createOrderLoading = false;
      state.createOrderError = action.payload;
    },

    // Update order status
    updateOrderStatusRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateOrderStatusSuccess: (state, action) => {
      state.loading = false;
      const index = state.orders.findIndex(
        (order) => order.id === action.payload.id
      );
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      if (state.selectedOrder?.id === action.payload.id) {
        state.selectedOrder = action.payload;
      }
      state.error = null;
    },
    updateOrderStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Cancel order
    cancelOrderRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    cancelOrderSuccess: (state, action) => {
      state.loading = false;
      const index = state.orders.findIndex(
        (order) => order.id === action.payload
      );
      if (index !== -1) {
        state.orders[index].status = "cancelled";
      }
      state.error = null;
    },
    cancelOrderFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear selected order
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },

    // Clear errors
    clearOrderErrors: (state) => {
      state.error = null;
      state.createOrderError = null;
    },
  },
});

export const {
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderByIdRequest,
  fetchOrderByIdSuccess,
  fetchOrderByIdFailure,
  createOrderRequest,
  createOrderSuccess,
  createOrderFailure,
  updateOrderStatusRequest,
  updateOrderStatusSuccess,
  updateOrderStatusFailure,
  cancelOrderRequest,
  cancelOrderSuccess,
  cancelOrderFailure,
  clearSelectedOrder,
  clearOrderErrors,
} = ordersSlice.actions;

export default ordersSlice.reducer;
