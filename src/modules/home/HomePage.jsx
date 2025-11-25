import Image from 'next/image';
import CustomLink from '@/shared/components/CustomLink';
import HomeProduct from './HomeProduct';
import HomeProductSlider from './HomeProductSlider';
import ProductSlider from '@/modules/products/ProductSlider';
import { getProducts } from '@/lib/data';

export default async function Home() {
  const { products } = await getProducts({
    featured: true,
    limit: 12,
  });

  return (
    <>
      {/* Hero Section */}
      <div className="relative w-full h-[100vh] md:h-[120vh] min-h-[600px]">
        {/* Imagen Desktop */}
        <Image
          src="https://res.cloudinary.com/dz7fsiwnu/image/upload/portada"
          alt="Home background"
          fill
          priority
          className="hidden md:block object-cover object-top"
        />

        {/* Imagen Mobile */}
        <Image
          src="https://res.cloudinary.com/dz7fsiwnu/image/upload/portadaMobil"
          alt="Home background mobile"
          fill
          priority
          className="block md:hidden object-cover object-center"
        />

        {/* Overlay para mejor legibilidad en mobile */}
        <div className="absolute inset-0 bg-black/20 md:bg-transparent" />

        {/* Contenido Hero */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:translate-y-10 text-white text-center px-4 w-full">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-nexa-bold mb-3 md:mb-0">
            PRIMAVERA VERANO 2026
          </h3>

          <button className="cursor-pointer mt-2 font-sora-regular">
            <CustomLink href="/products">Explorar Tienda</CustomLink>
          </button>
        </div>
      </div>

      {/* Grid de Productos - 1 columna en mobile, 2 en desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full">
        <HomeProduct
          imageSrc="/assets/clothes.jpg"
          altText="Clothes 1"
          title="Camisa de mezclilla"
          description="Camisas clásica"
          linkTitle="Descubrir Más"
          link="/shop"
        />

        <HomeProduct
          imageSrc="/assets/clothes2.jpg"
          altText="Clothes 2"
          title="Camisa de rayas"
          description="Camisas moderna"
          linkTitle="Ver Más"
          link="/shop"
        />
      </div>

      {/* Slider de Productos */}
      <HomeProductSlider>
        <HomeProduct
          width="w-[80vw] md:w-[50vw]"
          imageSrc="/assets/clothes4.jpg"
          altText="Clothes 4"
          title="Camisa de mezclilla"
          description="Camisas clásica"
          linkTitle="Descubrir Más"
          link="/shop"
        />

        <HomeProduct
          width="w-[80vw] md:w-[50vw]"
          imageSrc="/assets/clothes3.jpg"
          altText="Clothes 3"
          title="Camisa de mezclilla"
          description="Camisas clásica"
          linkTitle="Descubrir Más"
          link="/shop"
        />

        <HomeProduct
          width="w-[80vw] md:w-[50vw]"
          imageSrc="/assets/clothes5.jpg"
          altText="Clothes 5"
          title="Camisa de rayas"
          description="Camisas moderna"
          linkTitle="Ver Más"
          link="/shop"
        />
      </HomeProductSlider>

      {/* Video Hero */}
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
