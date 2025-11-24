import './globals.css';
import './fonts.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Providers } from './providers';
import Footer from '@/shared/components/Footer';
import Script from 'next/script';
import Navbar from '@/shared/components/Navbar';

export const metadata = {
  title: 'HAIZE | Moda Masculina Premium - Estilo Argentino',
  description:
    'Descubrí moda masculina de alta calidad en HAIZE. Ropa exclusiva, diseño minimalista y envío express en 24hs a Belgrano, Palermo, Las Cañitas, Colegiales y Núñez. Elegancia urbana para el hombre moderno.',
  keywords:
    'moda masculina, ropa hombre, indumentaria premium, moda argentina, estilo urbano, ropa elegante hombre, envío rápido CABA',
  authors: [{ name: 'HAIZE' }],
  creator: 'HAIZE',
  publisher: 'HAIZE',
  metadataBase: new URL('https://haize.com.ar'), // Reemplaza con tu dominio real
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: '/',
    title: 'HAIZE | Moda Masculina Premium - Estilo Argentino',
    description:
      'Ropa masculina de alta calidad con diseño minimalista. Envío express en 24hs a las mejores zonas de Buenos Aires.',
    siteName: 'HAIZE',
    images: [
      {
        url: '/og-image.jpg', // Deberás crear esta imagen
        width: 1200,
        height: 630,
        alt: 'HAIZE - Moda Masculina Premium',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HAIZE | Moda Masculina Premium',
    description: 'Ropa masculina de alta calidad con diseño minimalista.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/icono/haize_HZ_favicon_32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icono/haize_HZ_favicon_64.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        url: '/icono/haize_HZ_favicon_128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        url: '/icono/haize_HZ_favicon_256.png',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        url: '/icono/haize_HZ_favicon_512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    shortcut: '/icono/haize_HZ_favicon.ico',
    apple: [
      {
        url: '/icono/haize_HZ_favicon_256.png',
        sizes: '256x256',
        type: 'image/png',
      },
    ],
  },
  verification: {
    // Agrega estos cuando tengas las cuentas
    // google: 'tu-código-de-verificación',
    // yandex: 'tu-código-de-verificación',
  },
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Schema.org JSON-LD para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: 'HAIZE',
    description:
      'Tienda de moda masculina premium con diseño minimalista y estilo argentino',
    url: 'https://haize.com.ar', // Reemplaza con tu dominio real
    logo: 'https://haize.com.ar/icono/haize_HZ_favicon_256.png',
    image: 'https://haize.com.ar/og-image.jpg',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AR',
      addressRegion: 'Buenos Aires',
      addressLocality: 'Ciudad Autónoma de Buenos Aires',
    },
    priceRange: '$$',
    areaServed: ['Belgrano', 'Palermo', 'Las Cañitas', 'Colegiales', 'Núñez'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Catálogo de Ropa Masculina',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            name: 'Ropa Masculina Premium',
          },
        },
      ],
    },
  };

  return (
    <html lang="es">
      <head>
        {/* Script de Cloudinary */}
        <Script
          src="https://widget.cloudinary.com/v2.0/global/all.js"
          strategy="beforeInteractive"
        />
        {/* JSON-LD para Schema.org */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Providers session={session}>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
