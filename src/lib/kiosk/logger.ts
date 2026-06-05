
/**
 * @fileOverview Centralized logging service for kiosk diagnostics with state capture.
 */

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  module: string;
  message: string;
  context: {
    internetStatus: boolean;
    storageUsed: string;
    cameraActive: boolean;
    paymentState: number;
    sessionId?: string;
  };
  data?: any;
}

const MAX_LOGS = 200;
const LOG_KEY = 'jnl_kiosk_logs';

export const KioskLogger = {
  log: (level: LogEntry['level'], module: string, message: string, data?: any) => {
    // Capture current system state for debugging
    const context = {
      internetStatus: typeof navigator !== 'undefined' ? navigator.onLine : true,
      storageUsed: 'Unknown',
      cameraActive: false, // Updated by components
      paymentState: 0,
      sessionId: 'none'
    };

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      context,
      data
    };

    try {
      const logs = KioskLogger.getLogs();
      logs.unshift(entry);
      localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
      
      if (level === 'error') {
        console.error(`[${module}] ${message}`, entry);
      }
    } catch (e) {
      // Failsafe
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
