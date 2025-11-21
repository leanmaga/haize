'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import CustomLink from './CustomLink';
import Image from 'next/image';

const CategoriesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

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
      setActiveSection(null);
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
      setActiveSection(null);
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
        className="relative z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={dropdownRef}
      >
        {/* Botón trigger */}
        <button className="text-sm font-medium tracking-wide hover:text-gray-300 transition uppercase">
          CATEGORIAS
        </button>
      </div>

      {/* Dropdown menu - Usando Portal */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
            {/* Overlay semi-transparente */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px]"
              style={{
                top: '0',
                zIndex: 49,
              }}
            />

            {/* Dropdown menu */}
            <div
              className="fixed left-0 right-0 bg-white shadow-2xl"
              style={{
                top: '0',
                paddingTop: '64px',
                zIndex: 49,
                maxWidth: '50vw',
              }}
            >
              <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="flex gap-12">
                  {/* Columna izquierda - Lista de secciones */}
                  <div className="w-64 space-y-4">
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
                      <div className="grid grid-cols-3 gap-x-8 gap-y-3">
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
          </div>,
          document.body
        )}
    </>
  );
};

export default CategoriesDropdown;
