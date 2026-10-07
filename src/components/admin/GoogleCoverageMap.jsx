'use client';
import { useEffect, useRef, useState } from 'react';

let mapsPromise;
function loadMaps() {
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key || key === 'tu_clave') return reject(new Error('Falta configurar la clave de Google Maps.'));
    const script = document.createElement('script');
    const timeout = setTimeout(() => reject(new Error('Google Maps tardó demasiado en cargar.')), 20000);
    window.haizeMapsReady = () => { clearTimeout(timeout); resolve(window.google.maps); };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=haizeMapsReady&language=es&region=AR`;
    script.async = true;
    script.onerror = () => { clearTimeout(timeout); reject(new Error('No se pudo cargar Google Maps.')); };
    document.head.appendChild(script);
  });
  return mapsPromise;
}
const money = (value) => Number(value) === 0 ? 'Envío sin costo' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

export default function GoogleCoverageMap({ features = [], onToggle }) {
  const container = useRef(null);
  const instance = useRef(null);
  const toggle = useRef(onToggle);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  toggle.current = onToggle;
  useEffect(() => {
    let cancelled = false;
    let map, info, listeners = [];
    const previousAuth = window.gm_authFailure;
    const authFailure = () => setError('Google Maps rechazó la clave. Revisá su configuración y los dominios autorizados.');
    window.gm_authFailure = authFailure;
    loadMaps().then((maps) => {
      if (cancelled) return;
      map = new maps.Map(container.current, {
        center: { lat: -34.64, lng: -58.58 }, zoom: 10, minZoom: 6,
        mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
        gestureHandling: 'cooperative',
        styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
      });
      instance.current = map;
      info = new maps.InfoWindow();
      map.data.setStyle((feature) => ({
        fillColor: '#4565df', fillOpacity: feature.getProperty('isActive') ? 0.32 : 0,
        strokeColor: '#5367d8', strokeWeight: 1.5, strokeOpacity: 0.8,
        clickable: true,
      }));
      const show = (event) => {
        const feature = event.feature;
        const content = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = feature.getProperty('name');
        content.appendChild(name);
        const detail = document.createElement('p');
        const price = feature.getProperty('shippingPrice');
        detail.textContent = feature.getProperty('isActive')
          ? (price == null ? 'Consultar costo de envío' : money(price)) + ' · Corte ' + (feature.getProperty('cutoffTime') || '11:00')
          : 'Sin cobertura configurada';
        content.appendChild(detail);
        info.setContent(content); info.setPosition(event.latLng); info.open(map);
      };
      listeners = [
        map.data.addListener('mouseover', (event) => { map.data.overrideStyle(event.feature, { strokeWeight: 3 }); show(event); }),
        map.data.addListener('mouseout', (event) => { map.data.revertStyle(event.feature); info.close(); }),
        map.data.addListener('click', (event) => {
          show(event);
          if (toggle.current) toggle.current(String(event.feature.getId()));
        }),
      ];
      setReady(true);
    }).catch((err) => { if (!cancelled) setError(err.message); });
    return () => {
      cancelled = true; listeners.forEach((listener) => listener.remove());
      info?.close(); instance.current = null;
      if (window.gm_authFailure === authFailure) window.gm_authFailure = previousAuth;
    };
  }, []);
  useEffect(() => {
    if (!ready || !instance.current) return;
    const data = instance.current.data;
    data.forEach((feature) => data.remove(feature));
    data.addGeoJson({ type: 'FeatureCollection', features });
  }, [features, ready]);
  return <div className="relative overflow-hidden rounded-xl border border-slate-200">
    <div ref={container} style={{ height: 420, width: '100%' }} aria-label="Mapa de municipios y tarifas de envío" />
    {error && <p role="alert" className="absolute inset-0 flex items-center justify-center bg-slate-50 p-6 text-center text-sm text-red-700">{error}</p>}
    {!ready && !error && <p role="status" className="absolute left-4 top-4 rounded bg-white p-3 text-sm shadow">Cargando mapa…</p>}
  </div>;
}
