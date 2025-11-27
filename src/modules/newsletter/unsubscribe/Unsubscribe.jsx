'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewsletterUnsubscribePage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('idle'); // idle, success, error, already
  const [message, setMessage] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const already = searchParams.get('already');
    const error = searchParams.get('error');

    if (success === 'true') {
      setStatus('success');
      setMessage('Te has desuscrito exitosamente del newsletter');
    } else if (already === 'true') {
      setStatus('already');
      setMessage('Ya te encontrabas desuscrito anteriormente');
    } else if (error === 'not-found') {
      setStatus('error');
      setMessage('No encontramos tu email en nuestra lista');
    } else if (error === 'true') {
      setStatus('error');
      setMessage('Ocurrió un error al procesar tu desuscripción');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl">
        {/* Icono según estado */}
        <div className="flex justify-center mb-6">
          <div
            className={`rounded-full p-4 ${
              status === 'success' || status === 'already'
                ? 'bg-green-100'
                : status === 'error'
                ? 'bg-red-100'
                : 'bg-zinc-100'
            }`}
          >
            {status === 'success' || status === 'already' ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : status === 'error' ? (
              <AlertCircle className="h-12 w-12 text-red-600" />
            ) : (
              <Mail className="h-12 w-12 text-zinc-600" />
            )}
          </div>
        </div>

        {/* Contenido según estado */}
        <div className="text-center space-y-4">
          {status === 'success' && (
            <>
              <h1 className="text-3xl font-bold text-black">
                Desuscripción Confirmada
              </h1>
              <p className="text-gray-600">
                Has sido removido de nuestra lista de newsletter. Ya no
                recibirás emails de HAIZE.
              </p>
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 my-6">
                <p className="text-sm text-gray-600">
                  Lamentamos verte partir. Si cambias de opinión, siempre puedes
                  volver a suscribirte desde nuestra página.
                </p>
              </div>
            </>
          )}

          {status === 'already' && (
            <>
              <h1 className="text-3xl font-bold text-black">
                Ya Estabas Desuscrito
              </h1>
              <p className="text-gray-600">
                No recibirás más emails de nuestro newsletter.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="text-3xl font-bold text-black">Error</h1>
              <p className="text-gray-600">{message}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-6">
                <p className="text-sm text-red-700">
                  Si continúas teniendo problemas, por favor contáctanos
                  directamente.
                </p>
              </div>
            </>
          )}

          {status === 'idle' && (
            <>
              <h1 className="text-3xl font-bold text-black">Desuscribirse</h1>
              <p className="text-gray-600">
                Para desuscribirte del newsletter, haz clic en el enlace del
                email que recibiste.
              </p>
            </>
          )}

          {/* Botones */}
          <div className="flex flex-col gap-3 pt-6">
            <Link href="/">
              <button className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                VOLVER AL INICIO
              </button>
            </Link>
            {(status === 'success' || status === 'already') && (
              <Link href="/products">
                <button className="w-full border border-zinc-300 text-black py-3 px-6 rounded-lg font-semibold hover:bg-zinc-50 transition-colors">
                  EXPLORAR COLECCIÓN
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
