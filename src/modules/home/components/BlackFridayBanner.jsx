'use client';

import React from 'react';
import './BlackFridayBanner.css';

export default function BlackFridayBanner() {
  // Texto que se va a repetir
  const bannerText = 'BLACK FRIDAY 60% OFF';

  // Crear un string largo duplicando el texto muchas veces para scroll infinito
  const repeatedText = Array(15).fill(bannerText).join(' • ');

  return (
    <div className="relative bg-black overflow-hidden py-6 md:py-8">
      {/* Contenedor con animación */}
      <div className="flex animate-scroll-infinite">
        {/* Primera copia del texto */}
        <div className="flex-shrink-0 whitespace-nowrap pr-8">
          <span className="font-nexa-bold text-white text-4xl md:text-6xl lg:text-7xl xl:text-8xl uppercase tracking-wider">
            {repeatedText}
          </span>
        </div>
        {/* Segunda copia del texto para loop infinito */}
        <div className="flex-shrink-0 whitespace-nowrap pr-8">
          <span className="font-nexa-bold text-white text-4xl md:text-6xl lg:text-7xl xl:text-8xl uppercase tracking-wider">
            {repeatedText}
          </span>
        </div>
      </div>
    </div>
  );
}
