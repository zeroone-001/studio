/**
 * @fileOverview Session persistence and Hybrid Sync Queue for JNL Studio Kiosk.
 * Ensures data integrity across restarts and network outages with local-first logic.
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

export const SessionStore = {
  // Save locally first to the device's persistent storage
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
      
      // Also track for sync queue if it contains actual captured photos
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
      // If QuotaExceeded, try clearing the queue but keep the current session
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        localStorage.removeItem(SYNC_QUEUE_KEY);
      }
    }
  },

  load: (): KioskSession | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const session = JSON.parse(data) as KioskSession;
      
      // Expire old sessions from previous business days (12 hours)
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
    localStorage.removeItem(STORAGE_KEY);
  },

  // --- HYBRID SYNC QUEUE ---
  addToSyncQueue: (item: SyncItem) => {
    try {
      const queue = SessionStore.getSyncQueue();
      // Idempotent check: update existing if same ID
      const index = queue.findIndex(i => i.id === item.id);
      if (index > -1) {
        queue[index] = { ...queue[index], ...item };
      } else {
        queue.push(item);
      }
      // Cap at 25 items to prevent browser storage crash while holding high-res base64 photos
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue.slice(-25))); 
    } catch (e) {
      console.error('Sync Queue: Add failed', e);
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

  updateSyncStatus: (id: string, status: SyncItem['status']) => {
    const queue = SessionStore.getSyncQueue().map(i => 
      i.id === id ? { ...i, status, retryCount: status === 'failed' ? i.retryCount + 1 : i.retryCount } : i
    );
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  },

  // --- STORAGE MONITORING ---
  getStorageStats: () => {
    let total = 0;
    if (typeof localStorage !== 'undefined') {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += ((localStorage[key].length + key.length) * 2);
        }
      }
    }
    const sizeInMB = (total / 1024 / 1024).toFixed(2);
    return {
      usedMB: sizeInMB,
      percent: Math.min(100, (total / (5 * 1024 * 1024)) * 100).toFixed(0) // Assuming 5MB limit
    };
  }
};