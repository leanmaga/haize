// app/terms/page.js
'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
              TÉRMINOS Y CONDICIONES DE USO
            </h1>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              1. INTRODUCCIÓN
            </h2>
            <p className="mb-4 text-gray-700">
              Bienvenido a HAIZE. Los siguientes términos y condiciones rigen el
              uso de nuestro sitio web y la compra de productos a través de
              nuestra plataforma. Al acceder a nuestro sitio web y utilizar
              nuestros servicios, usted acepta estar sujeto a estos términos y
              condiciones. Si no está de acuerdo con alguno de estos términos,
              le rogamos que no utilice nuestro sitio web.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              2. DEFINICIONES
            </h2>
            <ul className="mb-4 list-disc pl-5 text-gray-700">
              <li className="mb-2">
                &quot;Nosotros&quot;, &quot;nuestro&quot;,
                &quot;Campestre&quot;, &quot;HAIZE&quot; se refiere a nuestra
                empresa.
              </li>
              <li className="mb-2">
                &quot;Sitio web&quot; se refiere a la plataforma en línea de Sol
                Campestre.
              </li>
              <li className="mb-2">
                &quot;Usuario&quot;, &quot;usted&quot;, &quot;cliente&quot; se
                refiere a cualquier persona que acceda o utilice nuestro sitio
                web.
              </li>
              <li className="mb-2">
                &quot;Productos&quot; se refiere a los artículos ofrecidos a la
                venta en nuestro sitio web.
              </li>
              <li className="mb-2">
                &quot;Términos&quot; se refiere a estos términos y condiciones.
              </li>
            </ul>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              3. USO DEL SITIO WEB
            </h2>
            <h3 className="text-lg font-bold mb-2 text-gray-700">
              3.1. Elegibilidad
            </h3>
            <p className="mb-4 text-gray-700">
              Para utilizar nuestro sitio web y realizar compras, usted debe
              tener al menos 18 años de edad o contar con la supervisión de un
              padre o tutor legal.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              3.2. Cuenta de Usuario
            </h3>
            <p className="mb-4 text-gray-700">
              Algunos servicios pueden requerir que se registre y cree una
              cuenta. Usted es responsable de mantener la confidencialidad de su
              información de cuenta y contraseña, así como de restringir el
              acceso a su computadora. Usted acepta la responsabilidad de todas
              las actividades que ocurran bajo su cuenta.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              3.3. Restricción de Venta
            </h3>
            <p className="mb-4 text-gray-700">
              HAIZE es una plataforma exclusivamente para la compra de
              productos. Los usuarios no están autorizados a vender, revender,
              distribuir, o comercializar productos a través de nuestro sitio
              web. Cualquier intento de utilizar nuestra plataforma para tales
              fines está estrictamente prohibido.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              3.4. Conducta del Usuario
            </h3>
            <p className="mb-2 text-gray-700">
              Al utilizar nuestro sitio web, usted acepta no:
            </p>
            <ul className="mb-4 list-disc pl-5 text-gray-700">
              <li className="mb-2">
                Utilizar el sitio web de manera fraudulenta o en relación con un
                delito penal.
              </li>
              <li className="mb-2">
                Violar estos términos o cualquier ley o regulación aplicable.
              </li>
              <li className="mb-2">
                Enviar contenido abusivo, amenazante, difamatorio, obsceno o de
                acoso.
              </li>
              <li className="mb-2">
                Interferir con el funcionamiento normal del sitio web.
              </li>
              <li className="mb-2">
                Intentar vender o comercializar productos a través de nuestra
                plataforma.
              </li>
            </ul>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              4. PRODUCTOS Y SERVICIOS
            </h2>
            <h3 className="text-lg font-bold mb-2 text-gray-700">
              4.1. Disponibilidad de Productos
            </h3>
            <p className="mb-4 text-gray-700">
              Nos esforzamos por mantener actualizada la información sobre la
              disponibilidad de productos, pero no garantizamos que todos los
              productos mostrados estén disponibles en todo momento.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              4.2. Descripción de Productos
            </h3>
            <p className="mb-4 text-gray-700">
              Hacemos todo lo posible para mostrar con precisión los colores,
              dimensiones y detalles de nuestros productos. Sin embargo, no
              podemos garantizar que la visualización de los colores en su
              dispositivo sea exacta.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              5. PRECIOS Y PAGOS
            </h2>
            <h3 className="text-lg font-bold mb-2 text-gray-700">
              5.1. Precios
            </h3>
            <p className="mb-4 text-gray-700">
              Todos los precios se muestran en pesos argentinos (ARS) e incluyen
              el IVA correspondiente. Nos reservamos el derecho de modificar los
              precios en cualquier momento sin previo aviso.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              5.2. Métodos de Pago
            </h3>
            <p className="mb-4 text-gray-700">
              Aceptamos pagos a través de MercadoPago y en efectivo únicamente
              en nuestra tienda física. No aceptamos pagos directos con tarjeta
              de crédito a través de nuestro sitio web.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              5.3. Seguridad en los Pagos
            </h3>
            <p className="mb-4 text-gray-700">
              Los pagos realizados a través de MercadoPago están sujetos a sus
              propios términos y condiciones. MercadoPago proporciona protección
              al comprador según sus políticas vigentes.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              6. ENVÍOS Y ENTREGAS
            </h2>
            <h3 className="text-lg font-bold mb-2 text-gray-700">
              6.1. Política de Envíos
            </h3>
            <p className="mb-4 text-gray-700">
              No gestionamos envíos directamente. Los envíos se acuerdan
              directamente con el vendedor a través de WhatsApp. Los envíos solo
              se realizan dentro del territorio nacional argentino.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              6.2. Costos de Envío
            </h3>
            <p className="mb-4 text-gray-700">
              Los costos de envío se determinarán durante la comunicación
              directa con el vendedor vía WhatsApp y dependerán de la ubicación
              de entrega.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              6.3. Plazos de Entrega
            </h3>
            <p className="mb-4 text-gray-700">
              Los plazos de entrega serán acordados directamente con el
              vendedor. No nos responsabilizamos por retrasos causados por
              terceros encargados del transporte.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              7. POLÍTICA DE DEVOLUCIONES Y GARANTÍA
            </h2>
            <h3 className="text-lg font-bold mb-2 text-gray-700">
              7.1. Garantía
            </h3>
            <p className="mb-4 text-gray-700">
              Todos nuestros productos cuentan con una garantía de 7 días contra
              defectos de fabricación o desperfectos técnicos.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              7.2. Devoluciones
            </h3>
            <p className="mb-4 text-gray-700">
              Las devoluciones solo se aceptarán en caso de desperfectos
              técnicos y dentro del período de garantía de 7 días desde la
              recepción del producto. Para iniciar un proceso de devolución,
              debe contactarnos a través de WhatsApp o mediante nuestra sección
              de contacto.
            </p>

            <h3 className="text-lg font-bold mb-2 text-gray-700">
              7.3. Condiciones para la Devolución
            </h3>
            <p className="mb-4 text-gray-700">
              El producto debe ser devuelto en su embalaje original, junto con
              todos los accesorios y documentación. El cliente es responsable de
              los costos de envío para la devolución del producto.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              8. PROPIEDAD INTELECTUAL
            </h2>
            <p className="mb-4 text-gray-700">
              Todo el contenido del sitio web, incluyendo, pero no limitado a,
              textos, gráficos, logotipos, iconos, imágenes, clips de audio,
              descargas digitales y compilaciones de datos, es propiedad de Sol
              Campestre o de sus proveedores de contenido y está protegido por
              las leyes argentinas e internacionales de propiedad intelectual.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              9. LIMITACIÓN DE RESPONSABILIDAD
            </h2>
            <p className="mb-4 text-gray-700">
              En la medida permitida por la ley, HAIZE no será responsable por
              daños indirectos, incidentales, especiales, consecuentes o
              punitivos, ni por cualquier pérdida de beneficios o ingresos, ya
              sea directa o indirectamente, ni por cualquier pérdida de datos,
              uso, fondo de comercio u otras pérdidas intangibles.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              10. LEGISLACIÓN APLICABLE Y JURISDICCIÓN
            </h2>
            <p className="mb-4 text-gray-700">
              Estos términos se regirán e interpretarán de acuerdo con las leyes
              de la República Argentina. Cualquier disputa relacionada con estos
              términos estará sujeta a la jurisdicción exclusiva de los
              tribunales competentes de la ciudad donde se encuentra nuestra
              sede principal.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              11. MODIFICACIONES A LOS TÉRMINOS
            </h2>
            <p className="mb-4 text-gray-700">
              Nos reservamos el derecho de modificar estos términos en cualquier
              momento. Las modificaciones entrarán en vigor inmediatamente
              después de su publicación en el sitio web. Es su responsabilidad
              revisar periódicamente estos términos para estar al tanto de las
              actualizaciones.
            </p>

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              12. CONTACTO
            </h2>
            <p className="mb-4 text-gray-700">
              Si tiene alguna pregunta sobre estos términos, puede contactarnos
              a través de nuestra sección de contacto o directamente por
              WhatsApp.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
