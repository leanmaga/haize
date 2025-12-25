'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function AdminProfile({ userData, onUpdate }) {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil');
      }

      const updatedUser = await response.json();

      // Actualizar la sesión
      await update({
        ...session,
        user: {
          ...session.user,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });

      // Notificar al componente padre
      if (onUpdate) {
        onUpdate(updatedUser);
      }

      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('No se pudo actualizar el perfil');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: userData?.name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const hasGoogleImage = userData?.image && typeof userData.image === 'string';

  return (
    <div className="pt-2">
      <h2 className="font-nexa-bold text-2xl mb-4 text-gray-800 ">
        Mi Perfil (Administrador)
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna Principal - Información Personal para Admin */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-nexa-bold text-gray-800">
                  Información Personal
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-sm font-sora-regular text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                )}
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <div className="w-28 h-28 relative shrink-0 rounded-full overflow-hidden bg-gray-50 border-2 border-gray-100">
                    {hasGoogleImage ? (
                      <Image
                        src={userData.image}
                        alt={userData.name || 'Usuario'}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShieldCheckIcon className="h-12 w-12 text-gray-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    {!isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className=" font-nexa-bold  text-gray-500">
                            Nombre
                          </p>
                          <div className="flex items-center">
                            <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="md:text-md lg:text-lg font-sora-regular">
                              {userData.name || 'Usuario'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className=" font-nexa-bold  text-gray-500">
                            Email
                          </p>
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="md:text-md lg:text-lg font-sora-regular">
                              {userData.email}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="font-nexa-bold  text-gray-500">
                            Teléfono
                          </p>
                          <div className="flex items-center">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <p className="md:text-md lg:text-lg font-sora-regular">
                              {userData.phone || 'No especificado'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-xs font-sora-regular uppercase text-gray-500 mb-1"
                          >
                            Nombre
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
                            placeholder="Tu nombre completo"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-xs font-sora-regular uppercase text-gray-500 mb-1"
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
                            placeholder="tu@email.com"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-xs font-sora-regular uppercase text-gray-500 mb-1"
                          >
                            Teléfono
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors"
                            placeholder="+54 9 11 2620-5030"
                          />
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-3 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors font-sora-regular flex items-center justify-center disabled:opacity-70 cursor-pointer"
                          >
                            {submitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                <span>Guardando...</span>
                              </>
                            ) : (
                              <>
                                <CheckIcon className="h-4 w-4 mr-2" />
                                <span>Guardar Cambios</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                name: userData.name || '',
                                email: userData.email || '',
                                phone: userData.phone || '',
                              });
                            }}
                            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-sora-regular flex items-center justify-center cursor-pointer"
                          >
                            <XMarkIcon className="h-4 w-4 mr-2" />
                            <span>Cancelar</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-nexa-bold text-gray-800">
                  Estado de la Cuenta
                </h3>
              </div>
              <div className="w-full p-6 flex justify-between lg:block">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-sora-regular">Cuenta Administrativa</p>
                    <p className="text-sm text-gray-500">
                      Desde {formatDate(userData.createdAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase font-sora-regular text-gray-500 mb-2">
                    Tipo de cuenta
                  </p>
                  <div className="flex items-center">
                    <span className="px-3 py-1 rounded-full text-xs font-sora-regular bg-purple-100 text-purple-800">
                      Administrador
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {userData.googleAuth && (
              <div className="px-6 py-4 lg:col-span-2 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-gray-600 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-sm text-gray-800 font-sora-regular">
                    Cuenta vinculada con Google
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
