// ============================================
// src/app/sso-callback/page.js
// ============================================
'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        await handleRedirectCallback();
        router.push('/dashboard');
      } catch (error) {
        console.error('Error en callback:', error);
        router.push('/sign-in');
      }
    }

    handleCallback();
  }, [handleRedirectCallback, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Completando inicio de sesión...</p>
      </div>
    </div>
  );
}
