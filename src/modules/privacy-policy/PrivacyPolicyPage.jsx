// src/app/privacy-policy/page.js
'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
              POLÍTICA DE PRIVACIDAD
            </h1>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              1. INTRODUCCIÓN
            </h2>
            <p className="mb-4 text-gray-700">
              En HAIZE, nos comprometemos a proteger su privacidad. Esta
              Política de Privacidad explica cómo recopilamos, utilizamos,
              divulgamos y protegemos su información personal cuando utiliza
              nuestro sitio web. Al acceder o utilizar nuestro sitio web, usted
              acepta las prácticas descritas en esta política.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              2. INFORMACIÓN QUE RECOPILAMOS
            </h2>
            <h3 className="text-lg font-bold mb-2 text-gray-700">
              2.1. Información Personal
            </h3>
            <p className="mb-2 text-gray-700">
              Podemos recopilar la siguiente información personal:
            </p>
            <ul className="mb-4 list-disc pl-5 text-gray-700">
              <li className="mb-1">Nombre y apellido</li>
              <li className="mb-1">Dirección de correo electrónico</li>
              <li className="mb-1">Número de teléfono</li>
              <li className="mb-1">Dirección postal</li>
              <li className="mb-1">
                Información de pago (procesada a través de MercadoPago)
              </li>
              <li className="mb-1">
                Cualquier otra información que usted nos proporcione
                voluntariamente
              </li>
            </ul>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              2.2. Información de Uso
            </h3>
            <p className="mb-4 text-gray-700">
              También recopilamos información sobre cómo interactúa con nuestro
              sitio web, incluyendo:
            </p>
            <ul className="mb-4 list-disc pl-5 text-gray-700">
              <li className="mb-1">Dirección IP</li>
              <li className="mb-1">Tipo de navegador</li>
              <li className="mb-1">Páginas visitadas</li>
              <li className="mb-1">Tiempo de permanencia en el sitio</li>
              <li className="mb-1">Referencias y enlaces de salida</li>
            </ul>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              2.3. Cookies y Tecnologías Similares
            </h3>
            <p className="mb-4 text-gray-700">
              Utilizamos cookies y tecnologías similares para mejorar su
              experiencia en nuestro sitio web. Para más información sobre cómo
              utilizamos las cookies, consulte nuestra{' '}
              <a
                href="/cookies"
                className="text-yellow-600 hover:text-yellow-700 transition-colors"
              >
                Configuración de Cookies
              </a>
              .
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              3. CÓMO UTILIZAMOS SU INFORMACIÓN
            </h2>
            <p className="mb-2 text-gray-700">
              Utilizamos la información recopilada para:
            </p>
            <ul className="mb-4 list-disc pl-5 text-gray-700">
              <li className="mb-1">Procesar y completar sus pedidos</li>
              <li className="mb-1">
                Comunicarnos con usted sobre su pedido o consulta
              </li>
              <li className="mb-1">
                Facilitar la coordinación de envíos a través de WhatsApp
              </li>
              <li className="mb-1">Mejorar nuestro sitio web y servicios</li>
              <li className="mb-1">
                Enviar boletines informativos y materiales promocionales (si ha
                dado su consentimiento)
              </li>
              <li className="mb-1">Prevenir fraudes y actividades ilegales</li>
              <li className="mb-1">
                Cumplir con nuestras obligaciones legales
              </li>
            </ul>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              4. COMPARTICIÓN DE INFORMACIÓN
            </h2>
            <h3 className="text-lg font-bold mb-2 text-gray-700">
              4.1. Proveedores de Servicios
            </h3>
            <p className="mb-4 text-gray-700">
              Podemos compartir su información con proveedores de servicios de
              terceros que nos ayudan a operar nuestro sitio web o a llevar a
              cabo nuestras actividades comerciales, como:
            </p>
            <ul className="mb-4 list-disc pl-5 text-gray-700">
              <li className="mb-1">
                MercadoPago (para el procesamiento de pagos)
              </li>
              <li className="mb-1">
                Servicios de mensajería (para la coordinación de entregas)
              </li>
              <li className="mb-1">Proveedores de servicios de análisis web</li>
            </ul>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              4.2. Requisitos Legales
            </h3>
            <p className="mb-4 text-gray-700">
              Podemos divulgar su información personal si estamos obligados a
              hacerlo por ley o en respuesta a solicitudes válidas de
              autoridades públicas.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              4.3. Transferencias Comerciales
            </h3>
            <p className="mb-4 text-gray-700">
              Si HAIZE participa en una fusión, adquisición o venta de activos,
              su información personal puede ser transferida como parte de esa
              transacción.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              5. SEGURIDAD DE LA INFORMACIÓN
            </h2>
            <h3 className="text-lg font-bold mb-2 text-gray-700">
              5.1. Medidas de Seguridad
            </h3>
            <p className="mb-4 text-gray-700">
              Implementamos medidas de seguridad diseñadas para proteger su
              información personal contra el acceso, la alteración, la
              divulgación o la destrucción no autorizados. Sin embargo, ninguna
              transmisión de datos por Internet o sistema de almacenamiento
              electrónico puede garantizarse como 100% seguro.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              5.2. Almacenamiento de Datos
            </h3>
            <p className="mb-4 text-gray-700">
              Todos los datos personales recopilados a través de nuestro sitio
              web son almacenados en MongoDB, una base de datos no relacional
              que implementa medidas de seguridad robustas. El acceso a esta
              base de datos está estrictamente controlado y limitado a personal
              autorizado. Realizamos copias de seguridad regulares para
              garantizar la integridad de sus datos.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              6. SUS DERECHOS
            </h2>
            <p className="mb-4 text-gray-700">
              De acuerdo con la Ley de Protección de Datos Personales de
              Argentina (Ley 25.326), usted tiene derecho a:
            </p>
            <ul className="mb-4 list-disc pl-5 text-gray-700">
              <li className="mb-1">Acceder a su información personal</li>
              <li className="mb-1">Rectificar información inexacta</li>
              <li className="mb-1">
                Solicitar la eliminación de su información
              </li>
              <li className="mb-1">Oponerse al tratamiento de sus datos</li>
              <li className="mb-1">
                Presentar una reclamación ante la autoridad de control
              </li>
            </ul>

            <p className="mb-4 text-gray-700">
              Para ejercer estos derechos, contáctenos a través de nuestra
              sección de contacto.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              7. RETENCIÓN DE DATOS
            </h2>
            <p className="mb-4 text-gray-700">
              Conservaremos su información personal solo durante el tiempo
              necesario para cumplir con los fines para los que la recopilamos,
              incluyendo el cumplimiento de requisitos legales, contables o de
              informes.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              8. MENORES DE EDAD
            </h2>
            <p className="mb-4 text-gray-700">
              Nuestro sitio web no está dirigido a personas menores de 18 años.
              No recopilamos a sabiendas información personal de menores de 18
              años. Si usted es padre o tutor y cree que su hijo nos ha
              proporcionado información personal, contáctenos y tomaremos
              medidas para eliminar esa información.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              9. ENLACES A SITIOS DE TERCEROS
            </h2>
            <p className="mb-4 text-gray-700">
              Nuestro sitio web puede contener enlaces a sitios web de terceros.
              No tenemos control sobre el contenido y las prácticas de
              privacidad de esos sitios y no nos hacemos responsables de ellos.
              Le recomendamos revisar las políticas de privacidad de cualquier
              sitio que visite.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              10. CAMBIOS A ESTA POLÍTICA
            </h2>
            <p className="mb-4 text-gray-700">
              Nos reservamos el derecho de modificar esta política en cualquier
              momento. Las modificaciones entrarán en vigor inmediatamente
              después de su publicación en el sitio web. Le recomendamos revisar
              periódicamente esta política para estar al tanto de cualquier
              cambio.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              11. CONTACTO
            </h2>
            <p className="mb-4 text-gray-700">
              Si tiene preguntas o inquietudes sobre esta Política de
              Privacidad, puede contactarnos a través de nuestra sección de
              contacto.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
