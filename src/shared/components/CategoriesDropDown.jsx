'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomLink from './CustomLink';
import Image from 'next/image';

const CategoriesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('novedades');
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);
  const router = useRouter();

  const categories = {
    novedades: {
      title: 'NOVEDADES',
      items: [
        { name: 'Nuevos Ingresos', value: 'nuevos-ingresos', isSpecial: true },
        { name: 'Verano 2025', value: 'verano-2025', isSpecial: true },
        { name: 'Tiempo de Lino', value: 'tiempo-lino', isSpecial: true },
      ],
    },
    indumentaria: {
      title: 'INDUMENTARIA',
      items: [
        { name: 'Camisas', value: 'camisas' },
        { name: 'Remeras', value: 'remeras' },
        { name: 'Shorts', value: 'shorts' },
        { name: 'Musculosas', value: 'musculosas' },
        { name: 'Conjuntos', value: 'conjuntos' },
        { name: 'Todos', value: 'all' },
      ],
    },
    regalos: {
      title: 'REGALOS',
      items: [
        { name: 'Sets de Regalo', value: 'sets-regalo', isSpecial: true },
        {
          name: 'Tarjetas de Regalo',
          value: 'tarjetas-regalo',
          isSpecial: true,
        },
      ],
    },
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveSection('novedades');
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveSection('novedades');
    }, 300);
  };

  const handleCategoryClick = (categoryValue) => {
    setIsOpen(false);
    setActiveSection(null);
    router.push(`/products?category=${categoryValue}`);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        className="relative z-80 group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={dropdownRef}
      >
        {/* Botón trigger */}
        <button
          className={`text-sm font-medium relative tracking-wide hover:text-black transition uppercase cursor-pointer ${
            isOpen ? 'text-black' : ''
          }`}
        >
          CATEGORIAS
        </button>
        <span
          className={`absolute z-80 left-0 -bottom-0.25 h-0.25 w-0 bg-black transition-all duration-300 group-hover:w-full`}
          aria-hidden="true"
        />
      </div>

      {/* Dropdown menu - Usando Portal */}
      <div
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
      >
        {/* Overlay semi-transparente */}
        <div
          className={`absolute w-[100vw] h-[100dvh] top-0 inset-0 bg-black/20 ${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          } transform transition-all duration-100 ease-in-out`}
          style={{
            top: 0,
            zIndex: 50,
          }}
          onMouseEnter={() => {
            if (isOpen) {
              handleDropdownMouseLeave();
            }
          }}
        />

        {/* Dropdown menu */}
        <div
          className={`max-w-[75vw] h-[100dvh] bg-white fixed left-0 right-0 shadow-2xl top-0 pt-35 z-50 text-black ${
            isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          } transform transition-all duration-500 ease-in-out`}
        >
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex justify-evenly gap-12">
              {/* Columna izquierda - Lista de secciones */}
              <div className="w-64 text-2xl space-y-4">
                {Object.entries(categories).map(([key, section]) => (
                  <div key={key}>
                    <CustomLink
                      barColor="bg-black"
                      onMouseEnter={() => setActiveSection(key)}
                    >
                      {section.title}
                    </CustomLink>
                  </div>
                ))}
              </div>

              {/* Columna central - Contenido de la sección activa */}
              <div className="flex-1">
                {activeSection && (
                  //<div className="grid grid-cols-3 gap-x-8 gap-y-3">
                  <div className="text-lg pl-5 inline-grid grid-cols-1 justify-items-start gap-y-3">
                    {categories[activeSection].items.map((item, index) => (
                      <CustomLink
                        key={index}
                        barColor="bg-black"
                        onClick={() => handleCategoryClick(item.value)}
                      >
                        {item.name}
                      </CustomLink>
                    ))}
                  </div>
                )}

                {!activeSection && (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Pasa el mouse sobre una categoría para ver las opciones
                  </div>
                )}
              </div>

              {/* Columna derecha - Imagen (opcional) */}
              <div className="w-80 hidden xl:block">
                {activeSection && (
                  <div className="bg-gray-100 rounded-lg overflow-hidden h-full min-h-[300px] relative">
                    <Image
                      src="/assets/20251117_183927.jpg"
                      alt="Category preview"
                      className="object-cover"
                      fill
                      sizes="64px"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoriesDropdown;
