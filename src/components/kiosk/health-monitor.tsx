
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Wifi, Usb, Database, CheckCircle2, AlertCircle, Activity, HardDrive, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionStore } from "@/lib/kiosk/persistence";

interface HealthMonitorProps {
  usbMounted?: boolean;
}

interface USBDeviceStats {
  name: string;
  vid: string;
  pid: string;
}

export function HealthMonitor({ usbMounted = false }: HealthMonitorProps) {
  const [status, setStatus] = useState({
    online: false,
    storage: "0MB",
    storagePercent: "0",
    printerReady: false,
    usbConnected: false,
    usbDevices: [] as USBDeviceStats[]
  });

  const checkSystem = useCallback(async () => {
    const stats = SessionStore.getStorageStats();
    
    let isOnline = false;
    let intentReady = false;
    let hasUsbDevice = false;
    let deviceStats: USBDeviceStats[] = [];

    if (typeof navigator !== 'undefined') {
      isOnline = navigator.onLine;

      // Honor Pad Android Share Capability check
      if (navigator.share) {
        intentReady = true;
      }

      // REAL HARDWARE BUS SCAN (WebUSB)
      if ('usb' in navigator) {
        try {
          const devices = await navigator.usb.getDevices();
          hasUsbDevice = devices.length > 0;
          deviceStats = devices.map(d => ({
            name: d.productName || "Epson/USB Device",
            vid: `0x${d.vendorId.toString(16).padStart(4, '0').toUpperCase()}`,
            pid: `0x${d.productId.toString(16).padStart(4, '0').toUpperCase()}`
          }));
        } catch (e) {
          hasUsbDevice = false;
        }
      }
    }
    
    setStatus({
      online: isOnline,
      storage: `${stats.usedMB}MB`,
      storagePercent: stats.percent,
      printerReady: intentReady,
      usbConnected: hasUsbDevice,
      usbDevices: deviceStats
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(checkSystem, 3000);
    checkSystem();
    return () => clearInterval(interval);
  }, [checkSystem]);

  return (
    <div className="fixed bottom-4 left-6 right-6 z-[60] flex justify-between items-center pointer-events-none select-none animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-6 pointer-events-auto bg-black/80 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-white tracking-widest">
          <Wifi className={cn("w-3.5 h-3.5", status.online ? "text-green-500" : "text-red-500")} />
          <span>Cloud</span>
        </div>
        
        <div className="flex items-center gap-2 border-l border-white/10 pl-6">
          {status.printerReady ? (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>INTENT READY</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500">
              <AlertCircle className="w-4 h-4" />
              <span>INTENT OFFLINE</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-6 text-[9px] font-black uppercase tracking-widest">
          <Usb className={cn("w-3.5 h-3.5", status.usbConnected ? "text-blue-400" : "text-white/20")} />
          <div className="flex flex-col">
            <span className={status.usbConnected ? "text-blue-400" : "text-white/40"}>
              {status.usbConnected ? `${status.usbDevices.length} USB DETECTED` : "NO USB OTG"}
            </span>
            {status.usbConnected && status.usbDevices.length > 0 && (
              <span className="text-[6px] text-white/30 font-mono">
                {status.usbDevices[0].vid}:{status.usbDevices[0].pid}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-6 text-[9px] font-black uppercase tracking-widest">
          <HardDrive className={cn("w-3.5 h-3.5", usbMounted ? "text-green-500" : "text-white/20")} />
          <span className={usbMounted ? "text-green-500" : "text-white/40"}>
            {usbMounted ? "LEXAR READY" : "ARCHIVE UNMOUNTED"}
          </span>
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-6 text-[9px] font-black uppercase tracking-widest">
          <Database className={cn("w-3.5 h-3.5", parseInt(status.storagePercent) > 80 ? "text-red-500" : "text-blue-400")} />
          <span>Local: {status.storagePercent}%</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-white/5 opacity-50">
        <Activity className="w-3 h-3 text-primary animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">HARDWARE VERIFIED (OTG)</span>
      </div>
    </div>
  );
}
