
"use client";

import React, { useState, useEffect } from "react";
import { Printer, Wallet, Wifi, ShieldCheck, Database, RefreshCcw, Video, Usb } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionStore } from "@/lib/kiosk/persistence";

/**
 * Health Monitor component.
 * This component is intended to be visible only to the owner in Owner Mode.
 */
export function HealthMonitor() {
  const [status, setStatus] = useState({
    online: true,
    storage: "0MB",
    storagePercent: "0",
    syncPending: 0,
    printer: "USB HUB ACTIVE",
    camera: false,
    usbHub: false
  });

  useEffect(() => {
    const checkHealth = () => {
      const stats = SessionStore.getStorageStats();
      const queue = SessionStore.getSyncQueue();
      
      const checkHardware = async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasCam = devices.some(d => d.kind === 'videoinput');
          
          // WebUSB Detection for OTG Hubs/Printers
          let hasUsb = false;
          if ('usb' in navigator) {
            // @ts-ignore
            const usbDevices = await navigator.usb.getDevices();
            hasUsb = usbDevices.length > 0;
          }
          
          return { hasCam, hasUsb };
        } catch {
          return { hasCam: false, hasUsb: false };
        }
      };

      checkHardware().then(hw => {
        setStatus({
          online: typeof navigator !== 'undefined' ? navigator.onLine : true,
          storage: `${stats.usedMB}MB`,
          storagePercent: stats.percent,
          syncPending: queue.length,
          printer: hw.hasUsb ? "PRINTER READY (OTG)" : "HUB PENDING",
          camera: hw.hasCam,
          usbHub: hw.hasUsb
        });
      });
    };

    const interval = setInterval(checkHealth, 3000);
    if (typeof window !== 'undefined') {
      window.addEventListener('online', checkHealth);
      window.addEventListener('offline', checkHealth);
      
      // Hardware connection listeners
      if ('usb' in navigator) {
        // @ts-ignore
        navigator.usb.addEventListener('connect', checkHealth);
        // @ts-ignore
        navigator.usb.addEventListener('disconnect', checkHealth);
      }
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', checkHealth);
        window.removeEventListener('offline', checkHealth);
        if ('usb' in navigator) {
          // @ts-ignore
          navigator.usb.removeEventListener('connect', checkHealth);
          // @ts-ignore
          navigator.usb.removeEventListener('disconnect', checkHealth);
        }
      }
    };
  }, []);

  return (
    <div className="fixed bottom-2 left-6 right-6 z-[40] flex justify-between items-center pointer-events-none select-none">
      <div className="flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity pointer-events-auto bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full border border-white/5">
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Wifi className={cn("w-2.5 h-2.5", status.online ? "text-green-500" : "text-red-500")} />
          <span>{status.online ? "Cloud Active" : "Offline Mode"}</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Video className={cn("w-2.5 h-2.5", status.camera ? "text-green-500" : "text-red-500")} />
          <span>Stream: {status.camera ? "Active" : "Disconnected"}</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Usb className={cn("w-2.5 h-2.5", status.usbHub ? "text-blue-400" : "text-white/20")} />
          <span>OTG Hub: {status.usbHub ? "CONNECTED" : "WAITING"}</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Database className={cn("w-2.5 h-2.5", parseInt(status.storagePercent) > 80 ? "text-red-500" : "text-blue-400")} />
          <span>Cache: {status.storagePercent}%</span>
        </div>
        {status.syncPending > 0 && (
          <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
            <RefreshCcw className="w-2.5 h-2.5 text-primary animate-spin" />
            <span>Syncing: {status.syncPending}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Printer className="w-2.5 h-2.5 text-primary" />
          <span>{status.printer}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 opacity-20">
        <ShieldCheck className="w-2.5 h-2.5 text-green-500" />
        <span className="text-[8px] font-black uppercase tracking-widest text-white">Honor Pad X10 Verified</span>
      </div>
    </div>
  );
}
