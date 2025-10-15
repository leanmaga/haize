import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

// Reducers
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import productsReducer from "./slices/productsSlice";
import ordersReducer from "./slices/ordersSlice"; // ← AGREGAR
import uiReducer from "./slices/uiSlice";

// Sagas
import rootSaga from "./sagas";

// Middleware personalizado
import { logger } from "./middleware/logger";

// Crear el middleware de saga
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    orders: ordersReducer, // ← AGREGAR
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    })
      .concat(
        sagaMiddleware,
        process.env.NODE_ENV === "development" ? logger : null
      )
      .filter(Boolean),
  devTools: process.env.NODE_ENV !== "production",
});

// Ejecutar el root saga
sagaMiddleware.run(rootSaga);
