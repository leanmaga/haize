import { mergeCoverage, zonePayload } from './delivery-coverage';

const geometry = { type: 'Polygon', coordinates: [[[-58.7, -34.6], [-58.6, -34.6], [-58.6, -34.7], [-58.7, -34.6]]] };
const catalog = ['Morón', 'Merlo'].map((nombre, i) => ({ type: 'Feature', id: String(i), properties: { nombre }, geometry }));
const payload = { name: 'Morón', slug: 'moron', geometry, isActive: true, shippingPrice: 0, cutoffTime: '11:00' };

test('preserves both selected municipalities, zero price and paid delivery', () => {
  const result = mergeCoverage(catalog, [
    { _id: 'a', slug: 'moron', isActive: true, shippingPrice: 0 },
    { _id: 'b', slug: 'merlo', isActive: true, shippingPrice: 2500 },
  ]);
  expect(result).toHaveLength(2);
  expect(result.map((f) => f.properties.isActive)).toEqual([true, true]);
  expect(result.map((f) => f.properties.shippingPrice)).toEqual([0, 2500]);
});
test('inactive zones remain outlined and legacy geometry is replaced by official geometry', () => {
  const result = mergeCoverage(catalog, [{ _id: 'a', slug: 'moron', isActive: false, geometry: { type: 'Polygon', coordinates: [] } }]);
  expect(result[0].geometry).toEqual(geometry);
  expect(result[0].properties.isActive).toBe(false);
  expect(result[0].properties.shippingPrice).toBeNull();
});
test('accepts explicit free shipping and strips unapproved fields', () => {
  expect(zonePayload({ ...payload, _id: 'injected' })).toMatchObject({ shippingPrice: 0 });
  expect(zonePayload({ ...payload, _id: 'injected' })).not.toHaveProperty('_id');
});
test.each([-1, NaN, Infinity, null, '', '0', 1.234])('rejects invalid price %s', (shippingPrice) => {
  expect(() => zonePayload({ ...payload, shippingPrice })).toThrow();
});
test('rejects invalid cutoff and state', () => {
  expect(() => zonePayload({ ...payload, cutoffTime: '25:00' })).toThrow();
  expect(() => zonePayload({ ...payload, isActive: 'false' })).toThrow();
});
test('allows deactivating a legacy zone without inventing a free tariff', () => {
  expect(zonePayload({ ...payload, isActive: false, shippingPrice: null }).shippingPrice).toBeNull();
  expect(zonePayload({ ...payload, shippingPrice: 10.12 }).shippingPrice).toBe(10.12);
});
