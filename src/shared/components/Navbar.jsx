// src/shared/components/Navbar.jsx
'use client';

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useSelector } from 'react-redux';
import { selectCartItemCount } from '@/redux/selectors/cartSelectors';
import CustomAuthModal from '@/components/auth/CustomAuthModal';

export default function Navbar() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState('signin');
  const cartItemCount = useSelector(selectCartItemCount);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openSignIn = () => {
    setAuthView('signin');
    setShowAuthModal(true);
  };

  const openSignUp = () => {
    setAuthView('signup');
    setShowAuthModal(true);
  };

  return (
    <>
      <nav
        className={`px-18 py-3 fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
          scrollPosition > 0 ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
        }`}
      >
        <div className="flex justify-between items-center px-4 py-3 text-white">
          <div>
            <a href="/shop" className="hover:text-gray-300 cursor-pointer">
              CATEGORIAS
            </a>
          </div>

          <h1
            className={`text-4xl font-bold transition-transform duration-300 translate-x-30 ${
              scrollPosition > 0
                ? 'scale-100 translate-0'
                : 'scale-250 translate-y-50'
            } font-serif`}
          >
            <a href="/">HAIZE</a>
          </h1>

          <ul className="flex gap-10 font-mono items-center">
            <li>
              <a href="/search" className="hover:text-gray-300 cursor-pointer">
                BUSCAR
              </a>
            </li>

            <SignedOut>
              <li>
                <button
                  onClick={openSignIn}
                  className="hover:text-gray-300 cursor-pointer"
                >
                  INICIAR SESIÓN
                </button>
              </li>
            </SignedOut>

            <SignedIn>
              <li>
                <a
                  href="/dashboard"
                  className="hover:text-gray-300 cursor-pointer"
                >
                  MI CUENTA
                </a>
              </li>
              <li>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox:
                        'w-9 h-9 border-2 border-white/50 hover:border-white transition-colors',
                      userButtonPopoverCard:
                        'bg-black text-white border border-white/20',
                      userButtonPopoverActionButton: 'hover:bg-white/10',
                    },
                  }}
                />
              </li>
            </SignedIn>

            <li>
              <a
                href="/cart"
                className="relative hover:text-gray-300 cursor-pointer"
              >
                CARRITO
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <CustomAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView={authView}
      />
    </>
  );
}
