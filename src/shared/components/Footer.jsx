// OPCIÓN 2: Footer usando el componente MercadoLibreIcon
// Primero guarda MercadoLibreIcon.jsx en src/components/icons/
// Luego usa este código en tu Footer

import { SiTiktok, SiInstagram } from '@icons-pack/react-simple-icons';
import CustomLink from './CustomLink';
import { getSocialMediaUrls } from '@/config/socialMediaConfig';
import NewsletterForm from '@/modules/newsletter/components/NewsletterForm';
import MercadoLibreIcon from '@/components/ui/MercadoLibreIcon';

export default function Footer() {
  const [instagram, tiktok, mercadolibre] = getSocialMediaUrls();

  return (
    <footer className="flex flex-wrap justify-around bg-zinc-900 text-white pt-10 pb-5 text-center">
      <div className="flex flex-col items-start gap-6.5 max-md:gap-4 max-md:items-center">
        <p className="text-xl font-bold">TE AYUDAMOS</p>
        <CustomLink href="/contact">Contacto</CustomLink>
        <CustomLink href="/privacy-policy">Politica de Privacidad</CustomLink>
        <CustomLink href="/cookies">Configuración de Cookies</CustomLink>
        <CustomLink href="/terms">Términos de Uso</CustomLink>
      </div>

      <div className="flex flex-col justify-start items-start gap-6.5 max-md:gap-4 max-md:order-1 max-md:flex-row max-md:mt-4">
        <p className="text-xl font-bold max-md:hidden">SEGUINOS</p>

        {/* TikTok - Desktop */}
        <a
          href={tiktok.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-300 transition-colors max-md:hidden"
        >
          Tiktok
        </a>

        {/* TikTok - Mobile */}
        <a
          href={tiktok.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden max-md:inline-block hover:text-gray-300 transition-colors"
          aria-label="Visitar TikTok de Haize"
        >
          <SiTiktok />
        </a>

        {/* Instagram - Desktop */}
        <a
          href={instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-300 transition-colors max-md:hidden"
        >
          Instagram
        </a>

        {/* Instagram - Mobile */}
        <a
          href={instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden max-md:inline-block hover:text-gray-300 transition-colors"
          aria-label="Visitar Instagram de Haize"
        >
          <SiInstagram />
        </a>

        {/* ✨ Mercado Libre - Desktop */}
        <a
          href={mercadolibre.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-300 transition-colors max-md:hidden"
        >
          Mercado Libre
        </a>

        {/* ✨ Mercado Libre - Mobile */}
        <a
          href={mercadolibre.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden max-md:inline-block hover:text-yellow-400 transition-colors"
          aria-label="Visitar Mercado Libre de Haize"
        >
          <MercadoLibreIcon className="w-6 h-6" />
        </a>
      </div>

      {/* Componente NewsletterForm reemplaza el formulario estático */}
      <NewsletterForm />

      <div className="w-full mt-8 order-2 max-md:mt-4">
        <p className="mb-0.5 font-nexa-bold">
          &copy; 2025{' '}
          <span className="font-nexa-bold uppercase">
            <CustomLink href="/">Haize</CustomLink>.{' '}
          </span>
          Todos los derechos reservados.
        </p>
        <p className="mb-0.5 text-xs">
          Desarrollado por{' '}
          <span className="font-nexa-bold uppercase">
            <a
              href="https://patagoniascript.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              Patagoniascript
            </a>
          </span>
          .
        </p>
      </div>
    </footer>
  );
}
