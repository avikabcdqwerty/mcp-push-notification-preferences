import crypto from 'crypto';

/**
 * Utility functions for encrypting and decrypting notification preferences.
 * Uses AES-256-GCM for strong encryption.
 * In production, use a secure key management system (e.g., AWS KMS).
 */

// Encryption key and IV length
const ENCRYPTION_KEY =
  process.env.PREFERENCES_ENCRYPTION_KEY ||
  '0123456789abcdef0123456789abcdef'; // 32 bytes for AES-256
const IV_LENGTH = 12; // 12 bytes for GCM

if (ENCRYPTION_KEY.length !== 32) {
  // eslint-disable-next-line no-console
  console.warn(
    'PREFERENCES_ENCRYPTION_KEY should be 32 bytes for AES-256-GCM. Using insecure default!'
  );
}

/**
 * Encrypts a preferences object to a base64 string.
 * @param preferences Preferences object
 * @returns Encrypted string (base64)
 */
export function encryptPreferences(preferences: { [eventType: string]: boolean }): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY, 'utf8'),
    iv
  );
  const json = JSON.stringify(preferences);
  let encrypted = cipher.update(json, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();
  // Store iv + authTag + encrypted data (all base64)
  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted,
  ].join(':');
}

/**
 * Decrypts a base64 string to a preferences object.
 * @param encrypted Encrypted string (base64)
 * @returns Preferences object
 */
export function decryptPreferences(encrypted: string): { [eventType: string]: boolean } {
  const [ivB64, authTagB64, encryptedData] = encrypted.split(':');
  if (!ivB64 || !authTagB64 || !encryptedData) {
    throw new Error('Invalid encrypted preferences format.');
  }
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY, 'utf8'),
    iv
  );
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}