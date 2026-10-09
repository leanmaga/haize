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

test('unpriced official municipalities are coordinated; typos and mismatched IDs cannot pay', async () => {
  expect(await calculateShipping('La Plata', ZoneModel, undefined, loadCatalog)).toEqual({ shippingCost: 0, deliveryZone: null, quoted: false, municipalityId: '060441', city: 'La Plata' });
  expect(await calculateShipping('La Matanza', { find: async () => [{ _id: 'matanza', municipalityId: '060427', name: 'La Matanza', shippingPrice: null }] }, undefined, loadCatalog)).toMatchObject({ shippingCost: 0, quoted: false });
  await expect(calculateShipping('La Mattanza', ZoneModel, undefined, loadCatalog)).rejects.toThrow('municipio válido');
  await expect(calculateShipping('Morón', ZoneModel, '060539', loadCatalog)).rejects.toThrow('municipio válido');
  await expect(calculateShipping('Morón', { find: async () => [...zones, zones[0]] }, undefined, loadCatalog)).rejects.toThrow('varias zonas');
});
