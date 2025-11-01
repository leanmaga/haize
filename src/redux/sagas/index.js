import { all } from 'redux-saga/effects';
import authSaga from './authSaga';
import productsSaga from './adminProductsSaga';
import ordersSaga from './ordersSaga';
import cartSaga from './CartSaga';
import adminProductsSaga from './adminProductsSaga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    productsSaga(),
    cartSaga(),
    ordersSaga(),
    adminProductsSaga(),
  ]);
}
