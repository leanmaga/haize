'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-focus en el input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Búsqueda con debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300); // 300ms de debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const searchProducts = async (query) => {
    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(query)}&limit=6`
      );
      const data = await response.json();
      setProducts(data.products || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      setProducts([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    setProducts([]);
    setHasSearched(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de búsqueda */}
      {!isOpen ? (
        <button
          onClick={handleOpen}
          className="flex items-center gap-1 hover:text-gray-300 transition text-sm"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          BUSCAR
        </button>
      ) : (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4">
            {/* Input de búsqueda */}
            <div className="bg-white rounded-lg shadow-2xl">
              <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none text-gray-900 placeholder-gray-400"
                />
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Dropdown con resultados */}
              {(isLoading || hasSearched) && (
                <div className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-black"></div>
                      <p className="mt-2 text-sm text-gray-500">Buscando...</p>
                    </div>
                  ) : products.length > 0 ? (
                    <div className="p-3">
                      <div className="grid grid-cols-1 gap-2">
                        {products.map((product) => (
                          <Link
                            key={product._id}
                            href={`/products/${product._id}`}
                            onClick={handleClose}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition group"
                          >
                            {/* Imagen del producto */}
                            <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              <Image
                                src={product.imageUrl}
                                alt={product.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                sizes="64px"
                              />
                            </div>

                            {/* Información del producto */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate group-hover:text-black">
                                {product.title}
                              </h3>
                              <p className="text-sm text-gray-500 capitalize">
                                {product.category}
                              </p>
                            </div>

                            {/* Precio */}
                            <div className="text-right">
                              {product.onSale && product.promoPrice > 0 ? (
                                <>
                                  <p className="text-sm text-gray-400 line-through">
                                    {formatPrice(product.salePrice)}
                                  </p>
                                  <p className="font-bold text-red-600">
                                    {formatPrice(product.promoPrice)}
                                  </p>
                                </>
                              ) : (
                                <p className="font-bold text-gray-900">
                                  {formatPrice(product.salePrice)}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Ver más resultados */}
                      <Link
                        href={`/products?search=${encodeURIComponent(
                          searchTerm
                        )}`}
                        onClick={handleClose}
                        className="block mt-3 p-3 text-center text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition"
                      >
                        VER MÁS RESULTADOS →
                      </Link>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600">
                        No se encontraron productos
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Intenta con otros términos de búsqueda
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
