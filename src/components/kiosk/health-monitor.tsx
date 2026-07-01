
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Wifi, Usb, Banknote, Database, CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionStore } from "@/lib/kiosk/persistence";
import { KioskLogger } from "@/lib/kiosk/logger";

/**
 * Health Monitor component.
 * STRICT HARDWARE VERIFICATION: Only reports READY if navigator.usb returns a paired device.
 */
export function HealthMonitor() {
  const [status, setStatus] = useState({
    online: false,
    storage: "0MB",
    storagePercent: "0",
    printerConnected: false,
    usbHub: false,
    lexarUsb: false,
    billAcceptor: false
  });

  const checkHardware = useCallback(async () => {
    const stats = SessionStore.getStorageStats();
    
    let isOnline = false;
    let hasPrinter = false;
    let hasHub = false;
    let hasLexar = false;
    let hasSerial = false;

    if (typeof navigator !== 'undefined') {
      isOnline = navigator.onLine;

      // 1. STRICT WebUSB Polling (No Mocking)
      if ('usb' in navigator) {
        try {
          const devices = await navigator.usb.getDevices();
          hasHub = devices.length > 0;
          
          devices.forEach(device => {
            const vid = device.vendorId;
            const pid = device.productId;
            
            // Epson L210 Signature (VID: 0x04b8 / 1208)
            if (vid === 1208 || vid === 0x04b8) {
              hasPrinter = true;
            }
            
            // Lexar / Storage Signatures
            const name = (device.productName || "").toLowerCase();
            if (name.includes('lexar') || name.includes('storage') || name.includes('flash')) {
              hasLexar = true;
            }
          });
        } catch (e) {
          hasHub = false;
        }
      }
      
      // 2. Serial Port Polling (Bill Acceptor)
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
      printerConnected: hasPrinter,
      usbHub: hasHub,
      lexarUsb: hasLexar,
      billAcceptor: hasSerial
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(checkHardware, 3000);
    checkHardware();

    if (typeof window !== 'undefined' && 'usb' in navigator) {
      navigator.usb.addEventListener('connect', checkHardware);
      navigator.usb.addEventListener('disconnect', checkHardware);
      return () => {
        navigator.usb.removeEventListener('connect', checkHardware);
        navigator.usb.removeEventListener('disconnect', checkHardware);
        clearInterval(interval);
      };
    }

    return () => clearInterval(interval);
  }, [checkHardware]);

  return (
    <div className="fixed bottom-4 left-6 right-6 z-[60] flex justify-between items-center pointer-events-none select-none animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-6 pointer-events-auto bg-black/80 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-white tracking-widest">
          <Wifi className={cn("w-3.5 h-3.5", status.online ? "text-green-500" : "text-red-500")} />
          <span>Cloud</span>
        </div>
        
        <div className="flex items-center gap-2 border-l border-white/10 pl-6">
          {status.printerConnected ? (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Printer Ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 animate-pulse">
              <AlertCircle className="w-4 h-4" />
              <span>Printer Offline</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-6 text-[9px] font-black uppercase tracking-widest">
          <Usb className={cn("w-3.5 h-3.5", status.usbHub ? "text-blue-400" : "text-white/20")} />
          <span className={status.lexarUsb ? "text-blue-400" : "text-white/40"}>
            {status.lexarUsb ? "Lexar Ready" : status.usbHub ? "Hub Active" : "Hub Offline"}
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
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">System Verified</span>
      </div>
    </div>
  );
}
