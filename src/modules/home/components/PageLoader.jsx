'use client';

import { useState, useEffect } from 'react';
import './PageLoader.css';

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Precargar imágenes críticas - Above the fold content
    const criticalImages = [
      // Hero images (las más importantes)
      'https://res.cloudinary.com/dz7fsiwnu/image/upload/portada',
      'https://res.cloudinary.com/dz7fsiwnu/image/upload/portadaMobil',

      // Grid de productos (primeras 2 imágenes visibles)
      '/assets/clothes.jpg',
      '/assets/clothes2.jpg',
    ];

    let loadedCount = 0;
    const totalImages = criticalImages.length;

    const updateProgress = () => {
      loadedCount++;
      const currentProgress = Math.round((loadedCount / totalImages) * 100);
      setProgress(currentProgress);

      if (loadedCount === totalImages) {
        // Todas las imágenes cargadas
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            setIsLoading(false);
            // Restaurar scroll
            document.body.style.overflow = 'unset';
          }, 600);
        }, 300);
      }
    };

    // Bloquear scroll mientras carga
    document.body.style.overflow = 'hidden';

    // Precargar cada imagen
    criticalImages.forEach((src) => {
      const img = new Image();
      img.onload = updateProgress;
      img.onerror = () => {
        console.warn(`Error cargando: ${src}`);
        updateProgress(); // Continuar aunque falle
      };
      img.src = src;
    });

    // Timeout de seguridad (5 segundos)
    const timeout = setTimeout(() => {
      console.warn('Timeout: Mostrando página sin completar precarga');
      setFadeOut(true);
      setTimeout(() => {
        setIsLoading(false);
        document.body.style.overflow = 'unset';
      }, 600);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-[600ms] ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Círculo con logo */}
      <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px] rounded-full border-2 border-gray-600 flex items-center justify-center mb-8">
        {/* Logo HAIZE */}
        <div className="font-nexa-bold text-6xl md:text-7xl tracking-widest flex gap-1">
          {'HAIZE'.split('').map((letter, index) => (
            <span
              key={index}
              className="text-white animate-letter-pulse"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Círculo de progreso animado */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="0.5"
          />
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            strokeDasharray={`${2 * Math.PI * 48}`}
            strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
            className="transition-all duration-300 ease-out"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
