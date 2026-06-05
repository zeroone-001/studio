
/**
 * @fileOverview Session persistence and Hybrid Sync Queue for JNL Studio Kiosk.
 * Ensures data integrity across restarts and network outages.
 */

export interface KioskSession {
  id: string;
  state: string;
  packageSelected: 50 | 100 | null;
  paymentReceived: number;
  capturedPhotos: string[];
  timestamp: number;
  promotionalConsent: boolean | null;
  isSynced: boolean;
}

export interface SyncItem {
  id: string;
  type: 'photo' | 'log' | 'session';
  data: any;
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEY = 'jnl_kiosk_current_session';
const SYNC_QUEUE_KEY = 'jnl_kiosk_sync_queue';
const MAX_RETRIES = 5;

export const SessionStore = {
  save: (session: Partial<KioskSession>) => {
    try {
      const existing = SessionStore.load();
      const updated = {
        ...existing,
        ...session,
        timestamp: Date.now(),
        id: existing?.id || `sess_${Date.now()}`,
        isSynced: false
      } as KioskSession;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      // Add to sync queue for cloud backup
      SessionStore.addToSyncQueue({
        id: updated.id,
        type: 'session',
        data: updated,
        timestamp: Date.now(),
        retryCount: 0
      });
    } catch (e) {
      console.error('Persistence: Failed to save session', e);
    }
  },

  load: (): KioskSession | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const session = JSON.parse(data) as KioskSession;
      
      // Expire sessions older than 6 hours for safety
      if (Date.now() - session.timestamp > 6 * 60 * 60 * 1000) {
        SessionStore.clear();
        return null;
      }
      return session;
    } catch (e) {
      return null;
    }
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // --- SYNC QUEUE SYSTEM ---

  addToSyncQueue: (item: SyncItem) => {
    try {
      const queue = SessionStore.getSyncQueue();
      // Idempotent check
      if (queue.some(i => i.id === item.id && i.type === item.type)) return;
      
      queue.push(item);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Sync: Failed to add item to queue');
    }
  },

  getSyncQueue: (): SyncItem[] => {
    try {
      const data = localStorage.getItem(SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  removeFromSyncQueue: (id: string) => {
    const queue = SessionStore.getSyncQueue().filter(i => i.id !== id);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  },

  // --- STORAGE MONITORING ---

  getStorageStats: () => {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += ((localStorage[key].length + key.length) * 2);
      }
    }
    // Approximate size in MB (max localstorage is usually 5-10MB)
    const sizeInMB = (total / 1024 / 1024).toFixed(2);
    return {
      usedMB: sizeInMB,
      percent: Math.min(100, (total / (5 * 1024 * 1024)) * 100).toFixed(0)
    };
  }
};
