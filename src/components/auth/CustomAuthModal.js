import { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { X } from 'lucide-react';

export default function CustomAuthModal({
  isOpen,
  onClose,
  initialView = 'signin',
}) {
  const [view, setView] = useState(initialView); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();

  if (!isOpen) return null;

  // Iniciar sesión con email y contraseña
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActiveSignIn({ session: result.createdSessionId });
        onClose();
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Registrarse con email y contraseña
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signUp.create({
        username,
        emailAddress: email,
        password,
      });

      if (result.status === 'complete') {
        await setActiveSignUp({ session: result.createdSessionId });
        onClose();
      } else {
        // Verificación de email requerida
        setError('Por favor verifica tu email');
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión con Google
  const handleGoogleSignIn = async () => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Error al conectar con Google');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md mx-4 shadow-2xl z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-black hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-12">
          {/* Logo */}
          <h1 className="text-5xl font-bold text-center mb-12 tracking-widest text-black">
            HAIZE
          </h1>

          {/* Form */}
          <form onSubmit={view === 'signin' ? handleSignIn : handleSignUp}>
            {view === 'signup' && (
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="text-gray-500 w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none text-sm transition-colors"
                />
              </div>
            )}

            <div className="mb-6">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-gray-500 w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none text-sm transition-colors"
              />
            </div>

            <div className="mb-6">
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-gray-500 w-full px-0 py-3 border-0 border-b-2 border-gray-300 focus:border-black focus:outline-none text-sm transition-colors"
              />
            </div>

            {view === 'signin' && (
              <div className="flex items-center mb-8">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-2 border-gray-400"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-gray-700"
                >
                  Acuérdate de mí.
                </label>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 mb-4 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'CARGANDO...'
                : view === 'signin'
                ? 'INICIAR SESIÓN'
                : 'CREAR CUENTA'}
            </button>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-black py-4 border-2 border-black hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              CONTINUAR CON GOOGLE
            </button>

            {/* Toggle View */}
            <div className="mt-6 text-center">
              {view === 'signin' ? (
                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className="text-gray-500 text-sm underline hover:no-underline"
                >
                  CREAR UNA CUENTA
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setView('signin')}
                  className="text-gray-500 text-sm underline hover:no-underline"
                >
                  YA TENGO UNA CUENTA
                </button>
              )}
            </div>

            {view === 'signin' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-gray-500 text-sm underline hover:no-underline"
                >
                  ¿PERDISTE TU CONTRASEÑA?
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
