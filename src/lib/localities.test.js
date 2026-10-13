import { getLocalities, resolveLocality } from './localities';

test('deduplicates census localities and excludes mismatched municipalities', async () => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ cantidad: 4, total: 4, localidades: [
    { id: '06568010', nombre: 'Morón', municipio: { id: '060568' } },
    { id: '0656801004', nombre: 'Morón', municipio: { id: '060568' } },
    { id: '0656801003', nombre: 'Haedo', municipio: { id: '060568' } },
    { id: 'bad', nombre: 'Merlo', municipio: { id: '060539' } },
  ] }) }));
  expect(await getLocalities('060568')).toEqual([{ id: '0656801003', name: 'Haedo' }, { id: '0656801004', name: 'Morón' }]);
  expect(new URL(global.fetch.mock.calls[0][0]).searchParams.get('municipio')).toBe('060568');
});

test('does not silently accept incomplete catalogs or mismatched locality IDs', async () => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ cantidad: 1, total: 2, localidades: [] }) }));
  await expect(getLocalities('060568')).rejects.toThrow('incompleto');
  expect(() => resolveLocality('other', [{ id: 'haedo', name: 'Haedo' }])).toThrow('localidad válida');
});
