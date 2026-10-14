import { resolveGoogleAddress } from './resolve-google-address';
import { getMunicipalities } from './municipalities';
import { getLocalities } from './localities';
jest.mock('./municipalities', () => ({ ...jest.requireActual('./municipalities'), getMunicipalities: jest.fn() }));
jest.mock('./localities', () => ({ getLocalities: jest.fn() }));

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ubicacion: { provincia: { id: '06' }, municipio: { id: '060357' } } }) });
  getMunicipalities.mockResolvedValue([{ id: '060357', name: 'General Pueyrredón', province: 'Buenos Aires' }]);
  getLocalities.mockResolvedValue([{ id: '0635701000', name: 'Mar del Plata' }]);
});
test('resolves a city with a different municipality name by coordinates', async () => {
  await expect(resolveGoogleAddress({ lat: -38, lng: -57.55, localityNames: ['Mar del Plata'] })).resolves.toMatchObject({ city: 'General Pueyrredón', localityId: '0635701000' });
});
test('does not pick a locality from an ambiguous or unmatched name', async () => {
  await expect(resolveGoogleAddress({ lat: -38, lng: -57.55, localityNames: ['Otra localidad'] })).resolves.toMatchObject({ localityId: '' });
  getLocalities.mockResolvedValue([{ id: '1', name: 'Centro' }, { id: '2', name: 'Puerto' }]);
  await expect(resolveGoogleAddress({ lat: -38, lng: -57.55, localityNames: ['Centro', 'Puerto'] })).resolves.toMatchObject({ localityId: '' });
});
test('rejects missing coordinates without making an upstream request', async () => {
  await expect(resolveGoogleAddress({ lat: null, lng: -57, localityNames: [] })).rejects.toThrow();
  expect(global.fetch).not.toHaveBeenCalled();
});
