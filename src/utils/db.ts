// src/utils/db.ts
import localforage from 'localforage';
import { encryptData, decryptData, deriveKeyFromPassword, generateSalt, bufferToBase64, base64ToBuffer } from './crypto';

// Initialize the localforage instance for our secure vault
const vaultDB = localforage.createInstance({
  name: 'GhostDiary',
  storeName: 'encrypted_vault'
});

export interface DiaryEntry {
  id: string;
  text: string;
  mood: string;
  wordCount: number;
  createdAt: number;
  unlockDate?: number;
}

export interface EncryptedPayload {
  data: string; // Base64 encrypted string
}

// In-memory key (never saved to disk directly)
let currentKey: CryptoKey | null = null;

export const isVaultConfigured = async (): Promise<boolean> => {
  const salt = await vaultDB.getItem<string>('master_salt');
  return !!salt;
};

export const setupVault = async (password: string): Promise<boolean> => {
  try {
    const salt = generateSalt();
    const saltBase64 = bufferToBase64(salt);
    const key = await deriveKeyFromPassword(password, salt);
    
    await vaultDB.setItem('master_salt', saltBase64);
    // Initialize empty entries array
    const encryptedEmpty = await encryptData(JSON.stringify([]), key);
    await vaultDB.setItem('entries', { data: encryptedEmpty });
    
    currentKey = key;

    return true;
  } catch (e) {
    console.error("Failed to setup vault", e);
    return false;
  }
};

export const unlockVault = async (password: string): Promise<boolean> => {
  try {
    const saltBase64 = await vaultDB.getItem<string>('master_salt');
    if (!saltBase64) return false;
    
    const salt = base64ToBuffer(saltBase64);
    const key = await deriveKeyFromPassword(password, salt);
    
    // Verify by trying to decrypt the entries
    const encryptedEntries = await vaultDB.getItem<EncryptedPayload>('entries');
    if (encryptedEntries) {
      await decryptData(encryptedEntries.data, key);
    }
    
    currentKey = key;

    return true;
  } catch (e) {
    console.error("Failed to unlock vault (wrong password?)", e);
    return false;
  }
};

export const lockVault = () => {
  currentKey = null;
};

export const isUnlocked = () => currentKey !== null;

export const saveEntries = async (entries: DiaryEntry[]): Promise<void> => {
  if (!currentKey) throw new Error("Vault is locked");
  const jsonStr = JSON.stringify(entries);
  const encrypted = await encryptData(jsonStr, currentKey);
  await vaultDB.setItem('entries', { data: encrypted });
};

export const getEntries = async (): Promise<DiaryEntry[]> => {
  if (!currentKey) throw new Error("Vault is locked");
  const encryptedEntries = await vaultDB.getItem<EncryptedPayload>('entries');
  if (!encryptedEntries) return [];
  
  const decryptedJson = await decryptData(encryptedEntries.data, currentKey);
  return JSON.parse(decryptedJson) as DiaryEntry[];
};

export const deleteEntry = async (id: string): Promise<void> => {
  const entries = await getEntries();
  const updatedEntries = entries.filter(e => e.id !== id);
  await saveEntries(updatedEntries);
};

// --- Export / Import Feature ---

export const exportVaultToFile = async () => {
  const salt = await vaultDB.getItem<string>('master_salt');
  const entries = await vaultDB.getItem<EncryptedPayload>('entries');
  
  if (!salt || !entries) throw new Error("Nothing to export");
  
  const exportData = {
    version: 1,
    app: 'GhostDiary',
    salt,
    entries: entries.data
  };
  
  const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `GhostDiary_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
};

export const importVaultFromFile = async (file: File): Promise<boolean> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (data.app !== 'GhostDiary' || !data.salt || !data.entries) {
      throw new Error("Invalid backup file format");
    }
    
    await vaultDB.setItem('master_salt', data.salt);
    await vaultDB.setItem('entries', { data: data.entries });
    lockVault(); // Require user to unlock with the imported file's password
    return true;
  } catch (e) {
    console.error("Failed to import vault", e);
    return false;
  }
};
