import Image from 'next/image';
import CustomLink from '@/shared/components/CustomLink';
import HomeProduct from './HomeProduct';
import HomeProductSlider from './HomeProductSlider';
import ProductSlider from '@/modules/products/ProductSlider';
import { getProducts } from '@/lib/data';
// import BlackFridayBanner from './components/BlackFridayBanner';
import PageLoader from './components/PageLoader';

export default async function Home() {
  const { products } = await getProducts({
    featured: true,
    limit: 12,
  });

  const homeProducts = [
    {
      imageSrc: '/assets/clothes3.jpg',
      altText: 'Clothes 4',
      title: 'SET WAFFLE ESSENTIAL',
      description:
        'Algodón waffle texturado. Silueta relajada. El uniforme del verano contemporáneo.',
      linkTitle: 'Descubrir Más',
    },
    {
      imageSrc: '/assets/clothes2.png',
      altText: 'Clothes 3',
      title: 'CAMISA RELAXED ESSENTIAL',
      description:
        'Algodón texturado. Silueta cómoda. Estilo minimal para uso diario.',
      linkTitle: 'Ver Más',
    },
    {
      imageSrc: '/assets/clothes6.jpg',
      altText: 'Clothes 5',
      title: 'CAMISA ESSENTIAL TEXTURADA',
      description:
        'Algodón texturado de tacto suave. Silueta relajada. Diseño versátil para uso diario.',
      linkTitle: 'Descubrir Más',
    },
    {
      imageSrc: '/assets/clothes7.png',
      altText: 'Clothes 3',
      title: 'REMERA ESSENTIAL TEXTURADA',
      description:
        'Algodón texturado. Silueta cómoda. Estilo minimal para uso diario.',
      linkTitle: 'Ver Más',
    },
    {
      imageSrc: '/assets/clothes5.jpg',
      altText: 'Clothes 5',
      title: 'REMERA ESSENTIAL TEXTURADA',
      description:
        'Algodón texturado de tacto suave. Silueta relajada. Diseño versátil para uso diario.',
      linkTitle: 'Descubrir Más',
    },
  ];

  return (
    <>
      <PageLoader />

      {/* Hero Section */}
      <div className="relative w-full h-[100vh] md:h-[120vh] min-h-[600px]">
        {/* Imagen Desktop */}
        <Image
          src="https://res.cloudinary.com/dz7fsiwnu/image/upload/portada"
          alt="Home background"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="hidden md:block object-cover object-top"
        />

        {/* Imagen Mobile */}
        <Image
          src="https://res.cloudinary.com/dz7fsiwnu/image/upload/portadaMobil"
          alt="Home background mobile"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 0px"
          quality={90}
          className="block md:hidden object-cover object-center"
        />

        {/* Overlay para mejor legibilidad en mobile */}
        <div className="absolute inset-0 bg-black/20 md:bg-transparent" />

        {/* Contenido Hero */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:translate-y-10 text-white text-center px-4 w-full flex flex-col items-center gap-4">
          {/* Título con fondo difuminado */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-black/70 blur-xl"></div>
            <h3 className="relative text-2xl sm:text-3xl md:text-4xl font-nexa-bold px-6 py-3">
              PRIMAVERA VERANO 2026
            </h3>
          </div>

          {/* Botón con fondo difuminado */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-black/70 blur-xl"></div>
            <button className="relative cursor-pointer font-sora-regular px-5 py-2">
              <CustomLink href="/products">Explorar Tienda</CustomLink>
            </button>
          </div>
        </div>
      </div>
      {/* <BlackFridayBanner /> */}
      {/* Grid de Productos - 1 columna en mobile, 2 en desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full">
        <HomeProduct
          imageSrc="/assets/clothes2.png"
          altText="Clothes 1"
          title="CAMISA ESSENTIAL PERFORADA"
          description="Tejido calado de algodón. Cuello abierto tipo resort. Frescura y elegancia relajada."
          linkTitle="Descubrir Más"
          link="/products/692a41f813ad12598ac559d8"
        />

        <HomeProduct
          imageSrc="/assets/clothes.png"
          altText="Clothes 2"
          title="SET ESSENTIAL TEXTURADO"
          description="Algodón texturado de tacto suave. Silueta relajada.Versatilidad absoluta."
          linkTitle="Ver Más"
          link="/products/692872216e8daddf1277cb57"
        />
      </div>

      {/* Slider de Productos */}

      <HomeProductSlider
        cardWidth="w-[100vw] md:w-[calc(100vw/3)]"
        cardHeight="min-h-[100dvh]"
        products={homeProducts}
      />

      {/* Video  */}
      <div className="w-full h-[70vh] md:h-[100vh] min-h-[500px]">
        <video
          src="/assets/videohero.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* ProductSlider con productos reales */}
      <div className="py-8 md:py-12">
        <ProductSlider products={products} />
      </div>
    </>
  );
}
