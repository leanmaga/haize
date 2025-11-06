"use client";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Componente interno que usa useSearchParams
function CategoryFilterContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "all";

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);

    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // Función para obtener los estilos del botón
  const getButtonStyles = (category) => {
    const isActive = currentCategory === category;

    if (isActive) {
      return {
        className:
          "px-5 py-2 rounded-full border transition-colors text-sm text-black font-medium",
        style: {
          borderColor: "#F6C343",
          backgroundColor: "#F6C343",
        },
      };
    } else {
      return {
        className:
          "px-5 py-2 rounded-full border border-gray-300 transition-colors text-sm text-black hover:border-opacity-80",
        style: {
          "&:hover": { borderColor: "#F6C343" },
        },
        onMouseEnter: (e) => {
          e.target.style.borderColor = "#F6C343";
        },
        onMouseLeave: (e) => {
          e.target.style.borderColor = "#d1d5db";
        },
      };
    }
  };

  const categories = [
    { key: "all", label: "Todos" },

    // Categorías de pollería
    { key: "pollos-enteros", label: "Pollos Enteros" },
    { key: "cortes-pollo", label: "Cortes de Pollo" },
    { key: "huevos", label: "Huevos" },
    { key: "marinados-pollo", label: "Marinados de Pollo" },
    { key: "embutidos-pollo", label: "Embutidos de Pollo" },
    { key: "menudencias-pollo", label: "Menudencias de Pollo" },

    // Categorías de carnicería
    { key: "cortes-vacunos", label: "Cortes Vacunos" },
    { key: "cortes-cerdo", label: "Cortes de Cerdo" },
    { key: "cortes-cordero", label: "Cortes de Cordero" },
    { key: "milanesas", label: "Milanesas" },
    { key: "carne-picada", label: "Carne Picada" },
    { key: "embutidos-vacunos", label: "Embutidos Vacunos" },
    { key: "vísceras", label: "Vísceras" },

    // Categorías generales
    { key: "productos-organicos", label: "Orgánicos" },
    { key: "preparados", label: "Preparados" },
    { key: "promociones", label: "Promociones" },
    { key: "otros", label: "Otros" },
  ];

  return (
    <div className="flex flex-wrap justify-center mb-8 gap-3">
      {categories.map(({ key, label }) => {
        const buttonStyles = getButtonStyles(key);
        return (
          <button
            key={key}
            className={buttonStyles.className}
            style={buttonStyles.style}
            onMouseEnter={buttonStyles.onMouseEnter}
            onMouseLeave={buttonStyles.onMouseLeave}
            onClick={() => handleCategoryChange(key)}
          >
            {label}
          </button>
        );
      })}
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
