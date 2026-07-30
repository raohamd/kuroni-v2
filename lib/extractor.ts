import crypto from 'crypto';

/**
 * OpenSSL EVP_BytesToKey derivation logic (PBKDF1 variant).
 * Derives Key and IV from password and salt for AES-256-CBC decryption.
 */
function evpBytesToKey(password: Buffer, salt: Buffer, keyLen: number, ivLen: number) {
  let derivedBytes = Buffer.alloc(0);
  let block = Buffer.alloc(0);

  while (derivedBytes.length < keyLen + ivLen) {
    const hasher = crypto.createHash('md5');
    hasher.update(block);
    hasher.update(password);
    hasher.update(salt);
    block = hasher.digest();
    derivedBytes = Buffer.concat([derivedBytes, block]);
  }

  const key = derivedBytes.subarray(0, keyLen);
  const iv = derivedBytes.subarray(keyLen, keyLen + ivLen);
  return { key, iv };
}

/**
 * Decrypts OpenSSL "Salted__" AES-256-CBC base64 encrypted payloads.
 */
export function decryptSource(encryptedBase64: string, secretKey: string): string {
  try {
    const buffer = Buffer.from(encryptedBase64, 'base64');
    const saltedHeader = buffer.subarray(0, 8).toString('utf-8');

    if (saltedHeader !== 'Salted__') {
      throw new Error('Invalid encrypted payload: missing OpenSSL Salted__ header');
    }

    const salt = buffer.subarray(8, 16);
    const ciphertext = buffer.subarray(16);

    const { key, iv } = evpBytesToKey(Buffer.from(secretKey, 'utf-8'), salt, 32, 16);

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf-8');
  } catch (error) {
    console.error('[Extractor Error] Failed to decrypt encrypted source stream payload:', error);
    throw new Error('Payload decryption failed');
  }
}