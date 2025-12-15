import Image from 'next/image';
import CustomLink from '@/shared/components/CustomLink';

export default function HomeProduct({
  imageSrc,
  altText,
  title,
  description,
  linkTitle,
  link,
  width = 'w-full',
}) {
  return (
    <div
      className={`block relative min-h-[175vh] ${width} flex-none basis-auto`}
    >
      <Image
        src={imageSrc}
        alt={altText}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-top"
      />

      {/* Overlay para mejor legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent md:bg-gradient-to-t md:from-black/40 md:via-transparent md:to-transparent" />

      {/* Contenido - Centrado en mobile, abajo-izquierda en desktop */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:bottom-1/8 md:left-1/12 text-white text-center md:text-left font-primary px-6 md:px-0 w-full md:w-auto">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          {title.toUpperCase()}
        </h3>

        <p className="my-3 md:my-5 text-sm sm:text-base md:text-lg">
          {description.toUpperCase()}
        </p>

        <button className="cursor-pointer mt-2">
          <CustomLink href={link}>{linkTitle.toUpperCase()}</CustomLink>
        </button>
      </div>
    </div>
  );
}
