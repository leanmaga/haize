import { normalizeShippingAddress } from './shipping-address';

test.each([undefined, '', '   '])('rejects a missing house number (%s)', (streetNumber) => {
  expect(() => normalizeShippingAddress({ street: 'Rivadavia', streetNumber })).toThrow('El número de la casa es obligatorio');
});
test('does not accept the old combined address in place of the required number', () => {
  expect(() => normalizeShippingAddress({ address: 'Rivadavia 123' })).toThrow();
});
test.each(['abc', 'S/N', '-1', '1.5'])('rejects invalid house number %s', (streetNumber) => {
  expect(() => normalizeShippingAddress({ street: 'Calle 9', streetNumber })).toThrow();
});
test.each(['123', '123A', '0012'])('preserves the complete address and the number %s', (streetNumber) => {
  expect(normalizeShippingAddress({ street: ' Calle 9 ', streetNumber: ' ' + streetNumber + ' ', city: 'Morón' })).toEqual({
    street: 'Calle 9', streetNumber, address: 'Calle 9 ' + streetNumber, city: 'Morón',
  });
});
test('rejects whitespace-only street', () => {
  expect(() => normalizeShippingAddress({ street: ' ', streetNumber: '123' })).toThrow('La calle es obligatoria');
});
