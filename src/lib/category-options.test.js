import { categoryInput, DEFAULT_CATEGORIES } from './category-options';
test('normalizes names for duplicate detection without losing the display name', () => {
  expect(categoryInput('  Búzos   de Abrigo ')).toEqual({ name: 'Búzos de Abrigo', slug: 'buzos-de-abrigo' });
  expect(categoryInput('BUZOS DE ABRIGO').slug).toBe('buzos-de-abrigo');
});
test.each(['', ' ', 'A', '💥💥', 'all', 'Todos', 'Nuevos Ingresos', 'a'.repeat(61), null])('rejects invalid or reserved name %s', (value) => {
  expect(() => categoryInput(value)).toThrow();
});
test('retains all six existing categories', () => {
  expect(DEFAULT_CATEGORIES.map((item) => item.slug)).toEqual(['remeras', 'camisas', 'pantalones', 'shorts', 'musculosas', 'conjuntos']);
});
