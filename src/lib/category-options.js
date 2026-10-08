export const DEFAULT_CATEGORIES = ['Remeras', 'Camisas', 'Pantalones', 'Shorts', 'Musculosas', 'Conjuntos'].map((name) => ({ name, slug: name.toLowerCase() }));
export function categoryInput(value) {
  if (typeof value !== 'string') throw new Error('Ingresá el nombre de la categoría.');
  const name = value.trim().replace(/\s+/g, ' ');
  const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (name.length < 2 || name.length > 60 || !slug) throw new Error('El nombre debe tener entre 2 y 60 caracteres.');
  if (['all', 'todos', 'nuevos-ingresos', 'verano-2026', 'tiempo-lino', 'sets-regalo', 'tarjetas-regalo'].includes(slug)) throw new Error('Ese nombre está reservado para el menú.');
  return { name, slug };
}
