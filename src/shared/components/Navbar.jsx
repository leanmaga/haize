'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import AuthModal from '@/modules/auth/modal/AuthModal';
import CategoriesDropdown from './CategoriesDropdown';
import Image from 'next/image';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { data: session } = useSession();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  // Zustand para el carrito
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const cartItemsCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login');

  // Verificar si el usuario es administrador
  const isAdmin =
    session?.user?.role === 'admin' || session?.user?.isAdmin === true;

  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    clearCart();
    signOut({ callbackUrl: '/' });
  };

  const isActive = (path) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const openLoginModal = () => {
    setAuthModalView('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalView('register');
    setIsAuthModalOpen(true);
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full transition-colors duration-300 ${
          scrollPosition > 0 ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
        }`}
        style={{ zIndex: 50 }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between py-3">
          {/* Categorías - Desktop Left */}
          <div className="hidden md:block text-white font-mono">
            <CategoriesDropdown />
          </div>

          {/* Logo Central - HAIZE */}
          <h1
            className={`text-4xl font-bold transition-transform duration-300 text-white font-serif ${
              scrollPosition > 0 ? 'scale-100' : 'md:scale-150 md:translate-y-8'
            }`}
          >
            <Link href="/">HAIZE</Link>
          </h1>

          {/* Navegación derecha - Desktop */}
          <div className="hidden md:flex items-center">
            <ul className="flex gap-6 items-center font-mono text-white text-sm">
              <li>
                <Link
                  href="/search"
                  className="hover:text-gray-300 transition flex items-center gap-1"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  BUSCAR
                </Link>
              </li>

              {!session ? (
                <>
                  <li>
                    <button
                      onClick={openLoginModal}
                      className="hover:text-gray-300 transition"
                    >
                      INICIAR SESIÓN
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openRegisterModal}
                      className="hover:text-gray-300 transition"
                    >
                      REGISTRARSE
                    </button>
                  </li>
                </>
              ) : (
                <>
                  {/* Mostrar admin solo si es administrador */}
                  {isAdmin && (
                    <li>
                      <Link
                        href="/admin"
                        className="hover:text-gray-300 transition"
                      >
                        ADMIN
                      </Link>
                    </li>
                  )}

                  {/* Carrito antes del perfil */}
                  <li>
                    <Link
                      href="/cart"
                      className="relative hover:text-gray-300 transition"
                    >
                      CARRITO
                      {cartItemsCount > 0 && (
                        <span className="absolute -top-2 -right-3 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {cartItemsCount}
                        </span>
                      )}
                    </Link>
                  </li>

                  {/* Perfil del usuario */}
                  <li>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() =>
                          setIsProfileDropdownOpen(!isProfileDropdownOpen)
                        }
                        className="flex items-center space-x-1 focus:outline-none"
                        aria-label="Menu de usuario"
                      >
                        {session?.user?.image &&
                        session.user.image.includes('googleusercontent.com') ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/50 hover:border-white transition-colors">
                            <Image
                              src={session.user.image}
                              alt={session.user.name || 'Usuario'}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full flex items-center justify-center border-2 border-white/50 hover:border-white transition-colors bg-white/10">
                            <UserIcon className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <ChevronDownIcon className="h-4 w-4 text-white" />
                      </button>

                      {/* Dropdown de perfil */}
                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-60 bg-black text-white border border-white/20 rounded-lg shadow-lg overflow-hidden">
                          <div className="p-3 border-b border-white/10 bg-white/5">
                            <p className="font-medium">{session.user.name}</p>
                            <p className="text-xs text-gray-400 truncate mt-1">
                              {session.user.email}
                            </p>
                          </div>
                          <div className="py-1">
                            <Link
                              href="/profile"
                              className="block px-4 py-2.5 text-sm hover:bg-white/10 transition"
                            >
                              Mi Perfil
                            </Link>
                            <Link
                              href="/profile/orders"
                              className="block px-4 py-2.5 text-sm hover:bg-white/10 transition"
                            >
                              Mis Pedidos
                            </Link>
                            <Link
                              href="/profile/settings"
                              className="block px-4 py-2.5 text-sm hover:bg-white/10 transition"
                            >
                              Configuración
                            </Link>
                          </div>
                          <div className="border-t border-white/10 bg-white/5">
                            <button
                              onClick={handleSignOut}
                              className="block w-full text-left px-4 py-2.5 text-sm hover:bg-white/10"
                            >
                              Cerrar Sesión
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                </>
              )}

              {/* Carrito para usuarios no autenticados */}
              {!session && (
                <li>
                  <Link
                    href="/cart"
                    className="relative hover:text-gray-300 transition"
                  >
                    CARRITO
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-2 -right-3 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link href="/cart" className="relative text-white">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <button
              className="text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menú"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-black z-50 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col text-white">
          {/* Header */}
          <div className="border-b border-white/20 py-4 px-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold font-serif">HAIZE</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2"
              aria-label="Cerrar menú"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {/* User Profile - Si está autenticado */}
            {session && (
              <div className="mb-6">
                <div className="flex items-center p-4 bg-white/5 rounded-lg border border-white/10">
                  {session?.user?.image &&
                  session.user.image.includes('googleusercontent.com') ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/50">
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'Usuario'}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full flex items-center justify-center border-2 border-white/50 bg-white/10">
                      <UserIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="space-y-6 font-mono">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                  Navegación
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/"
                    className={`flex items-center px-3 py-3 rounded-lg transition ${
                      isActive('/') ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-sm font-medium">INICIO</span>
                  </Link>
                  <Link
                    href="/shop"
                    className={`flex items-center px-3 py-3 rounded-lg transition ${
                      isActive('/shop') ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-sm font-medium">CATEGORIAS</span>
                  </Link>
                  <Link
                    href="/search"
                    className={`flex items-center px-3 py-3 rounded-lg transition ${
                      isActive('/search') ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">BUSCAR</span>
                  </Link>
                  <Link
                    href="/cart"
                    className={`flex items-center px-3 py-3 rounded-lg transition ${
                      isActive('/cart') ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">CARRITO</span>
                    {cartItemsCount > 0 && (
                      <span className="ml-auto bg-white text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* Account Section */}
              {session && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                    Mi Cuenta
                  </h3>
                  <div className="space-y-2">
                    {/* Mostrar admin solo si es administrador */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className={`flex items-center px-3 py-3 rounded-lg transition ${
                          isActive('/admin')
                            ? 'bg-white/20'
                            : 'hover:bg-white/10'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-sm font-medium">ADMIN</span>
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className={`flex items-center px-3 py-3 rounded-lg transition ${
                        isActive('/profile')
                          ? 'bg-white/20'
                          : 'hover:bg-white/10'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-sm font-medium">MI PERFIL</span>
                    </Link>
                    <Link
                      href="/profile/orders"
                      className={`flex items-center px-3 py-3 rounded-lg transition ${
                        isActive('/profile/orders')
                          ? 'bg-white/20'
                          : 'hover:bg-white/10'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-sm font-medium">MIS PEDIDOS</span>
                    </Link>
                    <Link
                      href="/profile/settings"
                      className={`flex items-center px-3 py-3 rounded-lg transition ${
                        isActive('/profile/settings')
                          ? 'bg-white/20'
                          : 'hover:bg-white/10'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-sm font-medium">CONFIGURACIÓN</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/20 p-4">
            {session ? (
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 rounded-lg border border-white/30 text-sm font-medium hover:bg-white/10 transition"
              >
                CERRAR SESIÓN
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={openLoginModal}
                  className="w-full py-2.5 px-4 rounded-lg border border-white/30 text-sm font-medium hover:bg-white/10 transition"
                >
                  INICIAR SESIÓN
                </button>
                <button
                  onClick={openRegisterModal}
                  className="w-full py-2.5 px-4 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition"
                >
                  REGISTRARSE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authModalView}
      />
    </>
  );
};

export default Navbar;
