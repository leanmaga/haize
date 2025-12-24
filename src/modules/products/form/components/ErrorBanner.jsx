import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar un banner con errores de validación
 * @param {Object} props
 * @param {Object} props.errors - Objeto con errores de validación
 * @returns {JSX.Element|null}
 */
const ErrorBanner = ({ errors }) => {
  // Si no hay errores, no renderizar nada
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Por favor completa los campos obligatorios:
          </h3>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;
