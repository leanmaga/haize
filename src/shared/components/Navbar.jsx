'use client';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`px-18 py-3 fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        scrollPosition > 0 ? 'bg-black/60' : 'bg-transparent'
      } top-0 z-50`}
    >
      <div className="flex justify-between items-center px-4 py-3 text-white">
        <div>CATEGORIAS</div>

        <h1
          className={`text-4xl font-bold transition-transform duration-300  translate-x-30 ${
            scrollPosition > 0
              ? 'scale-100 translate-0'
              : 'scale-250 translate-y-50'
          } font-serif`}
        >
          <a href="/">HAIZE</a>
        </h1>

        <ul className="flex gap-10 font-mono">
          <li>
            <a href="#">BUSCAR</a>
          </li>
          <li>
            <a href="#">INICIAR SESIÓN</a>
          </li>
          <li>
            <a href="#">CARRITO</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
