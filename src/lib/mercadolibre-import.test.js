import { mapMercadoLibreItem, applyImportEdits } from './mercadolibre-import';

export const item = {
  id: 'MLA12345', seller_id: 42, title: 'Remera de algodón', currency_id: 'ARS',
  status: 'active', price: 10000, available_quantity: 5,
  pictures: [{ id: 'photo', secure_url: 'https://http2.mlstatic.com/photo.jpg' }],
  attributes: [{ id: 'COLOR', value_name: 'Negro' }],
};
test('maps a single listing into an editable variant and remote inventory link', () => {
  const product = mapMercadoLibreItem(item, 'Descripción importada de Mercado Libre');
  expect(product.stock).toBe(5);
  expect(product.variants[0]).toMatchObject({ size: 'Único', color: 'Negro', stock: 5 });
  expect(product.mercadoLibre).toMatchObject({ itemId: item.id, variationMappings: [] });
  expect(product.description).toBe('Descripción importada de Mercado Libre');
});
test('preserves zero stock and maps each remote variation separately', () => {
  const product = mapMercadoLibreItem({ ...item, variations: [
    { id: 1, available_quantity: 0, attribute_combinations: [{ id: 'SIZE', value_name: 'M' }], picture_ids: ['photo'] },
    { id: 2, available_quantity: 3, attribute_combinations: [{ id: 'SIZE', value_name: 'L' }] },
  ] });
  expect(product.stock).toBe(3);
  expect(product.variants.map((variant) => variant.stock)).toEqual([0, 3]);
  expect(product.mercadoLibre.variationMappings[1]).toMatchObject({ variationId: '2', sku: product.variants[1].sku });
});
test.each([
  { currency_id: 'USD' }, { shipping: { logistic_type: 'fulfillment' } },
  { stock_locations: [{}] }, { available_quantity: undefined }, { pictures: [] },
  { variations: [{ id: 1, available_quantity: 1 }, { id: 2, available_quantity: 1 }] },
])('rejects stock and variants that cannot safely map to Haize: %j', (override) => {
  expect(() => mapMercadoLibreItem({ ...item, ...override })).toThrow();
});
test('only allows reviewed fields, never browser supplied stock or links', () => {
  const product = applyImportEdits(mapMercadoLibreItem(item), { title: 'Título editado', description: '', salePrice: '12000', category: 'remeras', stock: 999, mercadoLibre: { itemId: 'MLA999' } });
  expect(product).toMatchObject({ title: 'Título editado', salePrice: 12000, stock: 5, mercadoLibre: { itemId: 'MLA12345' } });
  expect(() => applyImportEdits(product, { title: 'Título editado', salePrice: -1 })).toThrow();
});
