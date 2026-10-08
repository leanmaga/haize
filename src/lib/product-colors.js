export const DEFAULT_COLORS = [
  ['Amarillo', '#FFFF00'], ['Azul', '#0000FF'], ['Beige', '#F5F5DC'],
  ['Blanco', '#FFFFFF'], ['Bordó', '#800020'], ['Celeste', '#87CEEB'],
  ['Gris', '#808080'], ['Marrón', '#8B4513'], ['Naranja', '#FFA500'],
  ['Negro', '#000000'], ['Rojo', '#FF0000'], ['Rosa', '#FFC0CB'],
  ['Verde', '#008000'], ['Violeta', '#800080'],
].map(([name, hex]) => ({ name, hex }));

export const colorKey = (name) => String(name || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function normalizeHex(value) {
  const hex = String(value || '').trim().replace(/^#/, '');
  if (/^[\da-f]{3}$/i.test(hex)) return `#${hex.split('').map((letter) => letter + letter).join('').toUpperCase()}`;
  return /^[\da-f]{6}$/i.test(hex) ? `#${hex.toUpperCase()}` : null;
}
export function colorHex(name, stored) {
  return normalizeHex(stored) || DEFAULT_COLORS.find((color) => colorKey(color.name) === colorKey(name))?.hex || normalizeHex(name) || '#808080';
}
export function productColors(product) {
  const source = product.variants?.length
    ? product.variants.map((variant) => ({ name: variant.color, hex: variant.colorHex }))
    : (product.colors || []).map((color) => typeof color === 'string' ? { name: color } : { name: color.name, hex: color.hexCode || color.hex });
  return source.filter((color) => color.name?.trim() && colorKey(color.name) !== 'sin color')
    .map((color) => ({ name: color.name.trim(), hex: colorHex(color.name, color.hex) }));
}
export function availableProductColors(products) {
  const colors = new Map();
  products.filter((product) => product.isActive !== false && product.isComplete !== false).forEach((product) => {
    productColors(product).forEach((color) => {
      if (!colors.has(colorKey(color.name))) colors.set(colorKey(color.name), color);
    });
  });
  return [...colors.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}
