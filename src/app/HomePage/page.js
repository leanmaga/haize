import Image from 'next/image';
import Navbar from '@/shared/components/Navbar';
import CustomLink from '@/shared/components/CustomLink';

export default function HomePage() {
  return (
    <div>
      <Navbar />

      <div className="relative w-full h-[120vh] min-h-200">
        <Image
          src="/assets/home-man2.jpg"
          alt="Home background"
          fill
          priority
          className="object-cover object-top"
        />

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-10 text-white text-center font-primary">
          <h3 className="text-4xl font-bold">&quot;Bienvenido a Haize&quot;</h3>

          <p className="m-5 text-lg">Moda que inspira tu estilo</p>

          <button className="cursor-pointer">
            <CustomLink href="/shop">Explorar Tienda</CustomLink>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 w-full h-screen">
        <div className="relative w-full h-screen">
          <Image
            src="/assets/clothes.jpg"
            alt="Clothes 1"
            fill
            className="object-cover object-top"
          />
        </div>

        <div className="relative w-full h-screen">
          <Image
            src="/assets/clothes2.jpg"
            alt="Clothes 2"
            fill
            className="object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
}
