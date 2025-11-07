import { Suspense } from 'react';
import AuthError from '@/modules/auth/error/AuthError';

// Componente principal envuelto en Suspense
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AuthError />
    </Suspense>
  );
}
