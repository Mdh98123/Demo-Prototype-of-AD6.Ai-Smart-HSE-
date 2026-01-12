
import { encryptData, decryptData } from './cryptoService';

export const SecureStorage = {
  setItem: async (key: string, value: any) => {
    try {
      const encrypted = await encryptData(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error(`SecureStorage Write Error [${key}]:`, error);
    }
  },

  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return await decryptData(item);
    } catch (error) {
      console.error(`SecureStorage Read Error [${key}]:`, error);
      return null;
    }
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  }
};
