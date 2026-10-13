jest.mock('@/models/DeliveryZone', () => ({ __esModule: true, default: {} }));
import { calculateShipping } from './shipping-pricing';

const zones = [
  { _id: 'moron', municipalityId: '060568', name: 'Morón', shippingPrice: 0 },
  { _id: 'merlo', municipalityId: '060539', name: 'Merlo', shippingPrice: 2500 },
];
const ZoneModel = { find: jest.fn(async () => zones) };
const catalog = [
  { id: '060568', name: 'Morón', province: 'Buenos Aires' },
  { id: '060539', name: 'Merlo', province: 'Buenos Aires' },
  { id: '060427', name: 'La Matanza', province: 'Buenos Aires' },
  { id: '060441', name: 'La Plata', province: 'Buenos Aires' },
];
const loadCatalog = async () => catalog;

test('uses only active configured municipality tariffs, including free delivery', async () => {
  expect(await calculateShipping('  MORON ', ZoneModel, undefined, loadCatalog)).toEqual({ shippingCost: 0, deliveryZone: 'moron', quoted: true, municipalityId: '060568', city: 'Morón' });
  expect(await calculateShipping('Merlo', ZoneModel, '060539', loadCatalog)).toEqual({ shippingCost: 2500, deliveryZone: 'merlo', quoted: true, municipalityId: '060539', city: 'Merlo' });
  expect(ZoneModel.find).toHaveBeenCalledWith({ isActive: true });
});

test('reads tariffs already stored with five-digit IGN municipality IDs', async () => {
  const legacyZones = { find: async () => [
    { _id: 'matanza', municipalityId: '06427', name: 'La Matanza', shippingPrice: 3800 },
    { _id: 'moron', municipalityId: '06568', name: 'Morón', shippingPrice: 0 },
  ] };
  expect(await calculateShipping('La Matanza', legacyZones, '060427', loadCatalog)).toMatchObject({ shippingCost: 3800, quoted: true, deliveryZone: 'matanza' });
  expect(await calculateShipping('Morón', legacyZones, '060568', loadCatalog)).toMatchObject({ shippingCost: 0, quoted: true, deliveryZone: 'moron' });
});

test('unpriced official municipalities are coordinated; typos and mismatched IDs cannot pay', async () => {
  expect(await calculateShipping('La Plata', ZoneModel, undefined, loadCatalog)).toEqual({ shippingCost: 0, deliveryZone: null, quoted: false, municipalityId: '060441', city: 'La Plata' });
  expect(await calculateShipping('La Matanza', { find: async () => [{ _id: 'matanza', municipalityId: '060427', name: 'La Matanza', shippingPrice: null }] }, undefined, loadCatalog)).toMatchObject({ shippingCost: 0, quoted: false });
  await expect(calculateShipping('La Mattanza', ZoneModel, undefined, loadCatalog)).rejects.toThrow('municipio válido');
  await expect(calculateShipping('Morón', ZoneModel, '060539', loadCatalog)).rejects.toThrow('municipio válido');
  await expect(calculateShipping('Morón', { find: async () => [...zones, zones[0]] }, undefined, loadCatalog)).rejects.toThrow('varias zonas');
});

const loadLocalities = async () => [{ id: 'haedo', name: 'Haedo' }, { id: 'palomar', name: 'El Palomar' }, { id: 'unknown', name: 'Zona no listada' }];
const localQuote = (price, localityId = 'haedo') => calculateShipping('Morón', { find: async () => [{ ...zones[0], shippingPrice: price }] }, '060568', loadCatalog, localityId, loadLocalities);

test('seller-paid zero is distinct from an empty rate', async () => {
  expect(await localQuote(0)).toMatchObject({ shippingCost: 0, quoted: true, locality: 'Haedo', localityId: 'haedo' });
  expect(await localQuote(0, 'unknown')).toMatchObject({ shippingCost: 0, quoted: true });
  expect(await localQuote(null)).toMatchObject({ shippingCost: 0, quoted: false });
  expect(await localQuote(undefined)).toMatchObject({ shippingCost: 0, quoted: false });
});

test('uses locality prices and coordinates unlisted destinations', async () => {
  expect(await localQuote(7000)).toMatchObject({ shippingCost: 7000, quoted: true });
  expect(await localQuote(7000, 'palomar')).toMatchObject({ shippingCost: 7500, quoted: true });
  expect(await localQuote(7000, 'unknown')).toMatchObject({ shippingCost: 0, quoted: false });
  expect(await calculateShipping('Morón', { find: async () => [] }, '060568', loadCatalog, 'haedo', loadLocalities)).toMatchObject({ shippingCost: 0, quoted: false });
});

test('rejects a locality from another municipality instead of accepting a client price', async () => {
  await expect(localQuote(7000, 'another-municipality-id')).rejects.toThrow('localidad válida');
});

test('partial coverage requires coordination even with a municipality tariff', async () => {
  const quote = await calculateShipping('La Matanza', { find: async () => [{ name: 'La Matanza', municipalityId: '060427', shippingPrice: 7500 }] }, '060427', loadCatalog, 'virrey', async () => [{ id: 'virrey', name: 'Virrey del Pino' }]);
  expect(quote).toMatchObject({ quoted: false, shippingCost: 0 });
  expect(quote.note).toContain('km 40');
});
