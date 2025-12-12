// src/app/admin/settings/page.js
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SettingsPage from '@/modules/profile/settings/ProfileSettingsPage';
import ProfilePage from '@/modules/profile/Profile';

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Verificar que sea administrador
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin/settings');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  // Mostrar loading mientras se verifica la sesión
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  // No renderizar nada si no es admin
  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <ProfilePage />
      <SettingsPage />
    </div>
  );
}
