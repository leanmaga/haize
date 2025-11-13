import Image from 'next/image';
import CustomLink from '@/shared/components/CustomLink';
import HomeProduct from './HomeProduct';
import HomeProductSlider from './HomeProductSlider';
import ProductSlider from '@/modules/products/ProductSlider';

export default function Home() {
  return (
    <>
      <div className="relative w-full h-[120vh] min-h-200">
        <Image
          src="/assets/home-man2.jpg"
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
        <HomeProduct
          imageSrc="/assets/clothes6.jpg"
          altText="Clothes 6"
          title="Camisa de mezclilla"
          description="Camisas clásica"
          linkTitle="Descubrir Más"
          link="/shop"
        />
      </div>

      <ProductSlider
        items={[
          {
            imgSrc: '/assets/clothes4.jpg',
            imgAlt: 'Clothes 4',
            title: 'Camisa de cuadros',
            price: 49.99,
          },
          {
            imgSrc: '/assets/clothes.jpg',
            imgAlt: 'Clothes 1',
            title: 'Remera básica',
            price: 29.99,
          },
          {
            imgSrc: '/assets/clothes2.jpg',
            imgAlt: 'Clothes 2',
            title: 'Pantalón clásico',
            price: 59.99,
          },
          {
            imgSrc: '/assets/clothes3.jpg',
            imgAlt: 'Clothes 3',
            title: 'Chaqueta ligera',
            price: 89.99,
          },
          {
            imgSrc: '/assets/clothes4.jpg',
            imgAlt: 'Clothes 4',
            title: 'Camisa de cuadros',
            price: 49.99,
          },
          {
            imgSrc: '/assets/clothes.jpg',
            imgAlt: 'Clothes 1',
            title: 'Remera básica',
            price: 29.99,
          },
          {
            imgSrc: '/assets/clothes3.jpg',
            imgAlt: 'Clothes 3',
            title: 'Chaqueta ligera',
            price: 89.99,
          },
          {
            imgSrc: '/assets/clothes4.jpg',
            imgAlt: 'Clothes 4',
            title: 'Camisa de cuadros',
            price: 49.99,
          },
          {
            imgSrc: '/assets/clothes.jpg',
            imgAlt: 'Clothes 1',
            title: 'Remera básica',
            price: 29.99,
          },
        ]}
      ></ProductSlider>
    </>
  );
}
