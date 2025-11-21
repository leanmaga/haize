import Image from 'next/image';
import CustomLink from '@/shared/components/CustomLink';
import HomeProduct from './HomeProduct';
import HomeProductSlider from './HomeProductSlider';
import ProductSlider from '@/modules/products/ProductSlider';
import { getProducts } from '@/lib/data';

export default async function Home() {
  // Obtener productos destacados o una categoría específica
  const { products } = await getProducts({
    featured: true, // O puedes usar category: 'destacados'
    limit: 12, // Limitar la cantidad de productos
  });

  return (
    <>
      <div className="relative w-full h-[120vh] min-h-200">
        <Image
          src="/assets/portada.jpg"
          alt="Home background"
          fill
          priority
          className="object-cover object-top"
        />

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-10 text-white text-center font-primary">
          <h3 className="text-4xl font-bold">PRIMAVERA VERANO 2026</h3>
          <p className="m-5 text-lg">Moda que inspira tu estilo</p>
          <button className="cursor-pointer">
            <CustomLink href="/shop">Explorar Tienda</CustomLink>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 w-full min-h-[100dvh]">
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

      <HomeProductSlider>
        <HomeProduct
          width="w-[50vw]"
          imageSrc="/assets/clothes4.jpg"
          altText="Clothes 4"
          title="Camisa de mezclilla"
          description="Camisas clásica"
          linkTitle="Descubrir Más"
          link="/shop"
        />

        <HomeProduct
          width="w-[50vw]"
          imageSrc="/assets/clothes3.jpg"
          altText="Clothes 3"
          title="Camisa de mezclilla"
          description="Camisas clásica"
          linkTitle="Descubrir Más"
          link="/shop"
        />

        <HomeProduct
          width="w-[50vw]"
          imageSrc="/assets/clothes5.jpg"
          altText="Clothes 5"
          title="Camisa de rayas"
          description="Camisas moderna"
          linkTitle="Ver Más"
          link="/shop"
        />
      </HomeProductSlider>

      <div className="w-full min-h-[100dvh]">
        <video
          src="/assets/videohero.mp4"
          autoPlay
          loop
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {/* ProductSlider con productos reales */}
      <ProductSlider products={products} />
    </>
  );
}
