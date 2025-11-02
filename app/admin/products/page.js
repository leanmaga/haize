'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  fetchAdminProductsRequest,
  deleteProductRequest,
  selectProduct,
} from '@/redux/slices/adminProductsSlice';
import ProductForm from '@/components/admin/ProductForm';
import ProductList from '@/components/admin/ProductList';

export default function AdminProductsPage() {
  const dispatch = useDispatch();
  const { products, loading, deleteLoading } = useSelector(
    (state) => state.adminProducts
  );
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminProductsRequest());
  }, [dispatch]);

  const handleCreateNew = () => {
    dispatch(selectProduct(null));
    setEditMode(false);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    dispatch(selectProduct(product));
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      dispatch(deleteProductRequest(productId));
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditMode(false);
    dispatch(selectProduct(null));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
            <p className="text-gray-600 mt-1">
              Administra tu catálogo de productos
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Crear Producto
          </button>
        </div>

        {/* Formulario Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editMode ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h2>
                <button
                  onClick={handleFormClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <ProductForm
                  editMode={editMode}
                  onSuccess={handleFormClose}
                  onCancel={handleFormClose}
                />
              </div>
            </div>
          </div>
        )}

        {/* Lista de Productos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <ProductList
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deleteLoading={deleteLoading}
          />
        )}
      </div>
    </AdminLayout>
  );
}
