
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

const STORAGE_KEY = 'jnl_kiosk_current_session';
const SYNC_QUEUE_KEY = 'jnl_kiosk_sync_queue';
const DB_NAME = 'JNL_Studio_Kiosk_DB';
const STORE_NAME = 'photos';

export const SessionStore = {
  // Initialize IndexedDB for high-performance large photo storage
  initDB: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject('IndexedDB not available');
      const request = indexedDB.open(DB_NAME, 3); // Bumped version for Lexar USB integration
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
  savePhotoLocally: async (id: string, blob: Blob): Promise<boolean> => {
    try {
      if (typeof window === 'undefined') return false;
      const db = await SessionStore.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(blob, id);
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(false);
      });
    } catch (e) {
      console.error('Local Gallery Save Failed', e);
      return false;
    }
  },

  // Permanent Archive to Lexar microSD (microSD is mapped via Directory Picker)
  saveToUsb: async (handle: FileSystemDirectoryHandle, id: string, blob: Blob) => {
    try {
      // Create or get the archive folder
      const studioFolder = await handle.getDirectoryHandle('JNL_STUDIO_ARCHIVE', { create: true });
      const fileName = `JNL_PORTRAIT_${id}_${Date.now()}.jpg`;
      const fileHandle = await studioFolder.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (e) {
      console.error('Lexar USB Archive Failed', e);
      return false;
    }
  },

  // Cleanup temporary local copy for sessions that shouldn't be archived
  cleanupSession: async (id: string) => {
    try {
      if (typeof window === 'undefined') return;
      const db = await SessionStore.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      return new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
      });
    } catch (e) {
      console.error('Cleanup Error', e);
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
