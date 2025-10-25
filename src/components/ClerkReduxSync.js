'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '@/redux/slices/authSlice';

export default function ClerkReduxSync() {
  const { user, isLoaded } = useUser();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        // Sincronizar usuario de Clerk con Redux
        dispatch(
          loginSuccess({
            user: {
              id: user.id,
              email: user.emailAddresses[0].emailAddress,
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
            },
            token: null, // Clerk maneja tokens automáticamente
          })
        );
      } else {
        // Usuario no autenticado
        dispatch(logout());
      }
    }
  }, [user, isLoaded, dispatch]);

  return null;
}
