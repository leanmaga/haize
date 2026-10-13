'use client';

import { useMemo, useState } from 'react';

const project = ([lon, lat]) => [lon, -Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI];
const start = project([-59.25, -34.15]);
const initialView = { x: start[0], y: start[1], width: 1.55, height: 1.5 };
const money = (price) => price === 0 ? 'Sin cargo · cubierto por el vendedor' : `$${price.toLocaleString('es-AR')}`;

export default function CoverageMap({ features = [], onToggle }) {
  const [view, setView] = useState(initialView);
  const [selected, setSelected] = useState(null);
  const shapes = useMemo(() => features.flatMap((feature) => {
    const geometry = feature.geometry;
    const rings = geometry?.type === 'Polygon' ? geometry.coordinates : geometry?.type === 'MultiPolygon' ? geometry.coordinates.flat() : [];
    const points = rings.flat();
    if (!points.length) return [];
    const projected = points.map(project);
    const xs = projected.map(([x]) => x), ys = projected.map(([, y]) => y);
    const bounds = { x: Math.min(...xs), y: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys) };
    return [{ ...feature, bounds, path: rings.map((ring) => ring.map((point, index) => `${index ? 'L' : 'M'}${project(point).join(',')}`).join(' ') + ' Z').join(' ') }];
  }), [features]);
  const current = shapes.find((shape) => String(shape.id) === selected);
  const zoom = (factor) => setView((previous) => {
    const width = Math.max(0.08, Math.min(12, previous.width * factor));
    const height = previous.height * width / previous.width;
    return { x: previous.x + (previous.width - width) / 2, y: previous.y + (previous.height - height) / 2, width, height };
  });
  const pan = (x, y) => setView((previous) => ({ ...previous, x: previous.x + x * previous.width * 0.25, y: previous.y + y * previous.height * 0.25 }));
  const showAll = () => {
    if (!shapes.length) return;
    const x = Math.min(...shapes.map((shape) => shape.bounds.x)), y = Math.min(...shapes.map((shape) => shape.bounds.y));
    const width = Math.max(...shapes.map((shape) => shape.bounds.right)) - x;
    const height = Math.max(...shapes.map((shape) => shape.bounds.bottom)) - y;
    setView({ x: x - width * 0.03, y: y - height * 0.03, width: width * 1.06, height: height * 1.06 });
  };
  return <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 p-3">
      <span className="text-sm font-nexa-bold">Mapa de cobertura</span>
      <div className="flex gap-2 text-xs">
        <button type="button" onClick={() => setView(initialView)} className="rounded border px-2 py-1 hover:bg-gray-100">Gran Buenos Aires</button>
        <button type="button" onClick={showAll} className="rounded border px-2 py-1 hover:bg-gray-100">Toda la provincia</button>
      </div>
    </div>
    <div className="relative bg-slate-50">
      <svg viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} className="block h-[420px] w-full" role="group" aria-label="Mapa de municipios y tarifas de envío">
        {shapes.map((shape) => {
          const id = String(shape.id), p = shape.properties;
          const visible = shape.bounds.right >= view.x && shape.bounds.x <= view.x + view.width && shape.bounds.bottom >= view.y && shape.bounds.y <= view.y + view.height;
          return <g key={id}>
            <path d={shape.path} fillRule="evenodd" fill={p.isActive ? '#4565df' : '#ffffff'} fillOpacity={p.isActive ? 0.32 : 1} stroke={selected === id ? '#111111' : '#94a3b8'} strokeWidth={selected === id ? 2 : 1} vectorEffect="non-scaling-stroke"
              role={onToggle ? 'button' : 'img'} tabIndex={visible ? 0 : -1} aria-label={p.name} aria-pressed={onToggle ? !!p.isActive : undefined}
              className={onToggle ? 'cursor-pointer outline-none focus:stroke-black hover:stroke-black' : 'outline-none'}
              onMouseEnter={() => setSelected(id)} onFocus={() => setSelected(id)}
              onClick={() => { setSelected(id); onToggle?.(id); }}
              onKeyDown={(event) => { if (onToggle && ['Enter', ' '].includes(event.key)) { event.preventDefault(); onToggle(id); } }}>
              <title>{p.name} · {p.isActive && p.shippingPrice != null ? money(p.shippingPrice) : 'Por coordinar'}</title>
            </path>
            {visible && shape.bounds.right - shape.bounds.x > view.width * 0.055 && <text x={(shape.bounds.x + shape.bounds.right) / 2} y={(shape.bounds.y + shape.bounds.bottom) / 2} textAnchor="middle" dominantBaseline="middle" fontSize={view.width * 0.015} fill="#334155" pointerEvents="none">{p.name}</text>}
          </g>;
        })}
      </svg>
      <div className="absolute right-3 top-3 grid grid-cols-2 gap-1 rounded-lg border bg-white p-1 shadow-sm">
        {[['Acercar', '+', () => zoom(0.7)], ['Alejar', '−', () => zoom(1.4)], ['Mover al oeste', '←', () => pan(-1, 0)], ['Mover al este', '→', () => pan(1, 0)], ['Mover al norte', '↑', () => pan(0, -1)], ['Mover al sur', '↓', () => pan(0, 1)]].map(([label, symbol, action]) => <button key={label} type="button" aria-label={label} title={label} onClick={action} className="h-8 w-8 rounded text-lg hover:bg-gray-100">{symbol}</button>)}
      </div>
    </div>
    <div className="min-h-20 border-t border-gray-200 px-4 py-3 text-sm" aria-live="polite">
      {current ? <><p className="font-nexa-bold">{current.properties.name}</p><p className="mt-1 text-gray-600">{current.properties.isActive && current.properties.shippingPrice != null ? money(current.properties.shippingPrice) : 'Envío por coordinar'}</p></> : <p className="text-gray-500">{onToggle ? 'Seleccioná un municipio para activar o desactivar su cobertura.' : 'Pasá sobre un municipio para consultar su tarifa.'}</p>}
      <p className="mt-1 text-xs text-gray-400">Límites oficiales del IGN · Azul: cobertura activa</p>
    </div>
  </div>;
}
