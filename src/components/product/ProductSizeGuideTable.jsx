// components/product/ProductSizeGuideTable.jsx - VERSION DINAMICA UNIVERSAL
'use client';

/**
 * Componente universal que detecta AUTOMÁTICAMENTE todos los campos disponibles
 * Funciona para remeras, pantalones, shorts, musculosas, etc.
 */

// Mapeo de nombres técnicos a nombres legibles en español
const FIELD_LABELS = {
  // Medidas de prenda
  length: 'Largo',
  chest: 'Pecho',
  chestWidth: 'Ancho de Pecho',
  shoulder: 'Hombro',
  shoulderWidth: 'Ancho de Hombro',
  sleeve: 'Manga',
  sleeveLength: 'Largo de Manga',
  waist: 'Cintura',
  hip: 'Cadera',
  inseam: 'Tiro',
  thigh: 'Pierna',
  neck: 'Cuello',
  topLength: 'Largo de Buzo',
  topChest: 'Pecho (Buzo)',
  bottomLength: 'Largo de Pantalón',

  // Medidas corporales
  bustCircumference: 'Busto',
  waistCircumference: 'Cintura',
  hipCircumference: 'Cadera',
  neckCircumference: 'Cuello',
  height: 'Altura',
};

export default function ProductSizeGuideTable({ sizeGuide, category }) {
  // Si no hay guía o no tiene talles
  if (!sizeGuide || !sizeGuide.sizes || sizeGuide.sizes.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic py-4">
        No hay guía de talles disponible para este producto.
      </div>
    );
  }

  console.log('🔍 [SIZE GUIDE] Analizando guía:', {
    name: sizeGuide.name,
    category: sizeGuide.category,
    sizesCount: sizeGuide.sizes.length,
    firstSize: sizeGuide.sizes[0],
  });

  // ✅ DETECTAR DINÁMICAMENTE QUÉ CAMPOS EXISTEN
  const detectFields = (measurementType) => {
    const detectedFields = new Set();

    sizeGuide.sizes.forEach((size) => {
      const measurements =
        measurementType === 'garment'
          ? size.garmentMeasurements
          : size.bodyMeasurements;

      if (measurements) {
        Object.keys(measurements).forEach((key) => {
          // Solo agregar si el valor existe y no es null/undefined/0
          if (measurements[key] != null && measurements[key] !== 0) {
            detectedFields.add(key);
          }
        });
      }
    });

    return Array.from(detectedFields);
  };

  const garmentFields = detectFields('garment');
  const bodyFields = detectFields('body');

  console.log('📊 [SIZE GUIDE] Campos detectados:', {
    garment: garmentFields,
    body: bodyFields,
  });

  const hasAnyGarmentData = garmentFields.length > 0;
  const hasAnyBodyData = bodyFields.length > 0;

  // Función helper para obtener el valor de un campo
  const getMeasurement = (size, type, field) => {
    const measurements =
      type === 'garment' ? size.garmentMeasurements : size.bodyMeasurements;

    return measurements?.[field];
  };

  // Función helper para formatear el nombre del campo
  const getFieldLabel = (field) => {
    return FIELD_LABELS[field] || field;
  };

  return (
    <div className="space-y-6">
      {/* Título de la guía */}
      {sizeGuide.name && (
        <div className="mb-4">
          <h4 className="text-base font-semibold text-gray-900">
            {sizeGuide.name}
          </h4>
        </div>
      )}

      {/* ============ TABLA DE MEDIDAS DE LA PRENDA ============ */}
      {hasAnyGarmentData && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-lg">📏</span>
            Medidas de la Prenda
          </h5>
          <p className="text-xs text-gray-500 mb-3">
            Todas las medidas están en centímetros (cm)
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead className="bg-gray-100">
                <tr>
                  {/* Columna Talle - siempre se muestra */}
                  <th className="border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase sticky left-0 bg-gray-100 z-10">
                    Talle
                  </th>

                  {/* Columnas dinámicas según campos detectados */}
                  {garmentFields.map((field) => (
                    <th
                      key={field}
                      className="border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap"
                    >
                      {getFieldLabel(field)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeGuide.sizes.map((size, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Columna Talle */}
                    <td className="border border-gray-300 px-4 py-3 sticky left-0 bg-white z-10">
                      <div className="font-medium text-gray-900">
                        {size.labelSize}
                      </div>
                      {size.equivalencies && size.equivalencies.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {size.equivalencies.join(' · ')}
                        </div>
                      )}
                    </td>

                    {/* Columnas dinámicas de medidas */}
                    {garmentFields.map((field) => {
                      const value = getMeasurement(size, 'garment', field);
                      return (
                        <td
                          key={field}
                          className="border border-gray-300 px-4 py-3 text-gray-700 whitespace-nowrap"
                        >
                          {value ? (
                            <span className="font-medium">{value} cm</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ TABLA DE MEDIDAS CORPORALES ============ */}
      {hasAnyBodyData && (
        <div className="mt-6">
          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-lg">👤</span>
            Medidas Corporales Recomendadas
          </h5>
          <p className="text-xs text-gray-500 mb-3">
            Medidas del cuerpo para cada talle
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase sticky left-0 bg-blue-50 z-10">
                    Talle
                  </th>

                  {bodyFields.map((field) => (
                    <th
                      key={field}
                      className="border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap"
                    >
                      {getFieldLabel(field)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeGuide.sizes.map((size, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white z-10">
                      {size.labelSize}
                    </td>

                    {bodyFields.map((field) => {
                      const value = getMeasurement(size, 'body', field);
                      return (
                        <td
                          key={field}
                          className="border border-gray-300 px-4 py-3 text-gray-700 whitespace-nowrap"
                        >
                          {value ? (
                            <span className="font-medium">{value} cm</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ TIPS DE MEDICIÓN ============ */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h6 className="text-sm font-semibold text-gray-900 mb-2">
              Cómo medir correctamente
            </h6>
            <ul className="text-xs text-gray-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Medidas de la prenda:</strong> Coloca la prenda sobre
                  una superficie plana y mide de forma recta sin estirar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Medidas corporales:</strong> Usa una cinta métrica
                  flexible y mide alrededor del cuerpo sin apretar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Tip:</strong> Si tus medidas están entre dos talles,
                  te recomendamos elegir el talle más grande para mayor
                  comodidad.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-gray-500 border border-gray-300 rounded p-2">
          <summary className="cursor-pointer font-medium">Debug Info</summary>
          <pre className="mt-2 overflow-auto">
            {JSON.stringify(
              {
                category: sizeGuide.category,
                garmentFields,
                bodyFields,
                firstSize: sizeGuide.sizes[0],
              },
              null,
              2,
            )}
          </pre>
        </details>
      )}
    </div>
  );
}
