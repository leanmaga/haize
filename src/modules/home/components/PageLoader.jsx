'use client';

import { useState, useEffect } from 'react';
import './PageLoader.css';

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Precargar imágenes críticas
    const criticalImages = [
      'https://res.cloudinary.com/dz7fsiwnu/image/upload/portada',
      'https://res.cloudinary.com/dz7fsiwnu/image/upload/portadaMobil',
    ];

    let loadedCount = 0;
    const totalImages = criticalImages.length;

    const checkAllImagesLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            setIsLoading(false);
          }, 600);
        }, 300);
      }
    };

    criticalImages.forEach((src) => {
      const img = new Image();
      img.onload = checkAllImagesLoaded;
      img.onerror = checkAllImagesLoaded;
      img.src = src;
    });

    // Timeout de seguridad
    const timeout = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    }, 8000);

    return () => clearTimeout(timeout);
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-600 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Círculo */}
      <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px] rounded-full border-2 border-gray-600 flex items-center justify-center">
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
      </div>
    </div>
  );
}
