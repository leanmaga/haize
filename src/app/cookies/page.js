// app/cookies/page.js

import CookiesPage from '@/modules/coockies/CoockiesPage';

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

const page = () => {
  return (
    <>
      <CookiesPage />
    </>
  );
};

export default page;
