// src/components/product/SizeGuideTable.jsx
'use client';

import { useState, useEffect } from 'react';

/**
 * Componente que muestra la tabla de talles inline
 * Se usa dentro de un acordeón en la página de producto
 *
 * @param {Object} props
 * @param {string} props.category - Categoría del producto (remeras, camisas, etc.)
 */
export default function SizeGuideTable({ category }) {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSizeGuide = async () => {
      try {
        const response = await fetch(`/api/size-guides?category=${category}`);
        const data = await response.json();

        if (data.success) {
          setGuide(data.guide);
        }
      } catch (error) {
        console.error('Error al cargar guía de talles:', error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchSizeGuide();
    } else {
      setLoading(false);
    }
  }, [category]);

  // Si está cargando
  if (loading) {
    return (
      <div className="text-sm text-gray-500 italic py-4">
        Cargando guía de talles...
      </div>
    );
  }

  // Si no hay guía para esta categoría
  if (!guide || guide.measurements.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Descripción */}
      {guide.description && (
        <p className="text-sm text-gray-600 mb-4">{guide.description}</p>
      )}

      {/* Tabla de medidas */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                Talle
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                Largo (cm)
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                Ancho (cm)
              </th>
              {category === 'shorts' &&
                guide.measurements.some((m) => m.stretchedWidth) && (
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                    Ancho Estirado
                  </th>
                )}
            </tr>
          </thead>
          <tbody>
            {guide.measurements.map((measurement, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-medium">
                  {measurement.size}
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {measurement.length} cm
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {measurement.width} cm
                </td>
                {category === 'shorts' && measurement.stretchedWidth && (
                  <td className="border border-gray-300 px-4 py-3">
                    {measurement.stretchedWidth} cm
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notas adicionales */}
      {guide.notes && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">📌 Nota:</span> {guide.notes}
          </p>
        </div>
      )}

      {/* Consejos generales */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">
          💡 Consejos para elegir tu talle:
        </h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>
            Las medidas están tomadas de forma recta sobre superficie plana
          </li>
          <li>Si estás entre dos talles, te recomendamos elegir el mayor</li>
          <li>Para cualquier duda, contáctanos por WhatsApp</li>
        </ul>
      </div>
    </div>
  );
}
