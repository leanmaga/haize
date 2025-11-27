// emails/NewsletterConfirmation.jsx
import React from 'react';

export default function NewsletterConfirmation({ confirmationUrl }) {
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
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          Confirma tu suscripción
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
          Estás a un paso de recibir nuestras novedades exclusivas y un{' '}
          <strong>10% de descuento</strong> en tu primera compra.
        </p>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <a
            href={confirmationUrl}
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
            CONFIRMAR SUSCRIPCIÓN
          </a>
        </div>

        <p
          style={{
            color: '#999999',
            fontSize: '14px',
            textAlign: 'center',
            marginTop: '30px',
          }}
        >
          Si no solicitaste esta suscripción, puedes ignorar este email.
        </p>

        <p
          style={{
            color: '#999999',
            fontSize: '12px',
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          Este enlace expirará en 24 horas.
        </p>
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
            margin: '10px 0 0 0',
          }}
        >
          © 2025 HAIZE. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
