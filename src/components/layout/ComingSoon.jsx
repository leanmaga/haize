export default function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center overflow-hidden relative bg-black">
      {/* Burbujas blancas de fondo */}
      <div className="absolute w-full h-full overflow-hidden">
        <div className="absolute w-32 h-32 rounded-full bg-white/5 left-[10%] top-[15%] animate-float"></div>
        <div className="absolute w-40 h-40 rounded-full bg-white/5 right-[12%] top-[35%] animate-float-delayed-2"></div>
        <div className="absolute w-24 h-24 rounded-full bg-white/5 left-[15%] bottom-[25%] animate-float-delayed-4"></div>
        <div className="absolute w-36 h-36 rounded-full bg-white/5 right-[20%] bottom-[15%] animate-float-delayed-6"></div>
        <div className="absolute w-20 h-20 rounded-full bg-white/5 left-[45%] top-[10%] animate-float-delayed-4"></div>
        <div className="absolute w-28 h-28 rounded-full bg-white/5 right-[40%] bottom-[35%] animate-float-delayed-2"></div>
      </div>

      {/* Contenido principal */}
      <div className="text-center text-white z-10 px-6 animate-fade-in max-w-4xl">
        {/* Logo grande */}
        <h1
          className="text-8xl md:text-9xl font-bold mb-8 tracking-wider"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          HAIZE
        </h1>

        {/* Descripción */}
        <h3 className="text-base md:text-lg mb-8 text-white/70 leading-relaxed max-w-xl mx-auto">
          Nuestro ecommerce estará disponible muy pronto.
        </h3>
      </div>
    </div>
  );
}
