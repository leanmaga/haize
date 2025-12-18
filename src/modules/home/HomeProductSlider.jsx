'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HomeProduct from './HomeProduct';

export default function HomeProductSlider({
  cardWidth,
  cardHeight,
  products = [],
}) {
  const sliderRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    const update = () => {
      setCanLeft(el.scrollLeft > 0);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const doScroll = (dir) => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8);
    el.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative ">
      {/* Left button */}
      <button
        aria-label="Scroll left"
        onClick={() => doScroll('left')}
        disabled={!canLeft}
        className={`cursor-pointer absolute z-10 top-1/2 -translate-y-1/2 left-0 py-2 flex items-center justify-center transition-opacity duration-200 ${
          canLeft ? 'opacity-100' : 'opacity-70 pointer-events-none'
        }`}
      >
        <ChevronLeft color="white" size={60} strokeWidth={1} />
      </button>

      {/* Right button */}
      <button
        aria-label="Scroll right"
        onClick={() => doScroll('right')}
        disabled={!canRight}
        className={`cursor-pointer absolute z-10 top-1/2 -translate-y-1/2 right-0 py-2 flex items-center justify-center transition-opacity duration-200 ${
          canRight ? 'opacity-100' : 'opacity-70 pointer-events-none'
        }`}
      >
        <ChevronRight color="white" size={60} strokeWidth={1} />
      </button>

      <div
        ref={sliderRef}
        className="w-full overflow-x-auto scroll-smooth hide-scrollbar snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex items-stretch">
          {products.map(
            (
              { id, imageSrc, altText, title, description, linkTitle },
              index,
            ) => (
              <HomeProduct
                key={id ? id : index}
                width={cardWidth}
                height={cardHeight}
                imageSrc={imageSrc}
                altText={altText}
                title={title}
                description={description}
                linkTitle={linkTitle}
                link={id ? `/products/${id}` : '/products'}
                className="snap-start"
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
