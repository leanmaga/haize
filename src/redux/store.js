import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

// Reducers
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/adminProductsSlice';
import ordersReducer from './slices/ordersSlice';
import uiReducer from './slices/uiSlice';
import adminProductsReducer from './slices/adminProductsSlice';

// Sagas
import rootSaga from './sagas';

// Middleware personalizado
import { logger } from './middleware/logger';

// Crear el middleware de saga
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    orders: ordersReducer,
    ui: uiReducer,
    adminProducts: adminProductsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    })
      .concat(
        sagaMiddleware,
        process.env.NODE_ENV === 'development' ? logger : null
      )
      .filter(Boolean),
  devTools: process.env.NODE_ENV !== 'production',
});

// Ejecutar el root saga
sagaMiddleware.run(rootSaga);
