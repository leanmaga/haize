'use client';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';
import { ButtonContact } from '../ui';

export default function FilterableProducts({ products }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filtrar primero por categoría
  const byCategory =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Luego filtrar por texto
  const filteredProducts = byCategory.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="container mx-auto px-4 py-8 mt-[80px]">
        {/* Pills de categorías */}
        <div className="mb-6">
          <CategoryFilter
            selected={selectedCategory}
            onChange={(cat) => setSelectedCategory(cat)}
          />
        </div>

        {/* Search centrado y con ancho limitado */}
        <div className="flex justify-center mb-8">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Grid de productos */}
        <ProductGrid products={filteredProducts} />
      </div>
      <section
        className="py-16 text-white"
        style={{ backgroundColor: '#F6C343' }}
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
