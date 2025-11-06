'use client';

import { useState } from 'react';

export default function CookiesPage() {
  const [analyticalCookies, setAnalyticalCookies] = useState(true);
  const [marketingCookies, setMarketingCookies] = useState(false);

  const handleSavePreferences = () => {
    // Aquí guardarías las preferencias del usuario
    console.log('Preferencias guardadas:', {
      analytical: analyticalCookies,
      marketing: marketingCookies,
    });
    alert('Preferencias de cookies guardadas exitosamente');
  };

  const handleRejectAll = () => {
    setAnalyticalCookies(false);
    setMarketingCookies(false);
    console.log('Todas las cookies rechazadas');
    alert('Se han rechazado todas las cookies opcionales');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
              CONFIGURACIÓN DE COOKIES
            </h1>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              1. ¿QUÉ SON LAS COOKIES?
            </h2>
            <p className="mb-4 text-gray-700">
              Las cookies son pequeños archivos de texto que se almacenan en su
              dispositivo (computadora, teléfono móvil o tablet) cuando visita
              un sitio web. Las cookies ayudan a los sitios web a recordar sus
              preferencias y a entender cómo los usuarios navegan e interactúan
              con los sitios.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              2. TIPOS DE COOKIES QUE UTILIZAMOS
            </h2>
            <h3 className="text-lg font-bold mb-2 text-gray-700">
              2.1. Cookies Esenciales
            </h3>
            <p className="mb-4 text-gray-700">
              Estas cookies son necesarias para el funcionamiento básico de
              nuestro sitio web. Le permiten navegar por el sitio y utilizar sus
              funciones, como acceder a áreas seguras. Sin estas cookies, no
              podríamos proporcionar los servicios que usted solicita.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              2.2. Cookies de Preferencias
            </h3>
            <p className="mb-4 text-gray-700">
              Estas cookies permiten que nuestro sitio web recuerde información
              que cambia la forma en que el sitio se comporta o se ve, como su
              idioma preferido o la región en la que se encuentra.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              2.3. Cookies Analíticas
            </h3>
            <p className="mb-4 text-gray-700">
              Utilizamos cookies analíticas para recopilar información sobre
              cómo los visitantes utilizan nuestro sitio web. Estas cookies nos
              ayudan a mejorar nuestro sitio, por ejemplo, asegurando que los
              usuarios encuentren fácilmente lo que buscan.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              2.4. Cookies de Marketing
            </h3>
            <p className="mb-4 text-gray-700">
              Estas cookies se utilizan para rastrear a los visitantes en los
              sitios web. La intención es mostrar anuncios relevantes y
              atractivos para el usuario individual, y por tanto, más valiosos
              para los editores y anunciantes terceros.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              2.5. Cookies de Redes Sociales
            </h3>
            <p className="mb-4 text-gray-700">
              Estas cookies están establecidas por una serie de servicios de
              redes sociales que hemos añadido al sitio para permitirle
              compartir nuestro contenido con sus amigos y redes. Son capaces de
              rastrear su navegador a través de otros sitios y crear un perfil
              de sus intereses.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              3. COOKIES DE TERCEROS
            </h2>
            <p className="mb-4 text-gray-700">
              Algunos de nuestros socios, como MercadoPago, pueden establecer
              cookies en su dispositivo cuando visita nuestro sitio web. Estas
              cookies permiten que estos terceros recopilen información para sus
              propios propósitos, como rastrear el rendimiento de sus servicios
              o personalizar sus ofertas.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              4. GESTIÓN DE COOKIES
            </h2>
            <p className="mb-4 text-gray-700">
              La mayoría de los navegadores web permiten cierto control de la
              mayoría de las cookies a través de la configuración del navegador.
              Para saber más sobre las cookies y cómo gestionarlas o
              eliminarlas, visite{' '}
              <a
                href="http://www.allaboutcookies.org"
                className="text-yellow-600 hover:text-yellow-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.allaboutcookies.org
              </a>
              .
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              4.1. Cómo Deshabilitar las Cookies
            </h3>
            <p className="mb-4 text-gray-700">
              Puede rechazar, aceptar o eliminar cookies de nuestro sitio web en
              cualquier momento modificando la configuración de su navegador.
              Para hacerlo, siga las instrucciones proporcionadas por su
              navegador (generalmente ubicadas en las opciones de
              &quot;ayuda&quot;, &quot;herramientas&quot; o &quot;editar&quot;).
            </p>

            <p className="mb-4 text-gray-700">
              Tenga en cuenta que si elige deshabilitar las cookies, es posible
              que no pueda acceder a ciertas áreas de nuestro sitio web o que
              algunas de sus funciones no estén disponibles o no funcionen
              correctamente.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              4.2. Opciones Específicas del Navegador
            </h3>
            <p className="mb-4 text-gray-700">
              A continuación, se muestra cómo puede gestionar las cookies en los
              navegadores más populares:
            </p>
            <ul className="mb-4 list-disc pl-5 text-gray-700">
              <li className="mb-1">
                <strong>Google Chrome</strong>: Configuración &gt; Privacidad y
                seguridad &gt; Cookies y otros datos del sitio
              </li>
              <li className="mb-1">
                <strong>Firefox</strong>: Opciones &gt; Privacidad &amp;
                Seguridad &gt; Cookies y datos del sitio
              </li>
              <li className="mb-1">
                <strong>Safari</strong>: Preferencias &gt; Privacidad
              </li>
              <li className="mb-1">
                <strong>Internet Explorer / Microsoft Edge</strong>:
                Configuración &gt; Privacidad, búsqueda y servicios &gt; Cookies
              </li>
            </ul>

            {/* Panel de configuración de cookies */}
            <div className="mt-8 mb-8 p-6 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-bold mb-4 text-gray-800">
                Sus preferencias de cookies
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between border border-gray-300 p-4 rounded bg-white">
                  <div>
                    <h4 className="font-bold text-gray-800">
                      Cookies Esenciales
                    </h4>
                    <p className="text-sm text-gray-600">
                      Necesarias para el funcionamiento del sitio web
                    </p>
                  </div>
                  <div className="text-gray-400 font-medium">
                    Siempre activas
                  </div>
                </div>

                <div className="flex items-center justify-between border border-gray-300 p-4 rounded bg-white">
                  <div>
                    <h4 className="font-bold text-gray-800">
                      Cookies Analíticas
                    </h4>
                    <p className="text-sm text-gray-600">
                      Nos ayudan a mejorar nuestro sitio web
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={analyticalCookies}
                      onChange={(e) => setAnalyticalCookies(e.target.checked)}
                    />
                    <div
                      className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        analyticalCookies ? 'bg-yellow-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  </label>
                </div>

                <div className="flex items-center justify-between border border-gray-300 p-4 rounded bg-white">
                  <div>
                    <h4 className="font-bold text-gray-800">
                      Cookies de Marketing
                    </h4>
                    <p className="text-sm text-gray-600">
                      Utilizadas para mostrar anuncios relevantes
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={marketingCookies}
                      onChange={(e) => setMarketingCookies(e.target.checked)}
                    />
                    <div
                      className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        marketingCookies ? 'bg-yellow-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded hover:bg-yellow-50 transition-colors"
                >
                  Rechazar todo
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                >
                  Guardar preferencias
                </button>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              5. COOKIES UTILIZADAS EN NUESTRO SITIO WEB
            </h2>
            <p className="mb-4 text-gray-700">
              A continuación se presenta una lista de las principales cookies
              que utilizamos en nuestro sitio web:
            </p>

            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="border border-gray-300 p-3 text-left text-gray-800 font-bold">
                      Nombre de la Cookie
                    </th>
                    <th className="border border-gray-300 p-3 text-left text-gray-800 font-bold">
                      Tipo
                    </th>
                    <th className="border border-gray-300 p-3 text-left text-gray-800 font-bold">
                      Propósito
                    </th>
                    <th className="border border-gray-300 p-3 text-left text-gray-800 font-bold">
                      Duración
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      sessionId
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      Esencial
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      Mantiene su sesión activa durante la navegación
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      Sesión
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3 text-gray-700">
                      language
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      Preferencia
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      Almacena su preferencia de idioma
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      1 año
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      _ga
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      Analítica
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      Utilizada por Google Analytics para distinguir usuarios
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      2 años
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3 text-gray-700">
                      _gid
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      Analítica
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      Utilizada por Google Analytics para distinguir usuarios
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      24 horas
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      mp_*
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      Terceros
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      Cookies de MercadoPago para procesar pagos
                    </td>
                    <td className="border border-gray-300 p-3 text-gray-700">
                      Varía
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              6. CAMBIOS EN NUESTRA POLÍTICA DE COOKIES
            </h2>
            <p className="mb-4 text-gray-700">
              Nos reservamos el derecho de modificar esta política de cookies en
              cualquier momento. Cualquier cambio en nuestra política de cookies
              se publicará en esta página y, si los cambios son significativos,
              se le proporcionará un aviso más destacado.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              7. CONTACTO
            </h2>
            <p className="mb-4 text-gray-700">
              Si tiene alguna pregunta sobre nuestra política de cookies, puede
              contactarnos a través de nuestra sección de contacto.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
