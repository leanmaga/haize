import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchProductsRequest,
  fetchProductsSuccess,
  fetchProductsFailure,
  fetchProductByIdRequest,
  fetchProductByIdSuccess,
  fetchProductByIdFailure,
} from '../slices/productsSlice';

// Fetch all products
function* fetchProductsSaga() {
  try {
    const response = yield call(fetch, '/api/products');
    const data = yield response.json();

    if (response.ok) {
      yield put(fetchProductsSuccess(data));
    } else {
      yield put(fetchProductsFailure(data.message));
    }
  } catch (error) {
    yield put(fetchProductsFailure(error.message));
  }
}

// Fetch single product
function* fetchProductByIdSaga(action) {
  try {
    const response = yield call(fetch, `/api/products/${action.payload}`);
    const data = yield response.json();

    if (response.ok) {
      yield put(fetchProductByIdSuccess(data));
    } else {
      yield put(fetchProductByIdFailure(data.message));
    }
  } catch (error) {
    yield put(fetchProductByIdFailure(error.message));
  }
}

export default function* productsSaga() {
  yield takeLatest(fetchProductsRequest.type, fetchProductsSaga);
  yield takeLatest(fetchProductByIdRequest.type, fetchProductByIdSaga);
}
