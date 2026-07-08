/**
 * @fileOverview Session persistence and Hybrid Sync Queue for JNL Studio Kiosk.
 * Optimized for Honor Pad X10 local storage and microSD archive lifecycle management.
 */

export interface KioskSession {
  id: string;
  state: string;
  packageSelected: 50 | 100 | null;
  paymentReceived: number;
  capturedPhotos: string[];
  timestamp: number;
  promoConsent: boolean | null;
  isSynced: boolean;
  isUsbBackedUp: boolean;
  isDownloaded: boolean;
}

const DB_NAME = 'JNL_Studio_Kiosk_DB';
const STORE_NAME = 'photos';

export const SessionStore = {
  // Initialize IndexedDB for high-performance large photo storage
  initDB: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject('IndexedDB not available');
      const request = indexedDB.open(DB_NAME, 3);
      request.onupgradeneeded = (e: any) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Save photo to IndexedDB for instant local persistence
  savePhotoLocally: async (id: string, blob: Blob): Promise<{ success: boolean; size: number }> => {
    try {
      if (typeof window === 'undefined') return { success: false, size: 0 };
      if (blob.size === 0) throw new Error('Empty Blob');

      const db = await SessionStore.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(blob, id);
      
      return new Promise((resolve) => {
        tx.oncomplete = () => resolve({ success: true, size: blob.size });
        tx.onerror = () => resolve({ success: false, size: 0 });
      });
    } catch (e) {
      console.error('Local Gallery Save Failed', e);
      return { success: false, size: 0 };
    }
  },

  // Permanent Archive to Lexar microSD (microSD is mapped via Directory Picker)
  // Path: /JNL_STUDIO_ARCHIVE/JNL_PORTRAIT_{id}.jpg
  saveToUsb: async (handle: FileSystemDirectoryHandle, id: string, blob: Blob) => {
    try {
      if (blob.size === 0) throw new Error('Empty Blob');
      
      // Create or get the archive folder
      const studioFolder = await handle.getDirectoryHandle('JNL_STUDIO_ARCHIVE', { create: true });
      const fileName = `JNL_PORTRAIT_${id}.jpg`;
      const fileHandle = await studioFolder.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      
      return { success: true, path: `USB:/JNL_STUDIO_ARCHIVE/${fileName}`, size: blob.size };
    } catch (e) {
      console.error('Lexar USB Archive Failed', e);
      return { success: false, path: '', size: 0 };
    }
  },

  getStorageStats: () => {
    let total = 0;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += ((localStorage[key].length + key.length) * 2);
        }
      }
    }
    const sizeInMB = (total / 1024 / 1024).toFixed(2);
    return {
      usedMB: sizeInMB,
      percent: Math.min(100, (total / (5 * 1024 * 1024)) * 100).toFixed(0)
    };
  }
};
