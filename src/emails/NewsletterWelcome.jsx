// emails/NewsletterWelcome.jsx
import React from 'react';

export default function NewsletterWelcome({ discountCode, email }) {
  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#000000',
          padding: '40px 20px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            color: '#ffffff',
            fontSize: '32px',
            fontWeight: '700',
            margin: '0',
            letterSpacing: '2px',
          }}
        >
          HAIZE
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: '40px 20px' }}>
        <h2
          style={{
            color: '#000000',
            fontSize: '28px',
            fontWeight: '600',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          ¡Bienvenido a HAIZE!
        </h2>

        <p
          style={{
            color: '#666666',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          Gracias por unirte a nuestra comunidad. Como agradecimiento, aquí está
          tu código de descuento exclusivo:
        </p>

        {/* Discount Code */}
        <div
          style={{
            backgroundColor: '#f5f5f5',
            border: '2px dashed #000000',
            padding: '30px',
            textAlign: 'center',
            margin: '30px 0',
          }}
        >
          <p
            style={{
              color: '#999999',
              fontSize: '14px',
              margin: '0 0 10px 0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Tu código de descuento
          </p>
          <p
            style={{
              color: '#000000',
              fontSize: '32px',
              fontWeight: '700',
              margin: '0',
              letterSpacing: '3px',
            }}
          >
            {discountCode}
          </p>
          <p
            style={{
              color: '#666666',
              fontSize: '18px',
              fontWeight: '600',
              margin: '15px 0 0 0',
            }}
          >
            10% OFF
          </p>
          <p
            style={{
              color: '#999999',
              fontSize: '14px',
              margin: '10px 0 0 0',
            }}
          >
            En tu primera compra
          </p>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <a
            href={`${
              process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
            }/products`}
            style={{
              display: 'inline-block',
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '16px 40px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              letterSpacing: '1px',
              borderRadius: '4px',
            }}
          >
            EXPLORAR COLECCIÓN
          </a>
        </div>

        {/* Benefits */}
        <div
          style={{
            borderTop: '1px solid #e0e0e0',
            paddingTop: '30px',
            marginTop: '40px',
          }}
        >
          <p
            style={{
              color: '#000000',
              fontSize: '18px',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            ¿Qué puedes esperar de nosotros?
          </p>

          <div style={{ marginBottom: '15px' }}>
            <p
              style={{
                color: '#666666',
                fontSize: '14px',
                margin: '0',
                lineHeight: '1.6',
              }}
            >
              ✓ Novedades exclusivas antes que nadie
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p
              style={{
                color: '#666666',
                fontSize: '14px',
                margin: '0',
                lineHeight: '1.6',
              }}
            >
              ✓ Ofertas especiales para suscriptores
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p
              style={{
                color: '#666666',
                fontSize: '14px',
                margin: '0',
                lineHeight: '1.6',
              }}
            >
              ✓ Entrega express 24hs en zonas seleccionadas
            </p>
          </div>

          <div>
            <p
              style={{
                color: '#666666',
                fontSize: '14px',
                margin: '0',
                lineHeight: '1.6',
              }}
            >
              ✓ Consejos de estilo y tendencias
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '30px 20px',
          textAlign: 'center',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <p
          style={{
            color: '#666666',
            fontSize: '14px',
            margin: '0 0 10px 0',
          }}
        >
          Entrega express 24hs en Belgrano, Palermo, Las Cañitas, Colegiales y
          Núñez
        </p>
        <p
          style={{
            color: '#999999',
            fontSize: '12px',
            margin: '10px 0',
          }}
        >
          © 2025 HAIZE. Todos los derechos reservados.
        </p>
        <a
          href={`${
            process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
          }/newsletter/unsubscribe?email=${encodeURIComponent(email)}`}
          style={{
            color: '#999999',
            fontSize: '12px',
            textDecoration: 'underline',
          }}
        >
          Cancelar suscripción
        </a>
      </div>
    </div>
  );
}
