import { takeEvery, select } from "redux-saga/effects";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../slices/cartSlice";

// Selector para obtener el carrito
const selectCart = (state) => state.cart;

// Persiste el carrito en localStorage cada vez que cambia
function* persistCartSaga() {
  const cart = yield select(selectCart);
  localStorage.setItem("cart", JSON.stringify(cart));
}

export default function* cartSaga() {
  // Persiste el carrito cada vez que se modifica
  yield takeEvery(
    [addToCart.type, removeFromCart.type, updateQuantity.type, clearCart.type],
    persistCartSaga
  );
}
