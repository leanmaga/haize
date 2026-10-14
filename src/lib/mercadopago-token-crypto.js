import crypto from 'crypto';

function encryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!/^[a-f\d]{64}$/i.test(key || '')) {
    throw new Error('ENCRYPTION_KEY debe contener 64 caracteres hexadecimales');
  }
  return Buffer.from(key, 'hex');
}

export function isEncryptedToken(value) {
  return typeof value === 'string' && /^[a-f\d]{32}:[a-f\d]{32}:(?:[a-f\d]{2})+$/i.test(value);
}

export function decryptToken(value) {
  if (!value) return null;
  // Compatibility with legacy plaintext records; never return failed ciphertext.
  if (!value.includes(':')) return value;
  const key = encryptionKey();
  try {
    if (!isEncryptedToken(value)) throw new Error('Invalid encrypted token');
    const [iv, tag, encrypted] = value.split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]).toString('utf8');
  } catch {
    throw new Error('No se pudo descifrar el token de Mercado Pago');
  }
}

export function encryptToken(value) {
  if (!value) return value;
  if (value.includes(':')) {
    decryptToken(value);
    return value;
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`;
}
