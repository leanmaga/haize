'use client';
import { useEffect, useState } from 'react';
import { DEFAULT_CATEGORIES } from '@/lib/category-options';

export default function useCategories() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch('/api/categories', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('No se pudieron cargar las categorías.');
        const data = await response.json();
        if (!controller.signal.aborted) { setCategories(data.categories); setError(''); }
      } catch (err) { if (err.name !== 'AbortError') setError(err.message); }
    };
    load();
    const update = (event) => {
      if (event.detail) setCategories((current) => [...current.filter((item) => item.slug !== event.detail.slug), event.detail]);
      else load();
    };
    window.addEventListener('haize:categories', update);
    window.addEventListener('focus', load);
    return () => { controller.abort(); window.removeEventListener('haize:categories', update); window.removeEventListener('focus', load); };
  }, []);
  return { categories, error };
}
