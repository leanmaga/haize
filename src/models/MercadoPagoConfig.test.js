/** @jest-environment-options {"customExportConditions":["node","node-addons"]} */
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const Config = require('./MercadoPagoConfig').default;
const Product = require('./Product').default;
const Coupon = require('./Coupon').default;
const { decryptToken, encryptToken, isEncryptedToken } = require('@/lib/mercadopago-token-crypto');
const originalKey = process.env.ENCRYPTION_KEY;

beforeEach(() => { process.env.ENCRYPTION_KEY = 'ab'.repeat(32); });
afterEach(() => {
  jest.restoreAllMocks();
  if (originalKey === undefined) delete process.env.ENCRYPTION_KEY;
  else process.env.ENCRYPTION_KEY = originalKey;
});

test('save encrypts both token fields before writing to MongoDB', async () => {
  const insert = jest.spyOn(Config.collection, 'insertOne').mockResolvedValue({ acknowledged: true });
  const doc = new Config({ userId: 'admin', accessToken: 'APP_USR-secret', refreshToken: 'TG-secret' });
  await doc.save();
  const stored = insert.mock.calls[0][0];
  expect(isEncryptedToken(stored.accessToken)).toBe(true);
  expect(isEncryptedToken(stored.refreshToken)).toBe(true);
  expect(doc.getDecryptedAccessToken()).toBe('APP_USR-secret');
  expect(doc.getDecryptedRefreshToken()).toBe('TG-secret');
});

test.each(['findOneAndUpdate', 'updateOne', 'updateMany'])('%s encrypts OAuth tokens before writing to MongoDB', async (operation) => {
  const write = jest.spyOn(Config.collection, operation).mockResolvedValue(null);
  await Config[operation]({ userId: 'admin' }, { $set: { accessToken: 'APP_USR-secret', refreshToken: 'TG-secret' } });
  const stored = write.mock.calls[0][1].$set;
  expect(decryptToken(stored.accessToken)).toBe('APP_USR-secret');
  expect(decryptToken(stored.refreshToken)).toBe('TG-secret');
  expect(stored.accessToken).not.toBe('APP_USR-secret');
});

test('refuses new plaintext writes with no key, but allows metadata updates', async () => {
  delete process.env.ENCRYPTION_KEY;
  const write = jest.spyOn(Config.collection, 'findOneAndUpdate').mockResolvedValue(null);
  await expect(Config.findOneAndUpdate({ userId: 'admin' }, { accessToken: 'APP_USR-secret' })).rejects.toThrow('ENCRYPTION_KEY');
  expect(write).not.toHaveBeenCalled();
  await Config.findOneAndUpdate({ userId: 'admin' }, { isActive: false });
  expect(write).toHaveBeenCalledTimes(1);
});

test('migrates existing plaintext tokens with an atomic comparison', async () => {
  const doc = Config.hydrate({ _id: '507f1f77bcf86cd799439011', userId: 'admin', isActive: true, accessToken: 'APP_USR-old', refreshToken: 'TG-old' });
  jest.spyOn(Config, 'findOne').mockReturnValue({ sort: async () => doc });
  const update = jest.spyOn(Config, 'findOneAndUpdate').mockImplementation(async (_, change) => Config.hydrate({ ...doc.toObject(), ...change.$set }));
  const result = await Config.getActiveConfig();
  expect(update.mock.calls[0][0]).toMatchObject({ _id: doc._id, isActive: true, accessToken: 'APP_USR-old', refreshToken: 'TG-old' });
  expect(isEncryptedToken(result.accessToken)).toBe(true);
  expect(result.getDecryptedAccessToken()).toBe('APP_USR-old');
});

test('does not rewrite already encrypted tokens', async () => {
  const doc = Config.hydrate({ accessToken: encryptToken('APP_USR-old'), refreshToken: encryptToken('TG-old') });
  jest.spyOn(Config, 'findOne').mockReturnValue({ sort: async () => doc });
  const update = jest.spyOn(Config, 'findOneAndUpdate');
  expect(await Config.getActiveConfig()).toBe(doc);
  expect(update).not.toHaveBeenCalled();
});

test('returns a concurrent reconnection instead of overwriting its credentials', async () => {
  const oldConfig = Config.hydrate({ accessToken: 'APP_USR-old' });
  const newConfig = Config.hydrate({ accessToken: encryptToken('APP_USR-new') });
  jest.spyOn(Config, 'findOne').mockReturnValueOnce({ sort: async () => oldConfig }).mockReturnValueOnce({ sort: async () => newConfig });
  jest.spyOn(Config, 'findOneAndUpdate').mockResolvedValue(null);
  expect(await Config.getActiveConfig()).toBe(newConfig);
});

test('keeps a legacy connection readable without a key and does not migrate it', async () => {
  delete process.env.ENCRYPTION_KEY;
  const doc = Config.hydrate({ accessToken: 'APP_USR-existing' });
  jest.spyOn(Config, 'findOne').mockReturnValue({ sort: async () => doc });
  const update = jest.spyOn(Config, 'findOneAndUpdate');
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  expect((await Config.getActiveConfig()).getDecryptedAccessToken()).toBe('APP_USR-existing');
  expect(update).not.toHaveBeenCalled();
});

test('encrypts direct OAuth upserts and setOnInsert tokens', async () => {
  const write = jest.spyOn(Config.collection, 'findOneAndUpdate').mockResolvedValue(null);
  await Config.findOneAndUpdate({ userId: 'admin' }, { accessToken: 'APP_USR-new', refreshToken: 'TG-new' }, { upsert: true, new: true });
  expect(isEncryptedToken(write.mock.calls[0][1].$set.accessToken)).toBe(true);
  await Config.findOneAndUpdate({ userId: 'other' }, { $setOnInsert: { accessToken: 'APP_USR-new', refreshToken: 'TG-new' } }, { upsert: true });
  expect(isEncryptedToken(write.mock.calls[1][1].$setOnInsert.accessToken)).toBe(true);
  expect(isEncryptedToken(write.mock.calls[1][1].$setOnInsert.refreshToken)).toBe(true);
});

test('keeps the unique SKU and coupon indexes declared only once', () => {
  const sku = Product.schema.indexes().filter(([keys]) => Object.keys(keys).length === 1 && keys.sku === 1);
  const code = Coupon.schema.indexes().filter(([keys]) => Object.keys(keys).length === 1 && keys.code === 1);
  expect(sku).toHaveLength(1);
  expect(sku[0][1]).toMatchObject({ unique: true, sparse: true });
  expect(code).toHaveLength(1);
  expect(code[0][1]).toMatchObject({ unique: true });
});
