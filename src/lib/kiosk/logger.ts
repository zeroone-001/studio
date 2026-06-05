
/**
 * @fileOverview Centralized logging service for kiosk diagnostics.
 */

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  module: string;
  message: string;
  data?: any;
}

const MAX_LOGS = 100;
const LOG_KEY = 'jnl_kiosk_logs';

export const KioskLogger = {
  log: (level: LogEntry['level'], module: string, message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data
    };

    try {
      const logs = KioskLogger.getLogs();
      logs.unshift(entry);
      localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
      
      if (level === 'error') {
        console.error(`[${module}] ${message}`, data);
      }
    } catch (e) {
      // Failsafe for quota exceeded
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
