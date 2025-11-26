import { SiTiktok, SiInstagram } from '@icons-pack/react-simple-icons';
import CustomLink from './CustomLink';
import { getSocialMediaUrls } from '@/config/socialMediaConfig';
import NewsletterForm from '@/modules/newsletter/components/NewsletterForm';

export default function Footer() {
  const [instagram, tiktok] = getSocialMediaUrls();

  return (
    <footer className="flex flex-wrap justify-around bg-zinc-900 text-white pt-10 pb-5 text-center">
      <div className="flex flex-col items-start gap-6.5 max-md:gap-4 max-md:items-center">
        <p className="text-xl font-bold">TE AYUDAMOS</p>
        <CustomLink href="/contact">Contacto</CustomLink>
        <CustomLink href="/returns">Cambios y devoluciones</CustomLink>
        <CustomLink href="/faq">Preguntas frecuentes</CustomLink>
        <CustomLink href="/consumer-protection">
          Defensa al consumidor
        </CustomLink>
      </div>

      <div className="flex flex-col justify-start items-start gap-6.5 max-md:gap-4 max-md:order-1 max-md:flex-row max-md:mt-4">
        <p className="text-xl font-bold max-md:hidden">SEGUINOS</p>
        <CustomLink href={tiktok.url}>
          <span className="max-md:hidden">Tiktok</span>
        </CustomLink>
        <a href={tiktok.url} className="hidden max-md:inline-block">
          <SiTiktok />
        </a>

        <CustomLink href={instagram.url}>
          <span className="max-md:hidden">Instagram</span>
        </CustomLink>
        <a href={instagram.url} className="hidden max-md:inline-block">
          <SiInstagram />
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
        <p className="mb-0.5">
          Desarrollado por{' '}
          <span className="font-nexa-bold uppercase">
            <CustomLink href="https://patagoniascript.vercel.app/">
              Patagoniascript
            </CustomLink>
          </span>
          .
        </p>
      </div>
    </footer>
  );
}
