import { SiTiktok, SiInstagram } from '@icons-pack/react-simple-icons';
import CustomLink from './CustomLink';
import { getSocialMediaUrls } from '@/config/socialMediaConfig';

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

      <div className="text-left max-md:w-full max-md:px-8.5 max-md:mt-6 max-md:text-center">
        <p className="mb-5 text-xl font-bold max-md:mb-2.5">NEWSLETTER</p>

        <p>10% OFF en tu primera compra</p>

        <form className="mt-2 flex flex-col gap-2">
          <input
            type="email"
            placeholder="Ingresa tu email"
            className="my-1 rounded-md border border-zinc-500 p-2 text-white"
          />
          <button className="max-w-max py-2 px-5 rounded-md bg-zinc-100 text-black font-medium hover:bg-zinc-400 transition-all ease-in-out duration-200 max-md:max-w-full">
            SUSCRIBIRSE
          </button>
        </form>
      </div>

      <div className="w-full mt-8 order-2 max-md:mt-4">
        <p className="mb-0.5">
          &copy; 2025{' '}
          <span className="italic">
            <CustomLink href="/">Haize</CustomLink>.{' '}
          </span>
          Todos los derechos reservados.
        </p>
        <p>
          Desarrollado por{' '}
          <span className="italic">
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
