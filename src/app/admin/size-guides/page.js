import SizeGuideManager from '@/components/admin/SizeGuideManager';

export const metadata = {
  title: 'Guías de Talles | Admin - HAIZE',
  description: 'Gestiona las medidas de cada categoría de productos',
};

export default function SizeGuidesAdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestión de Guías de Talles
              </p>
            </div>

            {/* Breadcrumb */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <a
                    href="/admin"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Admin
                  </a>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">Guías de Talles</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información de ayuda */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                💡 Información importante
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Las medidas que configures aquí se mostrarán automáticamente
                    en todos los productos de cada categoría
                  </li>
                  <li>
                    Los cambios se reflejan inmediatamente en el sitio web
                  </li>
                  <li>Todas las medidas deben estar en centímetros (cm)</li>
                  <li>
                    Para shorts, puedes especificar el ancho estirado además del
                    ancho normal
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Componente principal */}
        <SizeGuideManager />
      </div>
    </div>
  );
}
