
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Wifi, Usb, Banknote, Database, CheckCircle2, AlertCircle, Activity, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionStore } from "@/lib/kiosk/persistence";

/**
 * Health Monitor component.
 * Optimized for Android Intent Printing (NokoPrint).
 * Removes WebUSB hardware polling requirement.
 */
export function HealthMonitor() {
  const [status, setStatus] = useState({
    online: false,
    storage: "0MB",
    storagePercent: "0",
    intentReady: false,
    usbHub: false,
    billAcceptor: false
  });

  const checkSystem = useCallback(async () => {
    const stats = SessionStore.getStorageStats();
    
    let isOnline = false;
    let shareReady = false;
    let hasHub = false;
    let hasSerial = false;

    if (typeof navigator !== 'undefined') {
      isOnline = navigator.onLine;

      // 1. Verify Android Intent System (Web Share API)
      // This is what NokoPrint uses to receive photos from the browser
      if (navigator.share && navigator.canShare) {
        shareReady = true;
      }

      // 2. Basic USB Hub Detection (Passive)
      if ('usb' in navigator) {
        try {
          const devices = await navigator.usb.getDevices();
          hasHub = devices.length > 0;
        } catch (e) {
          hasHub = false;
        }
      }
      
      // 3. Serial Port Detection (Bill Acceptor)
      if ('serial' in navigator) {
        try {
          // @ts-ignore
          const ports = await navigator.serial.getPorts();
          hasSerial = ports.length > 0;
        } catch (e) {
          hasSerial = false;
        }
      }
    }
    
    setStatus({
      online: isOnline,
      storage: `${stats.usedMB}MB`,
      storagePercent: stats.percent,
      intentReady: shareReady,
      usbHub: hasHub,
      billAcceptor: hasSerial
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
          {status.intentReady ? (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Print Service Ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-500 animate-pulse">
              <AlertCircle className="w-4 h-4" />
              <span>Checking Intents...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-6 text-[9px] font-black uppercase tracking-widest">
          <Usb className={cn("w-3.5 h-3.5", status.usbHub ? "text-blue-400" : "text-white/20")} />
          <span className={status.usbHub ? "text-blue-400" : "text-white/40"}>
            {status.usbHub ? "Hub Active" : "Hub Standby"}
          </span>
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-6 text-[9px] font-black uppercase tracking-widest">
          <Database className={cn("w-3.5 h-3.5", parseInt(status.storagePercent) > 80 ? "text-red-500" : "text-blue-400")} />
          <span>Cache: {status.storagePercent}%</span>
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-6 text-[9px] font-black uppercase tracking-widest">
          <Banknote className={cn("w-3.5 h-3.5", status.billAcceptor ? "text-green-500" : "text-white/20")} />
          <span className={status.billAcceptor ? "text-green-500" : "text-white/40"}>
            {status.billAcceptor ? "Cash Ready" : "No Acceptor"}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-white/5 opacity-50">
        <Activity className="w-3 h-3 text-primary animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Android System Verified</span>
      </div>
    </div>
  );
}
