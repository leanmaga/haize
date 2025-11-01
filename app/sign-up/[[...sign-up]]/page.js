// ============================================
// src/app/sign-up/[[...sign-up]]/page.js
// ============================================
'use client';

import { useSignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Manejar el envío del formulario de registro
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      // Crear el sign-up directamente sin verificación
      const result = await signUp.create({
        emailAddress,
        password,
        username,
      });

      // Establecer la sesión activa directamente
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/dashboard');
      } else {
        // Si por alguna razón no está completo, intentar igualmente
        await setActive({ session: result.createdSessionId });
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError(err.errors?.[0]?.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Crear cuenta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-white"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/sign-in"
            className="text-gray-400 hover:text-white text-sm"
          >
            ¿Ya tienes cuenta? <span className="underline">Inicia sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
