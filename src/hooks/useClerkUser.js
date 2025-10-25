'use client';

import { useUser } from '@clerk/nextjs';
import { useSelector } from 'react-redux';
import {
  selectUser,
  selectIsAuthenticated,
} from '@/redux/selectors/authSelectors';

export function useClerkUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const reduxUser = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return {
    user: clerkUser || reduxUser,
    isLoaded,
    isSignedIn: isSignedIn || isAuthenticated,
    clerkUser,
    reduxUser,
  };
}
