'use client';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';
import { ButtonContact } from '../ui';
import { useProductFilters } from '@/hooks/useProductFilters';

export default function FilterableProducts({ products }) {
  const { filters, setFilters, filteredProducts, hasActiveFilters } =
    useProductFilters(products);

  const handleSearchChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      searchTerm: value,
    }));
  };

  const handleFiltersApply = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      priceRange: { min: 0, max: 100000 },
      sizes: [],
      colors: [],
      searchTerm: '',
    });
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 mt-[80px]">
        {/* Header con filtros y búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-4 mb-6">
          {/* Botón de filtros */}
          <div>
            <CategoryFilter
              products={products}
              onFiltersApply={handleFiltersApply}
              currentFilters={filters}
            />
          </div>

          {/* Búsqueda */}
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-black pl-10"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Mostrar filtros activos */}
        {hasActiveFilters && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Filtros activos:</span>

            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white rounded-full text-sm">
                {filters.category}
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, category: 'all' }))
                  }
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            )}

            {filters.sizes.map((size) => (
              <span
                key={size}
                className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white rounded-full text-sm"
              >
                Talle: {size}
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      sizes: prev.sizes.filter((s) => s !== size),
                    }))
                  }
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            ))}

            {filters.colors.map((color) => (
              <span
                key={color}
                className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white rounded-full text-sm"
              >
                Color: {color}
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      colors: prev.colors.filter((c) => c !== color),
                    }))
                  }
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            ))}

            {(filters.priceRange.min > 0 ||
              filters.priceRange.max < 100000) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white rounded-full text-sm">
                ${filters.priceRange.min.toLocaleString()} - $
                {filters.priceRange.max.toLocaleString()}
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: { min: 0, max: 100000 },
                    }))
                  }
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 hover:text-black underline"
            >
              Limpiar todos
            </button>
          </div>
        )}

        {/* Contador de resultados */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredProducts.length}{' '}
            {filteredProducts.length === 1 ? 'producto' : 'productos'}
            {hasActiveFilters && ' encontrados'}
          </p>
        </div>

        {/* Grid de productos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-2">
              No se encontraron productos con los filtros seleccionados
            </p>
            <button
              onClick={clearAllFilters}
              className="text-black underline hover:no-underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </div>

      <section
        className="py-16 text-white"
        style={{ backgroundColor: '#010101' }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Tenés preguntas sobre nuestros productos?
          </h2>
          <p className="text-xl mb-8">
            Contactanos por WhatsApp y te respondemos de inmediato. Atención
            cordial garantizada.
          </p>
          <ButtonContact />
        </div>
      </section>
    </>
  );
}
