'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import ClerkReduxSync from '@/components/ClerkReduxSync';

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <ClerkReduxSync />
      {children}
    </Provider>
  );
}
