let mapsPromise;

export function loadMaps() {
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key || key === 'tu_clave') return reject(new Error('Completá la dirección manualmente.'));
    const script = document.createElement('script');
    const fail = () => { clearTimeout(timeout); script.remove(); reject(new Error('No se pudieron cargar las sugerencias. Completá la dirección manualmente.')); };
    const timeout = setTimeout(fail, 20000);
    window.haizeMapsReady = () => { clearTimeout(timeout); resolve(window.google.maps); };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=haizeMapsReady&language=es&region=AR`;
    script.async = true;
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch((error) => { mapsPromise = null; throw error; });
  return mapsPromise;
}
