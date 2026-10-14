'use client';
import { useEffect, useState } from 'react';
import GoogleCoverageMap from '@/components/admin/GoogleCoverageMap';
import { mergeCoverage } from '@/lib/delivery-coverage';

export default function CoverageMap() {
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const [catalogResponse, zonesResponse] = await Promise.all([
          fetch('/api/delivery-zones/catalog', { signal: controller.signal }),
          fetch('/api/delivery-zones', { cache: 'no-store', signal: controller.signal }),
        ]);
        if (!zonesResponse.ok) throw new Error('No se pudo consultar la cobertura.');
        const zones = await zonesResponse.json();
        const catalog = catalogResponse.ok ? await catalogResponse.json() : { features: [] };
        setFeatures(mergeCoverage(catalog.features, zones.features.map((feature) => ({
          ...feature.properties, _id: feature.id, geometry: feature.geometry, isActive: true,
        }))));
        setError('');
      } catch (err) { if (err.name !== 'AbortError') setError(err.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    };
    load();
    window.addEventListener('focus', load);
    return () => { controller.abort(); window.removeEventListener('focus', load); };
  }, []);
  return <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Cobertura de envíos">
    <div className="p-4"><h3 className="font-semibold">Entrega y zonas de cobertura</h3><p className="mt-1 text-xs text-slate-600">Las zonas azules tienen cobertura. Pasá el cursor o tocá un municipio para consultar el precio.</p></div>
    {loading ? <p role="status" className="p-4">Cargando cobertura…</p> : error ? <p role="alert" className="p-4">{error}</p> : <GoogleCoverageMap features={features} />}
    <div className="space-y-2 p-4 text-sm">
      {!loading && !error && !features.some((feature) => feature.properties.isActive) && <p>No hay municipios con cobertura configurada.</p>}
      <ul className="max-h-40 space-y-1 overflow-y-auto">{features.filter((feature) => feature.properties.isActive).map((feature) => <li key={feature.id} className="flex justify-between gap-3"><span>{feature.properties.name}</span><span>{feature.properties.shippingPrice == null ? 'Consultar costo' : Number(feature.properties.shippingPrice) === 0 ? 'Sin costo' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(feature.properties.shippingPrice)}</span></li>)}</ul>
      <p className="text-xs text-slate-500">Entrega en el día para pedidos confirmados antes de la hora límite indicada para cada zona. Fuera de la cobertura, consultá las opciones de envío.</p>
    </div>
  </section>;
}
