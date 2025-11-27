import Link from 'next/link';

const CustomLink = ({
  barColor = 'bg-white',
  href,
  onClick,
  onMouseEnter,
  children,
}) => {
  const className = 'group relative inline-block cursor-pointer';
  const content = (
    <>
      <span className="relative z-10">{children}</span>
      <span
        className={`absolute left-0 -bottom-0.25 h-0.25 w-0 ${barColor} transition-all duration-300 group-hover:w-full`}
        aria-hidden="true"
      />
    </>
  );

  // Si tiene href, usar Link
  if (href) {
    return (
      <Link href={href} className={className} onMouseEnter={onMouseEnter}>
        {content}
      </Link>
    );
  }

  // Si tiene onClick o solo onMouseEnter, usar button
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={className}
      type="button"
    >
      {content}
    </button>
  );
};

export default CustomLink;
