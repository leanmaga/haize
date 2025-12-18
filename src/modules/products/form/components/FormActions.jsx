/**
 * Componente para los botones de acción del formulario (Cancelar y Guardar)
 * @param {Object} props
 * @param {boolean} props.loading - Estado de carga
 * @param {Function} props.onCancel - Función al cancelar
 * @param {boolean} props.isEditing - Si está editando un producto existente
 * @returns {JSX.Element}
 */
const FormActions = ({ loading, onCancel, isEditing }) => {
  return (
    <div className="flex justify-end pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={onCancel}
        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition mr-4"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Guardando...
          </span>
        ) : (
          'Guardar Producto'
        )}
      </button>
    </div>
  );
};

export default FormActions;
