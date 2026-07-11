
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

  // Save to any Directory Handle (USB or Local Folder) with Verification
  saveToHandle: async (handle: FileSystemDirectoryHandle, folderName: string, id: string, blob: Blob) => {
    try {
      if (!handle) throw new Error('Null Handle Provided');
      if (blob.size === 0) throw new Error('Empty Blob');
      
      // Create or get the target folder
      const targetFolder = await handle.getDirectoryHandle(folderName, { create: true });
      const fileName = `JNL_PORTRAIT_${id}.jpg`;
      const fileHandle = await targetFolder.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      
      // VERIFICATION: Check if file exists and has content
      const verifiedFile = await targetFolder.getFileHandle(fileName);
      const fileData = await verifiedFile.getFile();
      
      if (fileData.size > 0) {
        return { success: true, path: `${folderName}/${fileName}`, size: fileData.size };
      } else {
        throw new Error('Verification Failed: File size is zero');
      }
    } catch (e: any) {
      console.error(`Storage Save Failed (${folderName}):`, e);
      return { success: false, error: e.message || 'Unknown Storage Error' };
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
