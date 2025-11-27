'use client';
import { Suspense, useState } from 'react';
import { ArrowDownWideNarrow } from 'lucide-react';
import FilterSidebar from './FilterSidebar';

function CategoryFilterContent({ products, onFiltersApply, currentFilters }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters =
    currentFilters.category !== 'all' ||
    currentFilters.sizes.length > 0 ||
    currentFilters.colors.length > 0 ||
    currentFilters.priceRange.min > 0 ||
    currentFilters.priceRange.max < 100000;

  return (
    <div>
      <button
        role="button"
        onClick={() => setIsFilterOpen(true)}
        className="flex items-center gap-2 px-4 cursor-pointer text-gray-500 relative"
      >
        <ArrowDownWideNarrow size={20} />
        <span className="text-lg">Filtros</span>
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-black rounded-full" />
        )}
      </button>

      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        products={products}
        onFiltersApply={onFiltersApply}
        currentFilters={currentFilters}
      />
    </div>
  );
}

const CategoryFilter = ({ products, onFiltersApply, currentFilters }) => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center opacity-50">
          <div className="px-4 py-2 border border-gray-300 rounded">
            Cargando...
          </div>
        </div>
      }
    >
      <CategoryFilterContent
        products={products}
        onFiltersApply={onFiltersApply}
        currentFilters={currentFilters}
      />
    </Suspense>
  );
};

export default CategoryFilter;
