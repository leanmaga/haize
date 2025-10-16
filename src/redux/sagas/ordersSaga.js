import { call, put, takeLatest, select } from 'redux-saga/effects';
import {
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
} from '../slices/ordersSlice';
import { clearCart } from '../slices/cartSlice';

// Selector para obtener el token de autenticación
const selectToken = (state) => state.auth.token;

// Fetch all orders
function* fetchOrdersSaga() {
  try {
    const token = yield select(selectToken);

    const response = yield call(fetch, '/api/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = yield response.json();

    if (response.ok) {
      yield put(fetchOrdersSuccess(data));
    } else {
      yield put(fetchOrdersFailure(data.message || 'Failed to fetch orders'));
    }
  } catch (error) {
    yield put(fetchOrdersFailure(error.message));
  }
}

// Fetch single order by ID
function* fetchOrderByIdSaga(action) {
  try {
    const token = yield select(selectToken);

    const response = yield call(fetch, `/api/orders/${action.payload}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = yield response.json();

    if (response.ok) {
      yield put(fetchOrderByIdSuccess(data));
    } else {
      yield put(fetchOrderByIdFailure(data.message || 'Failed to fetch order'));
    }
  } catch (error) {
    yield put(fetchOrderByIdFailure(error.message));
  }
}

// Create new order
function* createOrderSaga(action) {
  try {
    const token = yield select(selectToken);

    const response = yield call(fetch, '/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(action.payload),
    });

    const data = yield response.json();

    if (response.ok) {
      yield put(createOrderSuccess(data));
      // Limpiar el carrito después de crear la orden
      yield put(clearCart());
    } else {
      yield put(createOrderFailure(data.message || 'Failed to create order'));
    }
  } catch (error) {
    yield put(createOrderFailure(error.message));
  }
}

// Update order status
function* updateOrderStatusSaga(action) {
  try {
    const token = yield select(selectToken);
    const { orderId, status } = action.payload;

    const response = yield call(fetch, `/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = yield response.json();

    if (response.ok) {
      yield put(updateOrderStatusSuccess(data));
    } else {
      yield put(
        updateOrderStatusFailure(
          data.message || 'Failed to update order status'
        )
      );
    }
  } catch (error) {
    yield put(updateOrderStatusFailure(error.message));
  }
}

// Cancel order
function* cancelOrderSaga(action) {
  try {
    const token = yield select(selectToken);

    const response = yield call(fetch, `/api/orders/${action.payload}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = yield response.json();

    if (response.ok) {
      yield put(cancelOrderSuccess(action.payload));
    } else {
      yield put(cancelOrderFailure(data.message || 'Failed to cancel order'));
    }
  } catch (error) {
    yield put(cancelOrderFailure(error.message));
  }
}

export default function* ordersSaga() {
  yield takeLatest(fetchOrdersRequest.type, fetchOrdersSaga);
  yield takeLatest(fetchOrderByIdRequest.type, fetchOrderByIdSaga);
  yield takeLatest(createOrderRequest.type, createOrderSaga);
  yield takeLatest(updateOrderStatusRequest.type, updateOrderStatusSaga);
  yield takeLatest(cancelOrderRequest.type, cancelOrderSaga);
}
