'use client';
import { useEffect, useMemo, useState } from 'react';
import GoogleCoverageMap from './GoogleCoverageMap';
import { mergeCoverage } from '@/lib/delivery-coverage';
import { canonicalMunicipalityId } from '@/lib/municipalities';
import PhotoUploadLoader from './PhotoUploadLoader';

export default function DeliveryZoneManager() {
  const [features, setFeatures] = useState([]);
  const [records, setRecords] = useState({});
  const [dirty, setDirty] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch('/api/delivery-zones/catalog'), fetch('/api/delivery-zones/admin', { cache: 'no-store' })])
      .then(async (responses) => {
        const data = await Promise.all(responses.map((response) => response.json()));
        const failed = responses.findIndex((response) => !response.ok);
        if (failed >= 0) throw new Error(data[failed].error || 'No se pudo cargar la cobertura.');
        if (cancelled) return;
        const merged = mergeCoverage(data[0].features, data[1].zones);
        setFeatures(merged);
        const ids = {};
        merged.forEach((feature) => {
          const record = data[1].zones.find((zone) => zone.slug === feature.properties.slug);
          if (record) ids[String(feature.id)] = record._id;
        });
        setRecords(ids);
      }).catch((error) => { if (!cancelled) setMessage(error.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const change = (id, values) => {
    if (busy) return;
    setFeatures((current) => current.map((feature) => String(feature.id) === id ? { ...feature, properties: { ...feature.properties, ...values } } : feature));
    setDirty((current) => current.includes(id) ? current : [...current, id]);
  };
  const toggle = (id) => {
    const feature = features.find((item) => String(item.id) === id);
    if (feature) change(id, { isActive: !feature.properties.isActive });
  };
  const save = async () => {
    const pending = features.filter((feature) => dirty.includes(String(feature.id)));
    setBusy(true); setMessage('');
    const errors = [];
    for (const feature of pending) {
      const id = String(feature.id);
      try {
        const response = await fetch(records[id] ? '/api/delivery-zones/' + records[id] : '/api/delivery-zones', {
          method: records[id] ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...feature.properties, municipalityId: canonicalMunicipalityId(id), geometry: feature.geometry, shippingPrice: feature.properties.shippingPrice == null || feature.properties.shippingPrice === '' ? null : Number(feature.properties.shippingPrice) }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'No se pudo guardar.');
        setRecords((current) => ({ ...current, [id]: data._id }));
        setDirty((current) => current.filter((item) => item !== id));
      } catch (error) { errors.push(feature.properties.name + ': ' + error.message); }
    }
    setMessage(errors.length ? errors.join(' · ') : 'Cobertura y precios guardados. Ya están disponibles en los productos.');
    setBusy(false);
  };
  const visible = useMemo(() => features.filter((feature) => feature.properties.name.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(search.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, ''))), [features, search]);
  if (loading) return <p role="status">Cargando municipios y cobertura…</p>;
  return <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
    <div><h2 className="text-xl font-semibold">Municipios y precios de envío</h2><p className="mt-1 text-sm text-slate-600">Marcá los municipios con cobertura. El azul se actualiza al instante. Guardá para publicar en los productos.</p></div>
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="rounded-xl border border-slate-200 p-3">
        <input aria-label="Buscar municipio" placeholder="Buscar municipio…" value={search} onChange={(event) => setSearch(event.target.value)} className="mb-3 w-full rounded-lg border p-2" />
        <div className="max-h-[365px] space-y-2 overflow-y-auto">
          {visible.map((feature) => { const id = String(feature.id); const p = feature.properties; return <div key={id} className="rounded-lg border border-slate-200 p-3">
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" disabled={busy} checked={p.isActive} onChange={() => toggle(id)} />{p.name}</label>
            {(p.isActive || dirty.includes(id)) && <div className="mt-2 flex gap-2">
              <label className="min-w-0 flex-1 text-xs">Envío (ARS)<input aria-label={'Precio de envío ' + p.name} type="number" min="0" step="0.01" disabled={busy} value={p.shippingPrice ?? ''} placeholder="Vacío = coordinar · 0 = gratis" onChange={(event) => change(id, { shippingPrice: event.target.value })} className="mt-1 w-full rounded border p-1.5" /></label>
              <label className="text-xs">Hora límite<input type="time" disabled={busy} value={p.cutoffTime} onChange={(event) => change(id, { cutoffTime: event.target.value })} className="mt-1 block rounded border p-1.5" /></label>
            </div>}
          </div>; })}
        </div>
      </div>
      <GoogleCoverageMap features={features} onToggle={toggle} />
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-slate-600">{features.filter((feature) => feature.properties.isActive).length} municipios activos · {dirty.length} cambios sin guardar</span><button disabled={busy || !dirty.length} onClick={save} className="rounded-lg bg-blue-700 px-5 py-2 text-white disabled:opacity-50">{busy ? 'Guardando…' : 'Guardar cobertura y precios'}</button></div>
    {busy && <PhotoUploadLoader label="Guardando…" ariaLabel="Guardando precios de envío" />}
    {message && <p role="status" className="text-sm">{message}</p>}
  </section>;
}
