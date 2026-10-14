import crypto from 'crypto';
import { decryptToken, encryptToken, isEncryptedToken } from './mercadopago-token-crypto';

const originalKey = process.env.ENCRYPTION_KEY;
beforeEach(() => { process.env.ENCRYPTION_KEY = 'ab'.repeat(32); });
afterEach(() => {
  if (originalKey === undefined) delete process.env.ENCRYPTION_KEY;
  else process.env.ENCRYPTION_KEY = originalKey;
});

test.each(['APP_USR-test-secret', 'TG-refresh-secret', 'TEST-another-token'])('encrypts and recovers %s without double encryption', (token) => {
  const encrypted = encryptToken(token);
  expect(isEncryptedToken(encrypted)).toBe(true);
  expect(encrypted).not.toContain(token);
  expect(decryptToken(encrypted)).toBe(token);
  expect(encryptToken(encrypted)).toBe(encrypted);
  expect(encryptToken(token)).not.toBe(encrypted);
});

test.each([undefined, '', 'a'.repeat(32), 'z'.repeat(64)])('refuses encryption without a valid stable key (%s)', (key) => {
  if (key === undefined) delete process.env.ENCRYPTION_KEY;
  else process.env.ENCRYPTION_KEY = key;
  expect(() => encryptToken('APP_USR-test')).toThrow('ENCRYPTION_KEY');
});

test('reads the existing iv:tag:ciphertext format', () => {
  const iv = Buffer.alloc(16, 1);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);
  const content = Buffer.concat([cipher.update('APP_USR-legacy', 'utf8'), cipher.final()]);
  expect(decryptToken(`${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${content.toString('hex')}`)).toBe('APP_USR-legacy');
});

test('rejects a changed key or tampered ciphertext instead of returning it as a token', () => {
  const encrypted = encryptToken('APP_USR-secret');
  const parts = encrypted.split(':');
  parts[1] = '00'.repeat(16);
  expect(() => decryptToken(parts.join(':'))).toThrow('No se pudo descifrar');
  process.env.ENCRYPTION_KEY = 'cd'.repeat(32);
  expect(() => decryptToken(encrypted)).toThrow('No se pudo descifrar');
  expect(() => encryptToken(encrypted)).toThrow('No se pudo descifrar');
});

test('supports legacy plaintext reads and rejects malformed encrypted values', () => {
  expect(decryptToken('APP_USR-existing')).toBe('APP_USR-existing');
  expect(decryptToken('TG-existing')).toBe('TG-existing');
  expect(decryptToken(null)).toBeNull();
  expect(() => decryptToken('broken:tag:data')).toThrow('No se pudo descifrar');
});
