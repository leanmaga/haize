import { call, put, takeLatest } from 'redux-saga/effects';
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

// Fetch all orders
function* fetchOrdersSaga() {
  try {
    const response = yield call(fetch, '/api/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = yield response.json();

    if (response.ok) {
      // Transformar las órdenes para que tengan el formato correcto
      const transformedOrders = data.map((order) => ({
        ...order,
        id: order._id, // Agregar id para compatibilidad
      }));

      yield put(fetchOrdersSuccess(transformedOrders));
    } else {
      yield put(fetchOrdersFailure(data.message || 'Failed to fetch orders'));
    }
  } catch (error) {
    console.error('❌ Error in fetchOrdersSaga:', error);
    yield put(fetchOrdersFailure(error.message));
  }
}

// Fetch single order by ID
function* fetchOrderByIdSaga(action) {
  try {
    const response = yield call(fetch, `/api/orders/${action.payload}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = yield response.json();

    if (response.ok) {
      const transformedOrder = {
        ...data,
        id: data._id,
      };

      yield put(fetchOrderByIdSuccess(transformedOrder));
    } else {
      yield put(fetchOrderByIdFailure(data.message || 'Failed to fetch order'));
    }
  } catch (error) {
    console.error('❌ Error in fetchOrderByIdSaga:', error);
    yield put(fetchOrderByIdFailure(error.message));
  }
}

// Create new order
function* createOrderSaga(action) {
  try {
    const response = yield call(fetch, '/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action.payload),
    });

    const data = yield response.json();

    if (response.ok) {
      const transformedOrder = {
        ...data,
        id: data._id,
      };

      yield put(createOrderSuccess(transformedOrder));
      // Limpiar el carrito después de crear la orden
      yield put(clearCart());
    } else {
      yield put(createOrderFailure(data.message || 'Failed to create order'));
    }
  } catch (error) {
    console.error('❌ Error in createOrderSaga:', error);
    yield put(createOrderFailure(error.message));
  }
}

// Update order status (solo admin)
function* updateOrderStatusSaga(action) {
  try {
    const { orderId, status } = action.payload;

    const response = yield call(fetch, `/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const data = yield response.json();

    if (response.ok) {
      const transformedOrder = {
        ...data,
        id: data._id,
      };

      yield put(updateOrderStatusSuccess(transformedOrder));
    } else {
      yield put(
        updateOrderStatusFailure(
          data.message || 'Failed to update order status'
        )
      );
    }
  } catch (error) {
    console.error('❌ Error in updateOrderStatusSaga:', error);
    yield put(updateOrderStatusFailure(error.message));
  }
}

// Cancel order
function* cancelOrderSaga(action) {
  try {
    const response = yield call(fetch, `/api/orders/${action.payload}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = yield response.json();

    if (response.ok) {
      yield put(cancelOrderSuccess(action.payload));
    } else {
      yield put(cancelOrderFailure(data.message || 'Failed to cancel order'));
    }
  } catch (error) {
    console.error('❌ Error in cancelOrderSaga:', error);
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
