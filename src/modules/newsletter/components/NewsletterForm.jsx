'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !email ||
      !email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    ) {
      setStatus('error');
      setMessage('Por favor ingresa un email válido');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al procesar la suscripción');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setMessage('Error de conexión. Intenta nuevamente.');
    }
  };

  return (
    <div className="text-left max-md:w-full max-md:px-8.5 max-md:mt-6 max-md:text-center">
      <p className="mb-5 text-xl font-bold max-md:mb-2.5">NEWSLETTER</p>

      <p className="mb-2">10% OFF en tu primera compra</p>

      <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu email"
            disabled={status === 'loading'}
            className={`w-full my-1 rounded-md border p-2 text-white bg-transparent transition-colors ${
              status === 'error'
                ? 'border-red-500 focus:border-red-500'
                : status === 'success'
                ? 'border-green-500 focus:border-green-500'
                : 'border-zinc-500 focus:border-white'
            } ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {status === 'success' && (
            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className={`max-w-max py-2 px-5 rounded-md font-medium transition-all ease-in-out duration-200 max-md:max-w-full flex items-center justify-center gap-2 ${
            status === 'loading'
              ? 'bg-zinc-400 text-zinc-700 cursor-not-allowed'
              : 'bg-zinc-100 text-black hover:bg-zinc-400'
          }`}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>PROCESANDO...</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              <span>SUSCRIBIRSE</span>
            </>
          )}
        </button>

        {/* Mensaje de estado */}
        {message && (
          <p
            className={`text-sm mt-2 ${
              status === 'success' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}

        {status === 'success' && (
          <p className="text-xs text-zinc-400 mt-1">
            Revisa tu email para confirmar tu suscripción 📧
          </p>
        )}
      </form>
    </div>
  );
}
