'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Settings, Store, Bell, Shield, CreditCard } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
          <p className="text-gray-600 mt-1">
            Administra la configuración de tu tienda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuración de Tienda */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Store size={24} />
              <h3 className="text-lg font-bold">Configuración de Tienda</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Tienda
                </label>
                <input
                  type="text"
                  defaultValue="HAIZE"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  defaultValue="contacto@haize.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={24} />
              <h3 className="text-lg font-bold">Notificaciones</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Nuevas órdenes</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Stock bajo</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">Nuevos clientes</span>
              </label>
            </div>
          </div>

          {/* Pagos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard size={24} />
              <h3 className="text-lg font-bold">Métodos de Pago</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">MercadoPago</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Transferencia</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Efectivo</span>
              </label>
            </div>
          </div>

          {/* Seguridad */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={24} />
              <h3 className="text-lg font-bold">Seguridad</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                Cambiar contraseña
              </button>
              <button className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                Autenticación de dos factores
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            Guardar Cambios
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
