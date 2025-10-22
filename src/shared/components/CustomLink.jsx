import Link from 'next/link';

const CustomLink = ({ href, children }) => {
  return (
    <Link href={href} className="group relative inline-block">
      <span className="relative z-10">{children}</span>
      <span
        className="absolute left-0 -bottom-0.25 h-0.25 w-0 bg-white transition-all duration-300 group-hover:w-full"
        aria-hidden="true"
      />
    </Link>
  );
};

export default CustomLink;
