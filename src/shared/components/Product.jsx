export default function Product({ link, url }) {
  return (
    <div className="relative w-full h-screen">
      <Image
        src="/assets/clothes.jpg"
        alt="Clothes 1"
        fill
        className="object-cover object-top"
      />
    </div>
  );
}
