import './globals.css';
import './fonts.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Providers } from './providers';
import Footer from '@/shared/components/Footer';
import Script from 'next/script';
import Navbar from '@/shared/components/Navbar';

export const metadata = {
  title: 'Haize - Moda que inspira tu estilo',
  description: 'Tienda de moda online',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="es">
      <head>
        {/* Script correcto de Cloudinary */}
        <Script
          src="https://widget.cloudinary.com/v2.0/global/all.js"
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
