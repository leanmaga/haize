'use client';
import { Suspense, useState } from 'react';
import { ArrowDownWideNarrow } from 'lucide-react';
import FilterSidebar from './FilterSidebar';

// Componente interno que usa useSearchParams
function CategoryFilterContent() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div>
      <button
        role="button"
        onClick={() => setIsFilterOpen(true)}
        className="flex items-center gap-2 px-4 cursor-pointer text-gray-500"
      >
        <ArrowDownWideNarrow size={20} />
        <span className="text-lg">Filtros</span>
      </button>

      {/* Main Content */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
}

// Componente principal con Suspense
const CategoryFilter = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center mb-8 gap-3 opacity-50">
          Cargando categorías...
        </div>
      }
    >
      <CategoryFilterContent />
    </Suspense>
  );
};

export default CategoryFilter;
