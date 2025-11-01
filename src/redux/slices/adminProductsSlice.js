import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  uploadProgress: 0,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
};

const adminProductsSlice = createSlice({
  name: 'adminProducts',
  initialState,
  reducers: {
    // Fetch all products (admin)
    fetchAdminProductsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAdminProductsSuccess: (state, action) => {
      state.loading = false;
      state.products = action.payload;
      state.error = null;
    },
    fetchAdminProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create product
    createProductRequest: (state) => {
      state.createLoading = true;
      state.createError = null;
    },
    createProductSuccess: (state, action) => {
      state.createLoading = false;
      state.products.unshift(action.payload);
      state.createError = null;
    },
    createProductFailure: (state, action) => {
      state.createLoading = false;
      state.createError = action.payload;
    },

    // Update product
    updateProductRequest: (state) => {
      state.updateLoading = true;
      state.updateError = null;
    },
    updateProductSuccess: (state, action) => {
      state.updateLoading = false;
      const index = state.products.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.products[index] = action.payload;
      }
      if (state.selectedProduct?._id === action.payload._id) {
        state.selectedProduct = action.payload;
      }
      state.updateError = null;
    },
    updateProductFailure: (state, action) => {
      state.updateLoading = false;
      state.updateError = action.payload;
    },

    // Delete product
    deleteProductRequest: (state) => {
      state.deleteLoading = true;
      state.deleteError = null;
    },
    deleteProductSuccess: (state, action) => {
      state.deleteLoading = false;
      state.products = state.products.filter((p) => p._id !== action.payload);
      state.deleteError = null;
    },
    deleteProductFailure: (state, action) => {
      state.deleteLoading = false;
      state.deleteError = action.payload;
    },

    // Upload progress
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },

    // Select product
    selectProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },

    // Clear errors
    clearAdminProductErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
});

export const {
  fetchAdminProductsRequest,
  fetchAdminProductsSuccess,
  fetchAdminProductsFailure,
  createProductRequest,
  createProductSuccess,
  createProductFailure,
  updateProductRequest,
  updateProductSuccess,
  updateProductFailure,
  deleteProductRequest,
  deleteProductSuccess,
  deleteProductFailure,
  setUploadProgress,
  selectProduct,
  clearAdminProductErrors,
} = adminProductsSlice.actions;

export default adminProductsSlice.reducer;
