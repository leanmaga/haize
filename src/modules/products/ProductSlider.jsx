'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductSlider({ items = null }) {
  const sliderRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    const update = () => {
      setCanLeft(el.scrollLeft > 0);
      // small epsilon to avoid rounding issues
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

  const products = items && items.length ? items : sample;

  return (
    <div className="p-5 relative bg-zinc-200">
      {/* Left button */}
      <button
        aria-label="Scroll left"
        onClick={() => doScroll('left')}
        disabled={!canLeft}
        className={`absolute z-10 top-1/2 -translate-y-1/2 left-2 p-2 rounded-full bg-white shadow-md flex items-center justify-center transition-opacity duration-200 ${
          canLeft ? 'opacity-100' : 'opacity-40 pointer-events-none'
        }`}
      >
        <ChevronLeft color="black" size={20} />
      </button>

      {/* Right button */}
      <button
        aria-label="Scroll right"
        onClick={() => doScroll('right')}
        disabled={!canRight}
        className={`absolute z-10 top-1/2 -translate-y-1/2 right-2 p-2 rounded-full bg-white shadow-md flex items-center justify-center transition-opacity duration-200 ${
          canRight ? 'opacity-100' : 'opacity-40 pointer-events-none'
        }`}
      >
        <ChevronRight color="black" size={20} />
      </button>

      <div
        ref={sliderRef}
        className="w-full overflow-x-auto scroll-smooth hide-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="pb-2 flex gap-5 items-stretch">
          {products.map((p, i) => (
            <div key={i} className="flex-shrink-0 w-[260px]">
              <ProductCard
                imgSrc={p.imgSrc}
                imgAlt={p.imgAlt}
                title={p.title}
                price={p.price}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
