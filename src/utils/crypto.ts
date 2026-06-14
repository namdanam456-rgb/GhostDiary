// src/utils/crypto.ts

// Web Crypto API utility for strong AES-256-GCM encryption
// Used to encrypt diary entries before saving to local IndexedDB

const ITERATIONS = 100000;
const SALT_SIZE = 16;
const IV_SIZE = 12;

/**
 * Derives a strong Key Encryption Key (KEK) from a password using PBKDF2.
 */
export async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // Do not make the key extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a string using a given AES-GCM CryptoKey.
 * Returns a base64 encoded string containing the IV and the cipher text.
 */
export async function encryptData(text: string, key: CryptoKey): Promise<string> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));
  const encodedText = enc.encode(text);

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedText
  );

  const cipherArray = Array.from(new Uint8Array(cipherBuffer));
  const ivArray = Array.from(iv);
  
  // Combine IV and CipherText
  const combined = new Uint8Array(ivArray.length + cipherArray.length);
  combined.set(ivArray);
  combined.set(cipherArray, ivArray.length);

  // Convert to base64 for easy storage in JSON/IndexedDB
  return btoa(String.fromCharCode.apply(null, combined as unknown as number[]));
}

/**
 * Decrypts a base64 string (containing IV + CipherText) back to plain text.
 */
export async function decryptData(encryptedBase64: string, key: CryptoKey): Promise<string> {
  const binaryStr = atob(encryptedBase64);
  const combined = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    combined[i] = binaryStr.charCodeAt(i);
  }

  const iv = combined.slice(0, IV_SIZE);
  const data = combined.slice(IV_SIZE);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/**
 * Generates a random salt for a new user vault.
 */
export function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
}

export function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, buffer as unknown as number[]));
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}
