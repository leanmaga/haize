'use client';
import { useState } from 'react';
export default function AddCategory({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar.');
      window.dispatchEvent(new CustomEvent('haize:categories', { detail: data.category }));
      onCreated?.(data.category.slug); setName(''); setOpen(false);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <div className="mt-3">
    {!open ? <button type="button" onClick={() => setOpen(true)} className="text-sm underline">Agregar nueva categoría</button> :
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-sm">Nueva categoría<input autoFocus maxLength={60} value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); save(); } }} className="mt-1 block rounded border px-3 py-2" /></label>
        <button type="button" disabled={busy || name.trim().length < 2} onClick={save} className="rounded bg-black px-3 py-2 text-white disabled:opacity-50">{busy ? 'Guardando…' : 'Agregar'}</button>
        <button type="button" disabled={busy} onClick={() => { setOpen(false); setError(''); }} className="px-3 py-2">Cancelar</button>
      </div>}
    {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
  </div>;
}
