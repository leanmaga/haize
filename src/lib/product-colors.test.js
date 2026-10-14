import { availableProductColors, productColors, normalizeHex } from './product-colors';
test('shows only colors from published products and deduplicates names', () => {
  expect(availableProductColors([])).toEqual([]);
  expect(availableProductColors([
    { variants: [{ color: 'Azul', colorHex: '#0000FF' }] },
    { variants: [{ color: ' azul ', colorHex: '#0000FF' }, { color: 'Amarillo', colorHex: '#FFFF00' }] },
    { isActive: false, colors: ['Rojo'] }, { isComplete: false, colors: ['Verde'] },
  ])).toEqual([{ name: 'Amarillo', hex: '#FFFF00' }, { name: 'Azul', hex: '#0000FF' }]);
});
test('supports legacy colors and preserves custom tones', () => {
  expect(productColors({ colors: ['Azul', { name: 'Petróleo', hexCode: '#123456' }] })).toEqual([{ name: 'Azul', hex: '#0000FF' }, { name: 'Petróleo', hex: '#123456' }]);
  expect(productColors({ colors: ['Viejo'], variants: [{ color: 'Petróleo', colorHex: '#123456' }] })).toEqual([{ name: 'Petróleo', hex: '#123456' }]);
  expect(normalizeHex('abc')).toBe('#AABBCC');
  expect(normalizeHex('zzzzzz')).toBeNull();
});
