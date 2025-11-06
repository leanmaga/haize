// ButtonProducts.jsx
import React from "react";
import Link from "next/link";

const ButtonProducts = () => {
  return (
    <div>
      <Link
        href="/products"
        className="cursor-pointer btn-drop-yellow bg-black border-2 border-black text-white px-8 py-4 font-medium uppercase tracking-wider hover:text-black transition-all duration-300"
      >
        <span className="flex items-center">Ver todos los productos</span>
      </Link>
    </div>
  );
};

export default ButtonProducts;
