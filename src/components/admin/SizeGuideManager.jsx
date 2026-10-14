'use client';
import { useEffect, useState } from 'react';
import useCategories from '@/hooks/useCategories';
import AddCategory from './AddCategory';
import SizeGuideTable from './products/SizeGuideTable';

export default function SizeGuideManager() {
  const { categories, error } = useCategories();
  const [guides, setGuides] = useState([]);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/size-guides', { cache: 'no-store' }).then(async (response) => {
      if (!response.ok) throw new Error('No se pudieron cargar las guías.');
      const data = await response.json();
      if (!cancelled) setGuides(data.filter((guide) => !guide.productId));
    }).catch((err) => { if (!cancelled) setMessage(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const guide = guides.find((item) => item.category === selected);
  const initial = guide && !guide.sizes?.length && guide.measurements?.length ? { ...guide, sizes: guide.measurements.map((row) => ({ labelSize: row.size, garmentMeasurements: { length: row.length, width: row.width, stretchedWidth: row.stretchedWidth } })) } : guide;
  const save = async (payload) => {
    if (saving) return;
    setSaving(true); setMessage('');
    try {
      const response = await fetch(guide ? '/api/size-guides/' + guide._id : '/api/size-guides', {
        method: guide ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, category: selected }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar la guía.');
      setGuides((current) => [data.sizeGuide, ...current.filter((item) => item._id !== data.sizeGuide._id)]);
      setMessage('Guía guardada.');
    } catch (err) { setMessage(err.message); }
    finally { setSaving(false); }
  };
  return <div className="space-y-4">
    <h2 className="text-xl font-semibold">Guías de talles por categoría</h2>
    {(error || message) && <p role="status">{error || message}</p>}
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="space-y-2 rounded-lg bg-white p-4">
        {categories.map((category) => <button type="button" key={category.slug} disabled={saving} onClick={() => setSelected(category.slug)} className={'block w-full rounded border p-3 text-left ' + (selected === category.slug ? 'border-blue-600 bg-blue-50' : '')}>{category.name}</button>)}
        <AddCategory onCreated={setSelected} />
      </aside>
      <div className="rounded-lg bg-white p-4">{loading ? 'Cargando guías…' : selected ? <fieldset disabled={saving}><SizeGuideTable key={selected + (guide?._id || '')} category={selected} productName={categories.find((item) => item.slug === selected)?.name || selected} initialData={initial} onSave={save} /></fieldset> : 'Seleccioná una categoría.'}</div>
    </div>
  </div>;
}
