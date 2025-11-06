// src/components/sections/CategoriesSection.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import imagenPollo from "/public/images/9.jpg";

export default function CategoriesSection() {
  const categories = [
    {
      id: 1,
      title: "MILANESAS PREMIUM",
      subtitle: "ELABORACIÓN DIARIA",
      description:
        "Suprema, nalga y cerdo. Preparadas todos los días con carne premium",
      price: "4.999",
      originalPrice: "6.500",
      image: { src: imagenPollo, width: 300, height: 200 },
      accent: "from-amber-400 to-yellow-500",
      href: "/productos/milanesas",
    },
    {
      id: 2,
      title: "POLLO SIN AGUA",
      subtitle: "NO SE ACHICA",
      description: "Pollos frescos que mantienen su tamaño al cocinar",
      price: "2.899",
      originalPrice: "3.400",
      image: { src: imagenPollo, width: 300, height: 200 },
      accent: "from-emerald-400 to-green-500",
      href: "/productos/pollo",
    },
    {
      id: 3,
      title: "CARNE VACUNA",
      subtitle: "FRESCA PREMIUM",
      description: "Cortes frescos seleccionados, listos para tu freezer",
      price: "3.499",
      originalPrice: "4.200",
      image: { src: imagenPollo, width: 300, height: 200 },
      accent: "from-rose-400 to-pink-500",
      href: "/productos/carnes",
    },
  ];

  return (
    <>
      <style jsx>{`
        .premium-card {
          background: linear-gradient(145deg, #ffffff 0%, #fafafa 100%);
          border: 1px solid rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .premium-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transition: left 0.6s;
        }

        .premium-card:hover::before {
          left: 100%;
        }

        .premium-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.15);
          border-color: rgba(0, 0, 0, 0.1);
        }

        .image-container {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .image-container::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent);
        }

        .accent-line {
          height: 4px;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .premium-card:hover .accent-line {
          height: 6px;
          box-shadow: 0 0 20px rgba(246, 195, 67, 0.4);
        }

        .price-container {
          position: relative;
        }

        .price-main {
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont,
            sans-serif;
          font-weight: 800;
          background: linear-gradient(135deg, #f6c343 0%, #e6b339 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .price-main::after {
          content: "$";
          position: absolute;
          left: -16px;
          top: 0;
          font-size: 0.7em;
          opacity: 0.6;
        }

        .floating-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #f6c343 0%, #e6b339 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 8px 25px rgba(246, 195, 67, 0.3);
          animation: gentle-pulse 2s infinite;
        }

        @keyframes gentle-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .cta-button {
          background: linear-gradient(135deg, #f6c343 0%, #e6b339 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .cta-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .cta-button:hover::before {
          left: 100%;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(246, 195, 67, 0.4);
        }

        .quality-indicator {
          position: absolute;
          top: 16px;
          left: 16px;
          width: 12px;
          height: 12px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
          animation: quality-pulse 2s infinite;
        }

        @keyframes quality-pulse {
          0% {
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.1);
          }
          100% {
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
          }
        }
      `}</style>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          {/* Header minimalista */}
          <div className="text-center mb-16">
            <div
              className="inline-block px-4 py-2 text-white text-xs font-medium rounded-full mb-6 tracking-widest uppercase"
              style={{ backgroundColor: "#F6C343" }}
            >
              Elaboración Diaria
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
              Productos
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-800">
                Premium
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Listos para tu freezer, elaborados todos los días con la mejor
              calidad
            </p>
          </div>

          {/* Grid de productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="premium-card rounded-3xl p-0 shadow-lg"
              >
                {/* Badge flotante */}
                <div className="floating-badge">Fresco</div>

                {/* Indicador de calidad */}
                <div className="quality-indicator"></div>

                {/* Imagen */}
                <div className="image-container h-56 relative">
                  <Image
                    src={category.image.src}
                    alt={category.title}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Línea de acento */}
                <div
                  className={`accent-line bg-gradient-to-r ${category.accent}`}
                ></div>

                {/* Contenido */}
                <div className="p-8">
                  {/* Categoría */}
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                      {category.subtitle}
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                    {category.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Precios */}
                  <div className="flex items-end justify-between mb-8">
                    <div className="price-container">
                      <div className="flex items-baseline space-x-2">
                        <span className="price-main text-4xl">
                          {category.price}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          ${category.originalPrice}
                        </span>
                      </div>
                      <div className="text-xs text-green-600 font-medium mt-1">
                        Ahorrás $
                        {(
                          parseFloat(category.originalPrice) -
                          parseFloat(category.price)
                        ).toFixed(0)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-400 mb-1">por kg</div>
                      <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={category.href}>
                    <button className="cta-button w-full">
                      Pedir por WhatsApp
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
