'use client';

import { useEffect, useState } from 'react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useSelector } from 'react-redux';
import { selectCartItemCount } from '@/redux/selectors/cartSelectors';

export default function Navbar() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const cartItemCount = useSelector(selectCartItemCount);

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
        scrollPosition > 0 ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="flex justify-between items-center px-4 py-3 text-white">
        <div>
          <a href="/shop">CATEGORIAS</a>
        </div>

        <h1
          className={`text-4xl font-bold transition-transform duration-300 ${
            scrollPosition > 0 ? 'scale-100' : 'scale-150 translate-y-8'
          } font-serif`}
        >
          <a href="/home">HAIZE</a>
        </h1>

        <ul className="flex gap-6 items-center font-mono">
          <li>
            <a href="/search">BUSCAR</a>
          </li>

          <SignedOut>
            <li>
              <SignInButton mode="modal">
                <button className="hover:text-gray-300">INICIAR SESIÓN</button>
              </SignInButton>
            </li>
          </SignedOut>

          <SignedIn>
            <li>
              <a href="/dashboard" className="hover:text-gray-300">
                DASHBOARD
              </a>
            </li>
            <li>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                  },
                }}
              />
            </li>
          </SignedIn>

          <li>
            <a href="/cart" className="relative hover:text-gray-300">
              CARRITO
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
