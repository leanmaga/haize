import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  selectedProduct: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    priceRange: { min: 0, max: 10000 },
    search: '',
  },
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Fetch products
    fetchProductsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload;
      state.error = null;
    },
    fetchProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single product
    fetchProductByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductByIdSuccess: (state, action) => {
      state.loading = false;
      state.selectedProduct = action.payload;
      state.error = null;
    },
    fetchProductByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Filters
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  fetchProductsRequest,
  fetchProductsSuccess,
  fetchProductsFailure,
  fetchProductByIdRequest,
  fetchProductByIdSuccess,
  fetchProductByIdFailure,
  setFilter,
  clearFilters,
} = productsSlice.actions;

export default productsSlice.reducer;
