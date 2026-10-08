'use client';

import { useState } from 'react';
import Link from 'next/link';
import useCategories from '@/hooks/useCategories';
import PhotoUploadLoader from './PhotoUploadLoader';

async function request(path, options) {
  const response = await fetch(`/api/mercadolibre/import${path}`, { cache: 'no-store', ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo completar la importación.');
  return data;
}
const money = (value, currency = 'ARS') => new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(value || 0);

export default function MercadoLibreImport({ connected, onImported }) {
  const { categories } = useCategories();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState([]);
  const [queue, setQueue] = useState([]);
  const [review, setReview] = useState(null);
  const [result, setResult] = useState(null);

  const load = async (next = false) => {
    setBusy(true); setError(''); setMessage(''); setResult(null);
    try {
      const data = await request(next ? `?cursor=${encodeURIComponent(cursor)}` : '');
      setItems((current) => next ? [...current, ...data.items.filter((item) => !current.some((other) => other.id === item.id))] : data.items);
      setCursor(data.nextCursor); setLoaded(true); setMessage(data.warning || '');
      if (!next) setSelected([]);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const markImported = (id, imported) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, imported } : item));
    setSelected((current) => current.filter((itemId) => itemId !== id));
  };
  const improvePhotos = async (item) => {
    setBusy(true); setError(''); setMessage('');
    try {
      const data = await request('', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId: item.id }) });
      setResult(data.imported);
      setMessage(data.warning || 'Fotos actualizadas con la mejor resolución disponible.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const preview = async (ids) => {
    if (!ids.length) { setQueue([]); return; }
    const [id, ...rest] = ids;
    setBusy(true); setError(''); setMessage(''); setReview(null); setResult(null); setQueue(rest);
    try {
      const data = await request(`?itemId=${encodeURIComponent(id)}`);
      setMessage(data.warning || '');
      if (data.imported) {
        markImported(id, data.imported); setResult(data.imported); setMessage('Este producto ya está vinculado a Haize.');
      } else {
        setReview({ ...data.preview, itemId: id, category: '', featured: false, status: data.status });
      }
    } catch (err) { setError(`${id}: ${err.message}`); }
    finally { setBusy(false); }
  };
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = await request('', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        itemId: review.itemId, title: review.title, description: review.description,
        category: review.category, salePrice: review.salePrice, featured: review.featured,
      }) });
      markImported(review.itemId, data.imported); setReview(null); setResult(data.imported);
      setMessage(data.warning || (data.alreadyImported ? 'Este producto ya estaba importado.' : 'Producto importado y publicado en Haize.'));
      onImported?.();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const change = (field, value) => setReview((current) => ({ ...current, [field]: value }));
  const visible = items.filter((item) => `${item.title} ${item.id}`.toLowerCase().includes(filter.toLowerCase()));
  const inputClass = 'w-full border border-gray-300 rounded-md px-3 py-2 mt-1';

  return <section className="bg-white rounded-lg shadow-md p-6 space-y-5" aria-label="Importar desde Mercado Libre">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-lg font-semibold">Importar desde Mercado Libre</h3>
      <button type="button" onClick={() => load()} disabled={!connected || busy || !!review} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">{loaded ? 'Actualizar publicaciones' : 'Traer mis publicaciones'}</button>
    </div>
    {!connected && <p className="text-sm text-gray-600">Conectá tu cuenta para ver las publicaciones.</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="text-sm">{message}</p>}
    {result && <Link className="inline-block underline" href={`/admin/products/edit/${result.productId}`}>Editar {result.title} en Haize</Link>}
    {busy && <PhotoUploadLoader />}
    {loaded && !review && <>
      <input aria-label="Buscar entre publicaciones cargadas" className={inputClass} placeholder="Buscar entre las publicaciones cargadas" value={filter} onChange={(event) => setFilter(event.target.value)} />
      <div className="max-h-[480px] overflow-y-auto divide-y">
        {visible.map((item) => <div key={item.id} className="flex items-center gap-3 py-3">
          <input type="checkbox" aria-label={`Seleccionar ${item.title}`} disabled={busy || !!item.imported || !['active', 'paused'].includes(item.status)} checked={selected.includes(item.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} className="h-4 w-4" />
          {item.thumbnail && <img src={item.thumbnail} alt="" className="w-14 h-14 object-contain" />}
          <div className="flex-1 min-w-0"><p className="font-medium">{item.title}</p><p className="text-xs text-gray-500">{item.id} · {money(item.price, item.currency)} · {({ active: 'Activa', paused: 'Pausada', closed: 'Finalizada', under_review: 'En revisión' })[item.status] || item.status}</p></div>
          {item.imported && <div className="flex flex-col gap-2 items-end"><Link className="text-sm underline" href={`/admin/products/edit/${item.imported.productId}`}>Ya vinculada</Link><button type="button" disabled={busy} onClick={() => improvePhotos(item)} className="text-sm border rounded px-3 py-2 disabled:opacity-50">Mejorar fotos</button></div>}
        </div>)}
        {!visible.length && <p className="text-sm py-4">No hay publicaciones para mostrar.</p>}
      </div>
      <div className="flex flex-wrap gap-3">
        {cursor && <button disabled={busy} onClick={() => load(true)} className="border px-4 py-2 rounded disabled:opacity-50">Cargar más</button>}
        <button disabled={busy || !selected.length} onClick={() => preview(selected)} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">Revisar seleccionados ({selected.length})</button>
      </div>
    </>}
    {review && <form onSubmit={save} className="space-y-4">
      <h4 className="font-semibold">Revisar {review.itemId}</h4>
      {review.status === 'paused' && <p className="text-sm">Esta publicación está pausada en ML. Al importar, quedará publicada en Haize.</p>}
      <div className="flex gap-3 overflow-x-auto pb-2">{[review.imageUrl, ...review.additionalImages.map((image) => image.url)].map((url) => <img key={url} src={url} alt="Foto del producto" className="w-24 h-24 object-contain border rounded" />)}</div>
      <label className="block text-sm">Título<input required minLength={10} maxLength={150} value={review.title} onChange={(event) => change('title', event.target.value)} className={inputClass} /></label>
      <label className="block text-sm">Descripción<textarea rows={5} value={review.description} onChange={(event) => change('description', event.target.value)} className={inputClass} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">Precio en Haize (ARS)<input required type="number" min="0.01" max="1000000" step="0.01" value={review.salePrice} onChange={(event) => change('salePrice', event.target.value)} className={inputClass} /></label>
        <label className="block text-sm">Categoría en Haize<select required value={review.category} onChange={(event) => change('category', event.target.value)} className={inputClass}><option value="">Seleccionar categoría</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={review.featured} onChange={(event) => change('featured', event.target.checked)} />Producto destacado</label>
      <div className="border rounded p-3 text-sm"><p className="font-medium mb-2">Variantes y stock: {review.stock} unidades</p>{review.variants.map((variant) => <p key={variant.sku}>{variant.color} / {variant.size}: {variant.stock}</p>)}</div>
      <p className="text-sm text-gray-600">Podés completar la guía de talles después desde Editar producto. El precio de ML no se modifica.</p>
      <div className="flex gap-3"><button disabled={busy} type="submit" className="bg-black text-white rounded px-4 py-2 disabled:opacity-50">Importar a Haize</button><button disabled={busy} type="button" onClick={() => { setReview(null); setError(''); }} className="border rounded px-4 py-2">Cancelar</button></div>
    </form>}
    {!review && queue.length > 0 && <button disabled={busy} onClick={() => preview(queue)} className="border rounded px-4 py-2">Revisar siguiente ({queue.length} pendientes)</button>}
  </section>;
}
