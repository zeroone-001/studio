
/**
 * @fileOverview Session persistence utility for the JNL Studio Kiosk.
 * Handles saving and restoring session state to survive app restarts.
 */

export interface KioskSession {
  id: string;
  state: string;
  packageSelected: 50 | 100 | null;
  paymentReceived: number;
  capturedPhotos: string[];
  timestamp: number;
  promotionalConsent: boolean | null;
}

const STORAGE_KEY = 'jnl_kiosk_current_session';

export const SessionStore = {
  save: (session: Partial<KioskSession>) => {
    try {
      const existing = SessionStore.load();
      const updated = {
        ...existing,
        ...session,
        timestamp: Date.now(),
        id: existing?.id || `sess_${Date.now()}`
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  },

  load: (): KioskSession | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const session = JSON.parse(data) as KioskSession;
      
      // Expire sessions older than 30 minutes
      if (Date.now() - session.timestamp > 30 * 60 * 1000) {
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
  }
};
