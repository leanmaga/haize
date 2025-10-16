import { call, put, takeLatest } from 'redux-saga/effects';
import { loginRequest, loginSuccess, loginFailure } from '../slices/authSlice';

// Simula una llamada a la API
function* loginSaga(action) {
  try {
    // Aquí harías tu llamada real a la API
    const response = yield call(fetch, '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action.payload),
    });

    const data = yield response.json();

    if (response.ok) {
      // Guardar token en localStorage
      localStorage.setItem('token', data.token);

      yield put(loginSuccess(data));
    } else {
      yield put(loginFailure(data.message || 'Login failed'));
    }
  } catch (error) {
    yield put(loginFailure(error.message));
  }
}

export default function* authSaga() {
  yield takeLatest(loginRequest.type, loginSaga);
}
