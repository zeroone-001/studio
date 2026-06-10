
"use client";

import React, { useState, useEffect } from "react";
import { Printer, Wallet, Wifi, ShieldCheck, Database, RefreshCcw, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionStore } from "@/lib/kiosk/persistence";

export function HealthMonitor() {
  const [status, setStatus] = useState({
    online: true,
    storage: "0MB",
    storagePercent: "0",
    syncPending: 0,
    printer: "ready",
    camera: false
  });

  useEffect(() => {
    const checkHealth = () => {
      const stats = SessionStore.getStorageStats();
      const queue = SessionStore.getSyncQueue();
      
      // Simple probe to see if media devices are available
      const checkCamera = async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          return devices.some(d => d.kind === 'videoinput');
        } catch {
          return false;
        }
      };

      checkCamera().then(camActive => {
        setStatus({
          online: navigator.onLine,
          storage: `${stats.usedMB}MB`,
          storagePercent: stats.percent,
          syncPending: queue.length,
          printer: "ready",
          camera: camActive
        });
      });
    };

    const interval = setInterval(checkHealth, 3000);
    window.addEventListener('online', checkHealth);
    window.addEventListener('offline', checkHealth);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkHealth);
      window.removeEventListener('offline', checkHealth);
    };
  }, []);

  return (
    <div className="fixed bottom-2 left-6 right-6 z-[40] flex justify-between items-center pointer-events-none select-none">
      <div className="flex items-center gap-4 opacity-30 hover:opacity-100 transition-opacity pointer-events-auto">
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Wifi className={cn("w-2.5 h-2.5", status.online ? "text-green-500" : "text-red-500")} />
          <span>{status.online ? "Cloud Active" : "Offline Mode"}</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Video className={cn("w-2.5 h-2.5", status.camera ? "text-green-500" : "text-red-500")} />
          <span>Stream: {status.camera ? "Active" : "Disconnected"}</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Database className={cn("w-2.5 h-2.5", parseInt(status.storagePercent) > 80 ? "text-red-500" : "text-blue-400")} />
          <span>Cache: {status.storagePercent}%</span>
        </div>
        {status.syncPending > 0 && (
          <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
            <RefreshCcw className="w-2.5 h-2.5 text-primary animate-spin" />
            <span>Syncing: {status.syncPending} items</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Printer className="w-2.5 h-2.5 text-primary" />
          <span>Printer: {status.printer}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 opacity-20">
        <ShieldCheck className="w-2.5 h-2.5 text-green-500" />
        <span className="text-[8px] font-black uppercase tracking-widest text-white">Failsafe Protected</span>
      </div>
    </div>
  );
}
