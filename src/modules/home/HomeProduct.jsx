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
      className={`block relative min-h-[100dvh] ${width} flex-none basis-auto`}
    >
      <Image
        src={imageSrc}
        alt={altText}
        fill
        className="object-cover object-top"
      />

      <div className="absolute bottom-1/8 left-1/12 transform text-white text-left font-primary">
        <h3 className="text-4xl font-bold">{title.toUpperCase()}</h3>

        <p className="my-5 text-lg">{description.toUpperCase()}</p>

        <button className="cursor-pointer">
          <CustomLink href={link}>{linkTitle.toUpperCase()}</CustomLink>
        </button>
      </div>
    </div>
  );
}
