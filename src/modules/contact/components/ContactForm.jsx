'use client';

import { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    motivo: '',
    nombreApellido: '',
    telefono: '',
    email: '',
    localidad: '',
    pais: '',
    comentarios: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const motivoOptions = [
    { value: '', label: 'Seleccioná una opción' },
    { value: 'atencion-cliente', label: 'Atención al cliente' },
    { value: 'cambios', label: 'Cambios - (Compra Online)' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'corporativo', label: 'Atención Corporativa y Vtas. Mayoristas' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          motivo: '',
          nombreApellido: '',
          telefono: '',
          email: '',
          localidad: '',
          pais: '',
          comentarios: '',
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-sm p-8 md:p-12">
      {/* Título */}
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-wide mb-3">
        Formulario de Contacto
      </h2>

      {/* Subtítulo */}
      <p className="text-gray-500 text-sm md:text-base mb-8">
        Completá el formulario y te responderemos a la brevedad.
      </p>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        {/* Primera fila: Motivo, Nombre y Apellido, Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 mb-8">
          {/* Motivo */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-800 mb-3">
              Motivo <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <select
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                required
                className="w-full px-0 py-2.5 pr-8 bg-white border-0 border-b border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-gray-900 focus:ring-0 transition-colors appearance-none cursor-pointer"
              >
                {motivoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                <svg
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">
              Nombre y Apellido <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="nombreApellido"
              value={formData.nombreApellido}
              onChange={handleChange}
              required
              className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-300 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-0 transition-colors"
              placeholder=""
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">
              Teléfono <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-300 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-0 transition-colors"
              placeholder="Ingresa tu nro. de teléfono"
            />
          </div>
        </div>

        {/* Segunda fila: Email, Localidad, País */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 mb-8">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-300 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-0 transition-colors"
              placeholder=""
            />
          </div>

          {/* Localidad */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">
              Localidad <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="localidad"
              value={formData.localidad}
              onChange={handleChange}
              required
              className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-300 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-0 transition-colors"
              placeholder="Ingresa tu localidad"
            />
          </div>

          {/* País */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">
              País <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              required
              className="w-full px-0 py-2.5 bg-transparent border-0 border-b border-gray-300 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-0 transition-colors"
              placeholder="Ingresa tu país"
            />
          </div>
        </div>

        {/* Comentarios adicionales */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Comentarios adicionales
          </label>
          <textarea
            name="comentarios"
            value={formData.comentarios}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-3 bg-transparent border border-gray-300 rounded-sm text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors resize-none"
            placeholder="Ingresa tu consulta acá"
          />
        </div>

        {/* Mensajes de estado */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-sm">
            ¡Tu consulta fue enviada con éxito! Te responderemos a la brevedad.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-sm">
            Ocurrió un error al enviar tu consulta. Por favor, intentá
            nuevamente.
          </div>
        )}

        {/* Botón de envío */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Consulta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
