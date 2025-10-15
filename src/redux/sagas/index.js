import { all } from "redux-saga/effects";
import authSaga from "./authSaga";
import productsSaga from "./productsSaga";
import ordersSaga from "./ordersSaga";
import cartSaga from "./CartSaga";

export default function* rootSaga() {
  yield all([authSaga(), productsSaga(), cartSaga(), ordersSaga()]);
}
