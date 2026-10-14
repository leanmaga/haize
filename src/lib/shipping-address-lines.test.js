import { shippingAddressLines, normalizeShippingAddress } from './shipping-address';

test('both order views and copy text include all destination fields', () => {
  expect(shippingAddressLines({ address: 'Soler 1855', apartment: '2 B', locality: 'Libertad', city: 'Merlo', province: 'Buenos Aires', postalCode: '1716' }))
    .toEqual(['Soler 1855', 'Departamento: 2 B', 'Localidad: Libertad', 'Municipio: Merlo', 'Provincia: Buenos Aires', 'Código postal: 1716']);
});
test('old orders without optional fields have no empty lines and support legacy fields', () => {
  expect(shippingAddressLines({ address: 'Soler 1855', city: 'Merlo', state: 'Buenos Aires', zipCode: '1716' }))
    .toEqual(['Soler 1855', 'Municipio: Merlo', 'Provincia: Buenos Aires', 'Código postal: 1716']);
});
test('apartment is optional and validated on the server', () => {
  expect(normalizeShippingAddress({ street: 'Soler', streetNumber: '1855' }).apartment).toBe('');
  expect(() => normalizeShippingAddress({ street: 'Soler', streetNumber: '1855', apartment: 'a'.repeat(101) })).toThrow(/100/);
});
