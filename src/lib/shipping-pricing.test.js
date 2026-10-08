jest.mock('@/models/DeliveryZone', () => ({ __esModule: true, default: {} }));
import { calculateShipping } from './shipping-pricing';

const zones = [
  { _id: 'moron', name: 'Morón', shippingPrice: 0 },
  { _id: 'merlo', name: 'Merlo', shippingPrice: 2500 },
];
const ZoneModel = { find: jest.fn(async () => zones) };

test('uses only active configured municipality tariffs, including free delivery', async () => {
  expect(await calculateShipping('  MORON ', ZoneModel)).toEqual({ shippingCost: 0, deliveryZone: 'moron', quoted: true });
  expect(await calculateShipping('Merlo', ZoneModel)).toEqual({ shippingCost: 2500, deliveryZone: 'merlo', quoted: true });
  expect(ZoneModel.find).toHaveBeenCalledWith({ isActive: true });
});

test('leaves unmatched cities unquoted and rejects ambiguous or invalid tariffs', async () => {
  expect(await calculateShipping('La Plata', ZoneModel)).toEqual({ shippingCost: 0, deliveryZone: null, quoted: false });
  await expect(calculateShipping('Morón', { find: async () => [...zones, zones[0]] })).rejects.toThrow('varias zonas');
  await expect(calculateShipping('Merlo', { find: async () => [{ name: 'Merlo', shippingPrice: null }] })).rejects.toThrow('tarifa');
});
