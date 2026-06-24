/**
 * @fileOverview Session persistence and Hybrid Sync Queue for JNL Studio Kiosk.
 * Optimized for Honor Pad X10 local storage and lifecycle management.
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

export interface SyncItem {
  id: string;
  type: 'photo' | 'log' | 'session' | 'usb_sync';
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'synced' | 'failed';
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
      const request = indexedDB.open(DB_NAME, 2);
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
  savePhotoLocally: async (id: string, blob: Blob) => {
    try {
      if (typeof window === 'undefined') return;
      const db = await SessionStore.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(blob, id);
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error('Local Buffer Failed', e);
    }
  },

  // Cleanup logic: Verify backups before deleting local temporary copy
  cleanupSession: async (id: string, skipFacebook: boolean) => {
    try {
      if (typeof window === 'undefined') return;
      const session = SessionStore.load();
      if (!session || session.id !== id) return;

      // Only delete if verified backups exist and customer didn't want Facebook post
      if (skipFacebook && session.isUsbBackedUp && (session.isSynced || session.isDownloaded)) {
        const db = await SessionStore.initDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        SessionStore.clear();
      }
    } catch (e) {
      console.error('Cleanup Error', e);
    }
  },

  save: (session: Partial<KioskSession>) => {
    try {
      if (typeof window === 'undefined') return;
      const existing = SessionStore.load();
      const updated = {
        ...existing,
        ...session,
        timestamp: Date.now(),
        id: existing?.id || `sess_${Date.now()}`,
        isSynced: existing?.isSynced || false,
        isUsbBackedUp: existing?.isUsbBackedUp || false,
        isDownloaded: existing?.isDownloaded || false
      } as KioskSession;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Session Save Error', e);
    }
  },

  load: (): KioskSession | null => {
    try {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const session = JSON.parse(data) as KioskSession;
      // Stale sessions (12h) are cleared
      if (Date.now() - session.timestamp > 12 * 60 * 60 * 1000) {
        SessionStore.clear();
        return null;
      }
      return session;
    } catch (e) {
      return null;
    }
  },

  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },

  getSyncQueue: (): SyncItem[] => {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
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
