import { call, put, takeLatest } from 'redux-saga/effects';
import {
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
} from '../slices/adminProductsSlice';

// Flag global para prevenir duplicados
let isCreatingProduct = false;
let isUpdatingProduct = false;

// Fetch all products (admin view)
function* fetchAdminProductsSaga() {
  try {
    const response = yield call(fetch, '/api/admin/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = yield response.json();

    if (response.ok) {
      yield put(fetchAdminProductsSuccess(data));
    } else {
      yield put(fetchAdminProductsFailure(data.message));
    }
  } catch (error) {
    console.error('❌ Saga error:', error);
    yield put(fetchAdminProductsFailure(error.message));
  }
}

// Create product
function* createProductSaga(action) {
  // Prevenir ejecuciones duplicadas
  if (isCreatingProduct) {
    return;
  }

  isCreatingProduct = true;

  try {
    const formData = new FormData();

    // Agregar todos los campos del producto
    Object.keys(action.payload).forEach((key) => {
      if (key === 'images') {
        action.payload.images.forEach((image) => {
          formData.append('images', image);
        });
      } else if (key === 'sizes' || key === 'colors') {
        formData.append(key, JSON.stringify(action.payload[key]));
      } else {
        formData.append(key, action.payload[key]);
      }
    });

    const response = yield call(fetch, '/api/admin/products', {
      method: 'POST',
      body: formData,
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = yield response.text();
      console.error('❌ Response is not JSON:', text.substring(0, 200));
      throw new Error('La respuesta del servidor no es JSON válido');
    }

    const data = yield response.json();

    if (response.ok) {
      yield put(createProductSuccess(data));
    } else {
      yield put(createProductFailure(data.message));
    }
  } catch (error) {
    console.error('❌ Saga error:', error);
    yield put(createProductFailure(error.message));
  } finally {
    // Resetear el flag después de un pequeño delay
    setTimeout(() => {
      isCreatingProduct = false;
    }, 1000);
  }
}

// Update product
function* updateProductSaga(action) {
  // Prevenir ejecuciones duplicadas
  if (isUpdatingProduct) {
    return;
  }

  isUpdatingProduct = true;

  try {
    const { id, ...productData } = action.payload;
    const formData = new FormData();

    Object.keys(productData).forEach((key) => {
      if (key === 'images') {
        productData.images.forEach((image) => {
          formData.append('images', image);
        });
      } else if (key === 'sizes' || key === 'colors') {
        formData.append(key, JSON.stringify(productData[key]));
      } else {
        formData.append(key, productData[key]);
      }
    });

    const response = yield call(fetch, `/api/admin/products/${id}`, {
      method: 'PUT',
      body: formData,
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = yield response.text();
      console.error('❌ Response is not JSON:', text.substring(0, 200));
      throw new Error('La respuesta del servidor no es JSON válido');
    }

    const data = yield response.json();

    if (response.ok) {
      yield put(updateProductSuccess(data));
    } else {
      yield put(updateProductFailure(data.message));
    }
  } catch (error) {
    console.error('❌ Saga error:', error);
    yield put(updateProductFailure(error.message));
  } finally {
    // Resetear el flag después de un pequeño delay
    setTimeout(() => {
      isUpdatingProduct = false;
    }, 1000);
  }
}

// Delete product
function* deleteProductSaga(action) {
  try {
    const response = yield call(
      fetch,
      `/api/admin/products/${action.payload}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = yield response.text();
      console.error('❌ Response is not JSON:', text.substring(0, 200));
      throw new Error('La respuesta del servidor no es JSON válido');
    }

    const data = yield response.json();

    if (response.ok) {
      yield put(deleteProductSuccess(action.payload));
    } else {
      yield put(deleteProductFailure(data.message));
    }
  } catch (error) {
    console.error('❌ Saga error:', error);
    yield put(deleteProductFailure(error.message));
  }
}

export default function* adminProductsSaga() {
  yield takeLatest(fetchAdminProductsRequest.type, fetchAdminProductsSaga);
  // Usar takeLatest para cancelar acciones duplicadas
  yield takeLatest(createProductRequest.type, createProductSaga);
  yield takeLatest(updateProductRequest.type, updateProductSaga);
  yield takeLatest(deleteProductRequest.type, deleteProductSaga);
}
