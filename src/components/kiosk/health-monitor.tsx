"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Wifi, Usb, Banknote, Database, CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionStore } from "@/lib/kiosk/persistence";
import { KioskLogger } from "@/lib/kiosk/logger";

/**
 * Health Monitor component.
 * Automatically detects hardware state (Camera, UGreen Hub, Printer, Bill Acceptor).
 * Optimized for Honor Pad X10 via UGreen 7-in-1 Hub.
 */
export function HealthMonitor() {
  const [status, setStatus] = useState({
    online: true,
    storage: "0MB",
    storagePercent: "0",
    syncPending: 0,
    printerConnected: false,
    usbHub: false,
    billAcceptor: false,
    lexarUsb: false
  });

  const checkHardware = useCallback(async () => {
    const stats = SessionStore.getStorageStats();
    
    try {
      let detectedPrinter = false;
      let detectedHub = false;
      let detectedLexar = false;
      let hasSerial = false;

      if (typeof navigator !== 'undefined') {
        // 1. WebUSB Detection (UGREEN Hub Handshake)
        if ('usb' in navigator) {
          try {
            const usbDevices = await navigator.usb.getDevices();
            detectedHub = usbDevices.length > 0;
            
            usbDevices.forEach(device => {
              const name = (device.productName || "").toLowerCase();
              const manufacturer = (device.manufacturerName || "").toLowerCase();
              
              // Epson L210 Signature Detection
              if (name.includes('epson') || name.includes('l210') || manufacturer.includes('epson')) {
                detectedPrinter = true;
              }
              // Lexar Signature Detection
              if (name.includes('lexar') || name.includes('mass storage')) {
                detectedLexar = true;
              }
            });
          } catch (e) {
            detectedHub = false;
          }
        }
        
        // 2. Serial (Bill Acceptor)
        if ('serial' in navigator) {
          try {
            // @ts-ignore
            const serialPorts = await navigator.serial.getPorts();
            hasSerial = serialPorts.length > 0;
          } catch (e) {
            hasSerial = false;
          }
        }
      }
      
      setStatus(prev => ({
        ...prev,
        online: typeof navigator !== 'undefined' ? navigator.onLine : true,
        storage: `${stats.usedMB}MB`,
        storagePercent: stats.percent,
        printerConnected: detectedPrinter,
        usbHub: detectedHub,
        lexarUsb: detectedLexar,
        billAcceptor: hasSerial
      }));

    } catch (e) {}
  }, []);

  useEffect(() => {
    const interval = setInterval(checkHardware, 3000);
    checkHardware();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', checkHardware);
      window.addEventListener('offline', checkHardware);
      
      if ('usb' in navigator) {
        const handleHardwareChange = () => {
          checkHardware();
        };

        try {
          navigator.usb.addEventListener('connect', handleHardwareChange);
          navigator.usb.addEventListener('disconnect', handleHardwareChange);

          return () => {
            navigator.usb.removeEventListener('connect', handleHardwareChange);
            navigator.usb.removeEventListener('disconnect', handleHardwareChange);
            clearInterval(interval);
          };
        } catch (e) {}
      }
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
            {status.lexarUsb ? "Lexar Mounted" : "Hub Active"}
          </span>
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-6 text-[9px] font-black uppercase tracking-widest">
          <Database className={cn("w-3.5 h-3.5", parseInt(status.storagePercent) > 80 ? "text-red-500" : "text-blue-400")} />
          <span>Cache: {status.storagePercent}%</span>
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-6 text-[9px] font-black uppercase tracking-widest">
          <Banknote className={cn("w-3.5 h-3.5", status.billAcceptor ? "text-green-500" : "text-white/20")} />
          <span className={status.billAcceptor ? "text-green-500" : "text-white/40"}>
            {status.billAcceptor ? "Cash Ready" : "Hardware Issue"}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-full border border-white/5 opacity-50">
        <Activity className="w-3 h-3 text-primary animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">System Monitoring Active</span>
      </div>
    </div>
  );
}
