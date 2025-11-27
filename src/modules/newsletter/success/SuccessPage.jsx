'use client';

import { CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewsletterSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl">
        {/* Icono de éxito */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Contenido */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-black">
            ¡Suscripción Confirmada!
          </h1>

          <p className="text-gray-600 text-lg">
            Bienvenido a la comunidad HAIZE
          </p>

          {/* Info del código */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 my-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Mail className="h-5 w-5 text-zinc-700" />
              <p className="font-semibold text-zinc-900">Revisa tu email</p>
            </div>
            <p className="text-sm text-gray-600">
              Te enviamos un email con tu código de descuento del{' '}
              <span className="font-bold text-black">10% OFF</span> para tu
              primera compra.
            </p>
          </div>

          {/* Beneficios */}
          <div className="text-left space-y-3 pt-4">
            <p className="font-semibold text-black text-center mb-4">
              ¿Qué obtienes?
            </p>
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-0.5">✓</span>
              <p className="text-sm text-gray-600">
                Novedades exclusivas antes que nadie
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-0.5">✓</span>
              <p className="text-sm text-gray-600">
                Ofertas especiales para suscriptores
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-0.5">✓</span>
              <p className="text-sm text-gray-600">
                Entrega express 24hs en zonas seleccionadas
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 mt-0.5">✓</span>
              <p className="text-sm text-gray-600">
                Consejos de estilo y tendencias
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3 pt-6">
            <Link href="/products">
              <button className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-zinc-800 transition-colors">
                EXPLORAR COLECCIÓN
              </button>
            </Link>
            <Link href="/">
              <button className="w-full border border-zinc-300 text-black py-3 px-6 rounded-lg font-semibold hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                VOLVER AL INICIO
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
