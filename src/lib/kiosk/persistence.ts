/**
 * @fileOverview Session persistence and Hybrid Sync Queue for JNL Studio Kiosk.
 * Upgraded to use IndexedDB for high-resolution photo storage and USB sync management.
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
  // Initialize IndexedDB for large photo storage
  initDB: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject('IndexedDB not available on server');
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Save photo to IndexedDB for local persistence
  savePhotoLocally: async (id: string, dataUrl: string) => {
    try {
      if (typeof window === 'undefined') return;
      const db = await SessionStore.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(dataUrl, id);
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error('Local Save Failed', e);
    }
  },

  // Save session locally
  save: (session: Partial<KioskSession>) => {
    try {
      if (typeof window === 'undefined') return;
      const existing = SessionStore.load();
      const updated = {
        ...existing,
        ...session,
        timestamp: Date.now(),
        id: existing?.id || `sess_${Date.now()}`,
        isSynced: false
      } as KioskSession;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      if (session.capturedPhotos && session.capturedPhotos.length > 0) {
        SessionStore.addToSyncQueue({
          id: `${updated.id}_update`,
          type: 'session',
          data: { ...updated, capturedPhotos: session.capturedPhotos },
          timestamp: Date.now(),
          retryCount: 0,
          status: 'pending'
        });
      }
    } catch (e) {
      if (typeof window !== 'undefined' && e instanceof DOMException && e.name === 'QuotaExceededError') {
        localStorage.removeItem(SYNC_QUEUE_KEY);
      }
    }
  },

  load: (): KioskSession | null => {
    try {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const session = JSON.parse(data) as KioskSession;
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

  addToSyncQueue: (item: SyncItem) => {
    try {
      if (typeof window === 'undefined') return;
      const queue = SessionStore.getSyncQueue();
      const index = queue.findIndex(i => i.id === item.id);
      if (index > -1) {
        queue[index] = { ...queue[index], ...item };
      } else {
        queue.push(item);
      }
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue.slice(-25))); 
    } catch (e) {
      console.error('Sync Queue Failed', e);
    }
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

  updateSyncStatus: (id: string, status: SyncItem['status']) => {
    if (typeof window === 'undefined') return;
    const queue = SessionStore.getSyncQueue().map(i => 
      i.id === id ? { ...i, status, retryCount: status === 'failed' ? i.retryCount + 1 : i.retryCount } : i
    );
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
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
