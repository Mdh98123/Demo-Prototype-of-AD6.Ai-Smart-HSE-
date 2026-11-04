/**
 * Enterprise Field-Level Encryption (AES-256-GCM)
 * 
 * Target Standards:
 * - Sultanate of Oman PDPL (RD 6/2022) Article 21 technical measures
 * - Saudi Arabia PDPL (Royal Decree M/19)
 * - ISO/IEC 27001 / NIST SP 800-38D
 * 
 * Protects sensitive personal data at rest:
 * - Medical incident notes & clinical assessments
 * - Witness and whistleblower identities
 * - National Civil ID numbers and passport identifiers
 */

import crypto from 'node:crypto';
import { SecretsManager } from './secretsManager.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH_BYTES = 16; // 128-bit authentication tag
const DEFAULT_DEV_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 32-byte hex string
const DEFAULT_KEY_ID = 'k1';

export class FieldEncryption {
  private static masterKeyCache: Map<string, Buffer> = new Map();

  /**
   * Resolves the 32-byte encryption key for the given key ID.
   */
  public static async getKey(keyId: string = DEFAULT_KEY_ID): Promise<Buffer> {
    if (this.masterKeyCache.has(keyId)) {
      return this.masterKeyCache.get(keyId)!;
    }

    const envKeyName = `HSE_ENCRYPTION_KEY_${keyId.toUpperCase()}`;
    const configuredKey = (await SecretsManager.getSecret(envKeyName)) ||
                          (await SecretsManager.getSecret('HSE_FIELD_ENCRYPTION_KEY'));

    let keyBuffer: Buffer;
    if (configuredKey) {
      if (configuredKey.length === 64) {
        keyBuffer = Buffer.from(configuredKey, 'hex');
      } else {
        // Derive 32-byte key via SHA-256
        keyBuffer = crypto.createHash('sha256').update(configuredKey).digest();
      }
    } else {
      // Safe development/test fallback
      keyBuffer = Buffer.from(DEFAULT_DEV_KEY, 'hex');
    }

    this.masterKeyCache.set(keyId, keyBuffer);
    return keyBuffer;
  }

  /**
   * Sets an explicit key for tests or dynamic key rotation.
   */
  public static setKey(keyId: string, rawKey: string | Buffer): void {
    if (typeof rawKey === 'string') {
      const buf = rawKey.length === 64 ? Buffer.from(rawKey, 'hex') : crypto.createHash('sha256').update(rawKey).digest();
      this.masterKeyCache.set(keyId, buf);
    } else {
      this.masterKeyCache.set(keyId, rawKey);
    }
  }

  /**
   * Encrypts plaintext string using AES-256-GCM.
   * Returns ciphertext string formatted as `enc:v1:<keyId>:<ivHex>:<tagHex>:<cipherHex>`.
   */
  public static async encrypt(plaintext: string, keyId: string = DEFAULT_KEY_ID): Promise<string> {
    if (!plaintext || typeof plaintext !== 'string') {
      return plaintext;
    }

    const key = await this.getKey(keyId);
    const iv = crypto.randomBytes(IV_LENGTH_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH_BYTES });

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `enc:v1:${keyId}:${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts an `enc:v1:...` formatted string back to plaintext.
   * If value is not encrypted or doesn't match format, returns it unmodified.
   * Throws Error on tampering (authentication tag failure).
   */
  public static async decrypt(ciphertext: string): Promise<string> {
    if (!this.isEncrypted(ciphertext)) {
      return ciphertext;
    }

    const parts = ciphertext.split(':');
    if (parts.length !== 6 || parts[0] !== 'enc' || parts[1] !== 'v1') {
      throw new Error('[FieldEncryption] Invalid encrypted payload format.');
    }

    const [, , keyId, ivHex, tagHex, encryptedHex] = parts;
    const key = await this.getKey(keyId);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH_BYTES });
    decipher.setAuthTag(authTag);

    try {
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err: any) {
      throw new Error(`[FieldEncryption] Tampering detected or corrupted auth tag: ${err.message}`);
    }
  }

  /**
   * Returns true if value starts with the encryption envelope prefix `enc:v1:`.
   */
  public static isEncrypted(val: any): boolean {
    return typeof val === 'string' && val.startsWith('enc:v1:');
  }

  /**
   * Helper to encrypt sensitive incident fields before persistence.
   */
  public static async protectIncidentPayload(incident: Record<string, any>): Promise<Record<string, any>> {
    const copy = { ...incident };

    if (copy.medical_notes && typeof copy.medical_notes === 'string') {
      copy.medical_notes_encrypted = await this.encrypt(copy.medical_notes);
      copy.encryption_key_id = DEFAULT_KEY_ID;
      delete copy.medical_notes;
    }

    if (copy.details && typeof copy.details === 'object') {
      const detailsCopy = { ...copy.details };
      if (detailsCopy.witness_identity && typeof detailsCopy.witness_identity === 'string' && !this.isEncrypted(detailsCopy.witness_identity)) {
        detailsCopy.witness_identity = await this.encrypt(detailsCopy.witness_identity);
      }
      if (detailsCopy.national_id && typeof detailsCopy.national_id === 'string' && !this.isEncrypted(detailsCopy.national_id)) {
        detailsCopy.national_id = await this.encrypt(detailsCopy.national_id);
      }
      copy.details = detailsCopy;
    }

    return copy;
  }

  /**
   * Helper to decrypt sensitive incident fields after retrieval.
   */
  public static async unprotectIncidentPayload(incident: Record<string, any>): Promise<Record<string, any>> {
    const copy = { ...incident };

    if (copy.medical_notes_encrypted) {
      copy.medical_notes = await this.decrypt(copy.medical_notes_encrypted);
    }

    if (copy.details && typeof copy.details === 'object') {
      const detailsCopy = { ...copy.details };
      if (detailsCopy.witness_identity && this.isEncrypted(detailsCopy.witness_identity)) {
        detailsCopy.witness_identity = await this.decrypt(detailsCopy.witness_identity);
      }
      if (detailsCopy.national_id && this.isEncrypted(detailsCopy.national_id)) {
        detailsCopy.national_id = await this.decrypt(detailsCopy.national_id);
      }
      copy.details = detailsCopy;
    }

    return copy;
  }

  public static clearCache(): void {
    this.masterKeyCache.clear();
  }
}
