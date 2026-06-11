
/**
 * @fileOverview Centralized logging manager for kiosk diagnostics with hardware state capture.
 */

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'critical';
  module: string;
  message: string;
  context: {
    online: boolean;
    storage: string;
    camera: boolean;
    printer: string;
    sessionState: string;
    payment: number;
  };
}

const MAX_LOGS = 300;
const LOG_KEY = 'jnl_kiosk_system_logs';

export const KioskLogger = {
  log: (level: LogEntry['level'], module: string, message: string, stateContext?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      context: {
        online: typeof navigator !== 'undefined' ? navigator.onLine : true,
        storage: 'Monitor Active',
        camera: !!stateContext?.cameraActive,
        printer: stateContext?.printerStatus || 'Ready',
        sessionState: stateContext?.appState || 'Unknown',
        payment: stateContext?.paymentReceived || 0
      }
    };

    try {
      const logs = KioskLogger.getLogs();
      logs.unshift(entry);
      localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
      
      // Removed console.error to prevent NextJS development overlay from blocking the kiosk screen.
      // System state is preserved in the hidden Owner mastery panel for diagnostics.
    } catch (e) {
      // Recovery failsafe
    }
  },

  getLogs: (): LogEntry[] => {
    try {
      const data = localStorage.getItem(LOG_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  clear: () => {
    localStorage.removeItem(LOG_KEY);
  }
};
