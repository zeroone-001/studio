/**
 * @fileOverview Centralized logging manager for kiosk diagnostics with hardware state capture.
 * Provides detailed SUCCESS/FAILED status tracing for Print and QR workflows.
 */

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'critical' | 'trace';
  module: 'PRINT' | 'QR' | 'HARDWARE' | 'CLOUD' | 'SESSION';
  message: string;
  status?: 'SUCCESS' | 'FAILED' | 'PENDING';
  error?: string;
}

const MAX_LOGS = 1000;
const LOG_KEY = 'jnl_kiosk_system_logs';

export const KioskLogger = {
  log: (level: LogEntry['level'], module: LogEntry['module'], message: string, status?: LogEntry['status'], error?: string) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      status,
      error
    };

    try {
      const logs = KioskLogger.getLogs();
      logs.unshift(entry);
      localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
      
      const logMsg = `[${module}] ${status ? status + ': ' : ''}${message}${error ? ' | ERR: ' + error : ''}`;
      if (level === 'error' || level === 'critical') console.error(logMsg);
      else console.log(logMsg);
    } catch (e) {}
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
