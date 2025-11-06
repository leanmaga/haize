// app/cookies/page.js
import CookiesPage from './CookiesPage';

export const metadata = {
  title: 'Configuración de Cookies | HAIZE',
  description:
    'Gestiona tus preferencias de cookies en HAIZE. Información sobre tipos de cookies y cómo controlarlas.',
  keywords: 'cookies, configuración, preferencias, analíticas, marketing',
  robots: 'index, follow',
  openGraph: {
    title: 'Configuración de Cookies | HAIZE',
    description:
      'Gestiona tus preferencias de cookies en HAIZE. Información sobre tipos de cookies y cómo controlarlas.',
    type: 'website',
  },
};

import React from 'react';

const page = () => {
  return (
    <>
      <CookiesPage />
    </>
  );
};

export default page;
