import Image from 'next/image';
import { Heart as HeartIcon } from 'lucide-react';

export default function ProductCard({ imgSrc, imgAlt, title, price }) {
  return (
    <div className="w-full max-w-xs flex justify-center items-center flex-wrap bg-zinc-200 rounded-sm overflow-hidden shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.08)] hover:shadow-[0px_4px_8px_0px_rgba(0,_0,_0,_0.2)] transition-all ease-in-out duration-500">
      <Image
        src={imgSrc}
        alt={imgAlt}
        width={400}
        height={500}
        className="object-cover object-center w-full h-90"
      />

      <div className="p-4 flex justify-start items-center flex-wrap">
        <h2 className="text-sm mb-1 font-medium uppercase text-black">
          {title}
        </h2>
        <p className="w-full text-gray-500">${price}</p>
        <p className="text-gray-500">
          3 cuotas sin interés de ${(price / 3).toFixed(2)}
        </p>

        <button className="mt-1 flex justify-center items-center uppercase text-black">
          <HeartIcon className="mr-1 inline-block size-4.5 hover:text-red-600 transition-all ease-in-out duration-200" />
          Agregar a favoritos
        </button>
      </div>
    </div>
  );
}
