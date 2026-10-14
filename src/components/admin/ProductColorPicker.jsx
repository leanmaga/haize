'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { DEFAULT_COLORS, colorKey, normalizeHex, colorHex } from '@/lib/product-colors';

export default function ProductColorPicker({ value, hex, onChange, colors = [] }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('#000000');
  const [error, setError] = useState('');
  const root = useRef(null);
  const id = useId();
  useEffect(() => {
    const close = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  const options = new Map(DEFAULT_COLORS.map((color) => [colorKey(color.name), color]));
  colors.forEach((color) => options.set(colorKey(color.name), color));
  if (value) options.set(colorKey(value), { name: value, hex: colorHex(value, hex) });
  const choose = (color) => { onChange(color.name, color.hex); setOpen(false); setCustom(false); setQuery(''); };
  const save = () => {
    const normalized = normalizeHex(code);
    if (!name.trim() || name.trim().length > 60) { setError('Ingresá un nombre de hasta 60 caracteres.'); return; }
    if (!normalized) { setError('Ingresá un código válido, por ejemplo #1A73E8.'); return; }
    choose({ name: name.trim(), hex: normalized });
  };
  return <div ref={root} className="relative" onKeyDown={(event) => { if (event.key === 'Escape') { setOpen(false); event.stopPropagation(); } }}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">Color (requerido)</label>
    <button id={id} type="button" aria-expanded={open} onClick={() => { setOpen(!open); setQuery(''); }} className="w-full border border-gray-300 rounded-md px-3 py-2 flex items-center gap-3 text-left">
      {value && <span className="w-6 h-6 rounded-full border shrink-0" style={{ backgroundColor: colorHex(value, hex) }} />}
      <span>{value || 'Seleccionar color'}</span><span className="ml-auto" aria-hidden="true">⌄</span>
    </button>
    {open && <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-lg border shadow-xl p-2">
      <button type="button" className="w-full text-left px-3 py-3 font-medium border-b" onClick={() => { setCustom(!custom); setName(''); setError(''); }}>+ Agregar tu color</button>
      {custom ? <div className="p-2 space-y-3">
        <label className="block text-sm">Nombre del color<input value={name} maxLength={60} onChange={(event) => setName(event.target.value)} className="w-full border rounded px-2 py-2 mt-1" placeholder="Ej: Azul petróleo" /></label>
        <label className="block text-sm">Seleccionar tono<input type="color" value={normalizeHex(code) || '#000000'} onChange={(event) => { setCode(event.target.value); setError(''); }} className="block w-full h-12 mt-1 cursor-pointer" /></label>
        <label className="block text-sm">Código hexadecimal<input value={code} onChange={(event) => setCode(event.target.value)} className="w-full border rounded px-2 py-2 mt-1" placeholder="#1A73E8" /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="button" onClick={save} className="bg-black text-white rounded px-3 py-2">Usar color</button>
      </div> : <>
        <input aria-label="Buscar color" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar color" className="w-full border rounded px-2 py-2 my-2" />
        <div className="max-h-60 overflow-y-auto">{[...options.values()].filter((color) => colorKey(color.name).includes(colorKey(query))).sort((a, b) => a.name.localeCompare(b.name, 'es')).map((color) => <button key={colorKey(color.name)} type="button" onClick={() => choose(color)} className="w-full flex items-center gap-4 text-left px-3 py-2 hover:bg-gray-100">
          <span className="w-9 h-9 rounded-full border shrink-0" style={{ backgroundColor: color.hex }} />{color.name}
        </button>)}</div>
      </>}
    </div>}
  </div>;
}
