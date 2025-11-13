'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

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
        { name: 'Polos', value: 'polos' },
        { name: 'Sweaters', value: 'sweaters' },
        { name: 'Buzos', value: 'buzos' },
        { name: 'Camperas', value: 'camperas' },
        { name: 'Chalecos', value: 'chalecos' },
        { name: 'Sacos', value: 'sacos' },
        { name: 'Trajes', value: 'trajes' },
        { name: 'Pantalones', value: 'pantalones' },
        { name: 'Jeans', value: 'jeans' },
        { name: 'Bermudas', value: 'bermudas' },
        { name: 'Shorts', value: 'shorts' },
        { name: 'Ropa Interior', value: 'ropa-interior' },
        { name: 'Medias', value: 'medias' },
        { name: 'Boxers', value: 'boxers' },
        { name: 'Slips', value: 'slips' },
      ],
    },
    calzado: {
      title: 'CALZADO',
      items: [
        { name: 'Zapatillas', value: 'zapatillas' },
        { name: 'Zapatos', value: 'zapatos' },
        { name: 'Botas', value: 'botas' },
        { name: 'Sandalias', value: 'sandalias' },
        { name: 'Ojotas', value: 'ojotas' },
      ],
    },
    accesorios: {
      title: 'ACCESORIOS',
      items: [
        { name: 'Cinturones', value: 'cinturones' },
        { name: 'Carteras', value: 'carteras' },
        { name: 'Mochilas', value: 'mochilas' },
        { name: 'Gorras', value: 'gorras' },
        { name: 'Sombreros', value: 'sombreros' },
        { name: 'Bufandas', value: 'bufandas' },
        { name: 'Guantes', value: 'guantes' },
        { name: 'Billeteras', value: 'billeteras' },
        { name: 'Lentes', value: 'lentes' },
        { name: 'Relojes', value: 'relojes' },
      ],
    },
    complementos: {
      title: 'COMPLEMENTOS',
      items: [
        { name: 'Deportivo', value: 'deportivo' },
        { name: 'Formal', value: 'formal' },
        { name: 'Casual', value: 'casual' },
        { name: 'Urbano', value: 'urbano' },
        { name: 'Elegante Sport', value: 'elegante-sport' },
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
                        <button
                          onMouseEnter={() => setActiveSection(key)}
                          className={`text-left w-full py-2 px-3 text-sm font-medium tracking-wider transition uppercase rounded ${
                            activeSection === key
                              ? 'text-black bg-gray-100'
                              : 'text-gray-700 hover:text-black hover:bg-gray-50'
                          }`}
                        >
                          {section.title}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Columna central - Contenido de la sección activa */}
                  <div className="flex-1">
                    {activeSection && (
                      <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                        {categories[activeSection].items.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleCategoryClick(item.value)}
                            className={`text-left py-2 px-3 text-sm transition hover:bg-gray-50 rounded ${
                              item.isSpecial
                                ? 'font-medium text-gray-900'
                                : 'text-gray-700 hover:text-black'
                            }`}
                          >
                            {item.name}
                          </button>
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
                      <div className="bg-gray-100 rounded-lg overflow-hidden h-full min-h-[300px] flex items-center justify-center">
                        <img
                          src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&h=500&fit=crop"
                          alt="Category preview"
                          className="w-full h-full object-cover"
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
