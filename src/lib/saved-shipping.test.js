import { rememberShipping, shippingForAccount } from './saved-shipping';

const info = { name: 'Cliente', email: 'cliente@example.com', phone: '123', street: 'Calle 9', streetNumber: '123A', city: 'Morón', postalCode: '1708' };

test('stores delivery data in the account when requested', async () => {
  const user = { save: jest.fn().mockResolvedValue(undefined) };
  await rememberShipping(user, { saveShippingInfo: true, shippingInfo: info });
  expect(user.savedShippingInfo).toEqual({ ...info, address: 'Calle 9 123A' });
  expect(user.save).toHaveBeenCalledTimes(1);
});
test.each([false, undefined, 'true'])('temporary delivery preserves saved account information (%s)', async (saveShippingInfo) => {
  const previous = { ...info };
  const user = { savedShippingInfo: previous, save: jest.fn() };
  await rememberShipping(user, { saveShippingInfo, shippingInfo: { ...info, street: 'Otra calle' } });
  expect(user.savedShippingInfo).toBe(previous);
  expect(user.save).not.toHaveBeenCalled();
});
test('updating the habitual address does not mutate order snapshots', async () => {
  const user = { save: jest.fn().mockResolvedValue(undefined), savedShippingInfo: { ...info } };
  const originalOrder = { ...info };
  const nextOrder = { ...info, street: 'Nueva calle' };
  await rememberShipping(user, { saveShippingInfo: true, shippingInfo: nextOrder });
  expect(user.savedShippingInfo.street).toBe('Nueva calle');
  expect(originalOrder.street).toBe('Calle 9');
  expect(nextOrder).not.toHaveProperty('address');
});
test('normalizes mongoose snapshots and excludes unrelated fields', () => {
  const result = shippingForAccount({ toObject: () => ({ ...info, role: 'admin', password: 'do-not-store' }) });
  expect(result.name).toBe('Cliente');
  expect(result).not.toHaveProperty('role');
  expect(result).not.toHaveProperty('password');
});
