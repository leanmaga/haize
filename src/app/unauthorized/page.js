import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-semibold">Acceso no autorizado</h1>
        <p className="mt-3 text-gray-600">
          No tenés permisos para acceder a esta sección.
        </p>
        <Link href="/" className="btn-drop mt-6 inline-flex px-6 py-3">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
