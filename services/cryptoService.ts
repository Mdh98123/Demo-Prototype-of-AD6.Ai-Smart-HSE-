
import { Logger } from "./logger";

/**
 * 🚨 SECURITY WARNING 🚨
 * 
 * This service implements Client-Side Encryption (CSE) using the Web Crypto API.
 * 
 * IN THE CURRENT PROTOTYPE:
 * The encryption key is generated in the browser and stored in localStorage alongside the data.
 * This effectively protects against casual snooping but offers NO PROTECTION against an attacker 
 * who has local access to the device or can inject XSS.
 * 
 * FOR PRODUCTION:
 * 1. Keys must be managed by a secure backend (KMS).
 * 2. Or, derive keys from user passwords using PBKDF2/Argon2 (Zero-knowledge arch).
 * 3. Never store the raw key in localStorage.
 */

const ALGORITHM = 'AES-GCM';
const KEY_STORAGE_NAME = 'ad6_hse_master_key';

// Generate or retrieve the encryption key
const getEncryptionKey = async (): Promise<CryptoKey> => {
  let keyJwkStr = localStorage.getItem(KEY_STORAGE_NAME);
  
  if (!keyJwkStr) {
    Logger.debug("Generating new local encryption key (Dev Mode)");
    const key = await window.crypto.subtle.generateKey(
      { name: ALGORITHM, length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const exported = await window.crypto.subtle.exportKey('jwk', key);
    localStorage.setItem(KEY_STORAGE_NAME, JSON.stringify(exported));
    return key;
  }

  try {
    return await window.crypto.subtle.importKey(
      'jwk',
      JSON.parse(keyJwkStr),
      { name: ALGORITHM },
      true,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    Logger.error("Failed to import crypto key. Data may be unrecoverable.", error);
    throw new Error("Crypto System Failure");
  }
};

// Encrypt data
export const encryptData = async (data: any): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encodedData
    );

    // Combine IV and Ciphertext for storage
    const ivArray = Array.from(iv);
    const contentArray = Array.from(new Uint8Array(encryptedContent));
    
    return JSON.stringify({ iv: ivArray, content: contentArray });
  } catch (error) {
    Logger.error("Encryption Failed", error);
    throw new Error("Data protection failure");
  }
};

// Decrypt data
export const decryptData = async (cipherText: string): Promise<any> => {
  try {
    const key = await getEncryptionKey();
    const parsed = JSON.parse(cipherText);
    
    if (!parsed.iv || !parsed.content) {
        throw new Error("Invalid cipher format");
    }

    const ivArray = new Uint8Array(parsed.iv);
    const contentArray = new Uint8Array(parsed.content);

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: ALGORITHM, iv: ivArray },
      key,
      contentArray
    );

    const decoded = new TextDecoder().decode(decryptedContent);
    return JSON.parse(decoded);
  } catch (error) {
    Logger.error("Decryption Failed", error);
    return null; // Return null on failure to allow graceful fallback
  }
};
