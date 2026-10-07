'use client';

import { useEffect, useState } from 'react';

const ZONES = [
  { id: 'caba', name: 'CABA', detail: 'Ciudad Autónoma de Buenos Aires', path: 'M220 117 260 103 288 120 282 163 249 181 215 157Z', label: [249, 142] },
  { id: 'san-isidro', name: 'San Isidro', detail: 'Zona Norte', path: 'M161 69 212 56 231 90 214 116 176 108Z', label: [186, 88] },
  { id: 'vicente-lopez', name: 'Vicente López', detail: 'Zona Norte', path: 'M176 108 214 116 220 137 188 143 164 124Z', label: [180, 124] },
  { id: 'tigre', name: 'Tigre', detail: 'Zona Norte', path: 'M104 41 162 39 177 69 161 93 119 82Z', label: [133, 61] },
  { id: 'san-fernando', name: 'San Fernando', detail: 'Zona Norte', path: 'M61 53 105 41 119 82 100 105 70 91Z', label: [84, 73] },
  { id: 'san-miguel', name: 'San Miguel', detail: 'Zona Oeste', path: 'M121 98 161 93 176 127 156 155 119 139Z', label: [137, 122] },
  { id: 'moron', name: 'Morón', detail: 'Zona Oeste', path: 'M97 139 119 139 138 166 122 194 88 181Z', label: [107, 163] },
  { id: 'lanus', name: 'Lanús', detail: 'Zona Sur', path: 'M212 163 249 181 242 218 211 224 194 192Z', label: [222, 198] },
  { id: 'quilmes', name: 'Quilmes', detail: 'Zona Sur', path: 'M249 181 282 163 315 187 304 224 270 229 242 218Z', label: [273, 201] },
  { id: 'ezeiza', name: 'Ezeiza', detail: 'Zona Sur', path: 'M122 194 156 155 194 192 183 236 144 249 111 227Z', label: [148, 215] },
];

export default function CoverageMap({ zones = ZONES }) {
  const [mapZones, setMapZones] = useState(zones);
  const [selected, setSelected] = useState(null);
  const activeZone = mapZones.find((zone) => zone.id === selected);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/delivery-zones')
      .then((response) => (response.ok ? response.json() : null))
      .then((collection) => {
        if (cancelled || !collection?.features?.length) return;
        const coordinates = collection.features.flatMap((feature) => {
          const rings = feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates.flat() : feature.geometry.coordinates;
          return rings.flat();
        });
        const lons = coordinates.map(([lon]) => lon);
        const lats = coordinates.map(([, lat]) => lat);
        const minLon = Math.min(...lons); const maxLon = Math.max(...lons); const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
        const project = ([lon, lat]) => [25 + ((lon - minLon) / (maxLon - minLon || 1)) * 300, 245 - ((lat - minLat) / (maxLat - minLat || 1)) * 205];
        setMapZones(collection.features.map((feature) => { const rings = feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates.flat() : feature.geometry.coordinates; return { id: String(feature.id), name: feature.properties.name, detail: feature.properties.detail, path: rings.map((ring) => `${ring.map(project).map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')}Z`).join(' '), label: project(rings[0][0]) }; }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Mapa de cobertura de entregas">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Ver zonas de entrega Same Day</h3>
          <p className="mt-0.5 text-xs text-slate-500">Pasá por una zona para ver su ubicación</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Cobertura activa</span>
      </div>
      <div className="relative bg-[#edf8f3] p-2 sm:p-3">
        <svg viewBox="0 0 350 270" role="img" aria-label="Mapa de zonas de cobertura en Buenos Aires" className="h-auto w-full rounded-xl bg-[#e5f5ea]">
          <path d="M0 62h350M0 117h350M0 172h350M0 227h350M54 0v270M114 0v270M174 0v270M234 0v270M294 0v270" className="stroke-slate-200" strokeWidth="1" />
          <path d="M0 207 C55 190 70 219 121 202S194 186 244 203 307 194 350 179" className="fill-none stroke-sky-300" strokeWidth="10" opacity=".65" />
          <path d="M0 207 C55 190 70 219 121 202S194 186 244 203 307 194 350 179" className="fill-none stroke-white" strokeWidth="2" opacity=".8" />
          <text x="24" y="25" className="fill-slate-400 text-[9px]">Zárate</text><text x="276" y="44" className="fill-slate-400 text-[9px]">Río de la Plata</text><text x="294" y="247" className="fill-slate-400 text-[9px]">La Plata</text><text x="15" y="255" className="fill-slate-400 text-[9px]">Luján</text>
          {mapZones.map((zone) => (
            <g key={zone.id} onMouseEnter={() => setSelected(zone.id)} onFocus={() => setSelected(zone.id)} onMouseLeave={() => setSelected(null)}>
              <path d={zone.path} tabIndex="0" role="button" aria-label={`Zona ${zone.name}`} onClick={() => setSelected(zone.id)} className={`cursor-pointer stroke-blue-600 transition ${selected === zone.id ? 'fill-blue-500/50 stroke-[2.5]' : 'fill-blue-500/20 hover:fill-blue-500/40'}`} />
              <text x={zone.label[0]} y={zone.label[1]} textAnchor="middle" className="pointer-events-none fill-blue-950 text-[7px] font-semibold">{zone.name}</text>
            </g>
          ))}
        </svg>
        {activeZone && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white px-4 py-3 text-center shadow-xl ring-1 ring-slate-200" role="status"><p className="text-sm font-bold text-slate-900">{activeZone.name}</p><p className="mt-0.5 text-xs text-slate-500">{activeZone.detail}</p><p className="mt-2 text-[11px] font-semibold text-blue-700">Entrega hoy · pedidos antes de las 11:00</p></div>}
      </div>
      <div className="flex gap-2 px-4 py-3 text-xs leading-relaxed text-slate-500"><span className="mt-0.5 shrink-0 text-base">🚚</span><p>El envío Same Day aplica dentro de las zonas azules para pedidos confirmados antes de las <strong className="text-slate-700">11:00</strong>. Fuera de estas zonas, coordinamos la entrega.</p></div>
    </section>
  );
}
