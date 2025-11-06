import CustomLink from './CustomLink';

export default function Footer() {
  return (
    <footer className="flex flex-wrap justify-around bg-zinc-900 text-white pt-10 pb-5 text-center">
      <div className="flex flex-col items-start gap-6.5">
        <p className="text-xl font-bold">TE AYUDAMOS</p>
        <CustomLink href="/contact">Contacto</CustomLink>
        <CustomLink href="/returns">Cambios y devoluciones</CustomLink>
        <CustomLink href="/faq">Preguntas frecuentes</CustomLink>
        <CustomLink href="/consumer-protection">
          Defensa al consumidor
        </CustomLink>
      </div>

      <div className="flex flex-col items-start gap-6.5">
        <p className="text-xl font-bold">SEGUINOS</p>
        <CustomLink href="/">Facebook</CustomLink>
        <CustomLink href="/">Tiktok</CustomLink>
        <CustomLink href="/">Instagram</CustomLink>
        <CustomLink href="/">Youtube</CustomLink>
      </div>

      <div className="text-left">
        <p className="mb-5 text-xl font-bold">NEWSLETTER</p>

        <p>10% OFF en tu primera compra</p>

        <form className="mt-2 flex flex-col gap-2">
          <input
            type="email"
            placeholder="Ingresa tu email"
            className="my-1 rounded-md border border-zinc-500 p-2 text-white"
          />
          <button className="max-w-max py-2 px-5 rounded-md bg-zinc-500 text-black font-medium hover:bg-zinc-600 hover:text-white transition-all ease-in-out duration-200">
            SUSCRIBIRSE
          </button>
        </form>
      </div>

      <div className="w-full mt-8">
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
