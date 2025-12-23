import { X } from 'lucide-react';

const ClearCartModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md mx-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-sora-regular">Vaciar Carrito</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer "
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            ¿Estás seguro de que deseas vaciar el carrito? Esta acción eliminará
            todos los productos y no se puede deshacer.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="cursor-pointer flex-1 bg-white text-black border-2 border-black py-3 px-6 hover:bg-gray-100 transition-colors font-sora-regular"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="cursor-pointer flex-1 bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors font-sora-regular"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClearCartModal;
