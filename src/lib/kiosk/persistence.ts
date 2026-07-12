
/**
 * @fileOverview Session persistence and Hybrid Sync Queue for JNL Studio Kiosk.
 * Optimized for Honor Pad X10 local storage and microSD archive lifecycle management.
 */

import { KioskLogger } from "./logger";

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
    KioskLogger.log('info', 'SESSION', `Step A: IndexedDB Save Start: ${id}`, 'PENDING');
    try {
      if (typeof window === 'undefined') return { success: false, size: 0 };
      if (blob.size === 0) throw new Error('Empty Blob');

      const db = await SessionStore.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(blob, id);
      
      return new Promise((resolve) => {
        tx.oncomplete = () => {
          KioskLogger.log('info', 'SESSION', `Step A: IndexedDB Save Verified: ${blob.size} bytes`, 'SUCCESS');
          resolve({ success: true, size: blob.size });
        };
        tx.onerror = () => {
          KioskLogger.log('error', 'SESSION', 'Step A: IndexedDB Transaction Failed', 'FAILED');
          resolve({ success: false, size: 0 });
        };
      });
    } catch (e: any) {
      KioskLogger.log('error', 'SESSION', 'Step A: Exception', 'FAILED', e.message);
      return { success: false, size: 0 };
    }
  },

  // Save to any Directory Handle (USB or Local Folder) with Verification
  saveToHandle: async (handle: FileSystemDirectoryHandle, folderName: string, id: string, blob: Blob) => {
    KioskLogger.log('info', 'HARDWARE', `DISK_WRITE_TRACE: ${folderName} for ${id}`, 'PENDING');
    console.log(`[DISK_DIAG] Starting write process to folder: ${folderName}`);
    
    try {
      if (!handle) {
        console.error(`[DISK_DIAG] ABORT: Folder handle is null or undefined.`);
        throw new Error('NULL_HANDLE: Permission may have expired. Admin must re-mount in Owner Utility.');
      }
      
      if (blob.size === 0) {
        console.error(`[DISK_DIAG] ABORT: Blob payload is zero bytes.`);
        throw new Error('ZERO_BYTE_BLOB');
      }
      
      // Step 1: Resolve Directory
      console.log(`[DISK_DIAG] 1. Accessing directory: ${folderName}`);
      const targetFolder = await handle.getDirectoryHandle(folderName, { create: true });
      
      // Step 2: Acquire File Handle
      const fileName = `JNL_PORTRAIT_${id}.jpg`;
      console.log(`[DISK_DIAG] 2. Acquiring file handle: ${fileName}`);
      const fileHandle = await targetFolder.getFileHandle(fileName, { create: true });
      
      // Step 3: Create Writable Stream
      console.log(`[DISK_DIAG] 3. Creating writable stream...`);
      const writable = await fileHandle.createWritable();
      
      // Step 4: Commit Data
      console.log(`[DISK_DIAG] 4. Writing ${blob.size} bytes...`);
      await writable.write(blob);
      
      // Step 5: Close Stream
      console.log(`[DISK_DIAG] 5. Closing stream (flushing to disk)...`);
      await writable.close();
      
      // Step 6: Verification
      console.log(`[DISK_DIAG] 6. Verifying write on disk...`);
      const verifiedFile = await targetFolder.getFileHandle(fileName);
      const fileData = await verifiedFile.getFile();
      
      console.log(`[DISK_DIAG] VERIFIED: File exists with size ${fileData.size} bytes.`);
      
      if (fileData.size > 0) {
        KioskLogger.log('info', 'HARDWARE', `WRITE_VERIFIED: ${fileData.size} bytes at ${folderName}`, 'SUCCESS');
        return { success: true, path: `${folderName}/${fileName}`, size: fileData.size };
      } else {
        throw new Error('VERIFICATION_FAILED: File created but reported size is zero.');
      }
    } catch (e: any) {
      console.error(`[DISK_DIAG] CRASH: ${e.name} - ${e.message}`);
      KioskLogger.log('error', 'HARDWARE', `DISK_WRITE_CRASH (${folderName})`, 'FAILED', e.message);
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
