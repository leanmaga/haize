'use client';

export default function PhotoUploadLoader() {
  return (
    <div role="status" aria-label="Carga de fotos" aria-live="polite" className="flex flex-col items-center justify-center gap-3 py-2">
      <div aria-hidden="true" className="relative flex h-20 w-20 items-center justify-center rounded-full bg-black text-white">
        <span className="font-nexa-bold text-sm tracking-widest">HAIZE</span>
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" />
      </div>
      <p className="text-sm font-medium">Cargando…</p>
    </div>
  );
}
