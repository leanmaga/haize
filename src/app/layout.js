import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import ReduxProvider from '@/redux/ReduxProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Haize - Fashion Store',
  description: 'Moda que inspira tu estilo',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ReduxProvider>{children}</ReduxProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
