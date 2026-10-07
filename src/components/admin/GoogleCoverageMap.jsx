'use client';
import { useEffect, useRef } from 'react';

const loadGoogleMaps = () => new Promise((resolve, reject) => {
  if (window.google?.maps) return resolve(window.google.maps);
  const existing = document.querySelector('script[data-google-maps]');
  if (existing) { existing.addEventListener('load', () => resolve(window.google.maps)); existing.addEventListener('error', reject); return; }
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '')}`;
  script.async = true; script.defer = true; script.dataset.googleMaps = 'true'; script.onload = () => resolve(window.google.maps); script.onerror = reject; document.head.appendChild(script);
});

export default function GoogleCoverageMap({ features = [], activeIds = [], zones = [], boundsFeatures }) {
  features = boundsFeatures || features;
  activeIds = zones.length ? zones.map((feature) => String(feature.properties?.id || feature.id)) : activeIds;
  const mapRef = useRef(null); const mapInstance = useRef(null); const dataLayers = useRef([]);
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((maps) => {
      if (cancelled || !mapRef.current) return;
      if (!mapInstance.current) mapInstance.current = new maps.Map(mapRef.current, { center: { lat: -34.65, lng: -58.45 }, zoom: 9, mapTypeControl: false, streetViewControl: false, fullscreenControl: false, mapTypeId: 'roadmap' });
      dataLayers.current.forEach((layer) => layer.setMap(null)); dataLayers.current = [];
      const bounds = new maps.LatLngBounds();
      features.forEach((feature) => {
        if (!feature.geometry) return;
        const active = activeIds.includes(String(feature.properties?.id || feature.id));
        const layer = new maps.Data({ map: mapInstance.current });
        layer.addGeoJson({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: feature.geometry, properties: feature.properties || {} }] });
        layer.setStyle({ fillColor: active ? '#2563eb' : '#94a3b8', fillOpacity: active ? 0.35 : 0.06, strokeColor: active ? '#1d4ed8' : '#64748b', strokeOpacity: active ? 0.95 : 0.45, strokeWeight: active ? 2 : 1 });
        layer.forEach((item) => item.getGeometry().forEachLatLng((point) => bounds.extend(point)));
        dataLayers.current.push(layer);
      });
      if (!bounds.isEmpty()) mapInstance.current.fitBounds(bounds, 36);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [features, activeIds]);
  return <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><h3 className="text-sm font-semibold text-slate-900">Vista previa de cobertura</h3><p className="text-xs text-slate-500">Las zonas azules son las seleccionadas para envío Same Day.</p></div><span className="flex items-center gap-1.5 text-xs font-medium text-blue-700"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" />Cobertura seleccionada</span></div><div ref={mapRef} className="h-[420px] w-full bg-slate-100" /></div>;
}
