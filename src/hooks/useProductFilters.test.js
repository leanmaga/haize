import { act, renderHook } from '@testing-library/react';
import { useProductFilters } from './useProductFilters';

test('filters modern and legacy products by one or several colors', () => {
  const products = [
    { title: 'Remera', salePrice: 100, variants: [{ color: 'Azul', size: 'M' }] },
    { title: 'Buzo', salePrice: 100, variants: [{ color: 'Amarillo', size: 'L' }] },
    { title: 'Camisa', salePrice: 100, colors: ['Azul petróleo'] },
  ];
  const { result } = renderHook(() => useProductFilters(products));
  act(() => result.current.setFilters((filters) => ({ ...filters, colors: ['azul'] })));
  expect(result.current.filteredProducts.map((product) => product.title)).toEqual(['Remera']);
  act(() => result.current.setFilters((filters) => ({ ...filters, colors: ['Azul', 'Amarillo'] })));
  expect(result.current.filteredProducts.map((product) => product.title)).toEqual(['Remera', 'Buzo']);
  act(() => result.current.setFilters((filters) => ({ ...filters, colors: ['Azul petróleo'] })));
  expect(result.current.filteredProducts.map((product) => product.title)).toEqual(['Camisa']);
});
