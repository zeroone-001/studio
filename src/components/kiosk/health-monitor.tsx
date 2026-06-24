
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Printer, Wallet, Wifi, ShieldCheck, Database, RefreshCcw, Video, Usb, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionStore } from "@/lib/kiosk/persistence";
import { KioskLogger } from "@/lib/kiosk/logger";

/**
 * Health Monitor component.
 * Automatically detects hardware state (Camera, UGreen Hub, Printer, Bill Acceptor).
 * Optimized for Honor Pad X10 via UGreen 7-in-1 Hub using WebUSB for printer monitoring.
 */
export function HealthMonitor() {
  const [status, setStatus] = useState({
    online: true,
    storage: "0MB",
    storagePercent: "0",
    syncPending: 0,
    printer: "HUB PENDING",
    camera: false,
    usbHub: false,
    billAcceptor: false,
    printerDevice: null as USBDevice | null
  });

  const checkHealth = useCallback(async () => {
    const stats = SessionStore.getStorageStats();
    const queue = SessionStore.getSyncQueue();
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCam = devices.some(d => d.kind === 'videoinput');
      
      let hasUsb = false;
      let hasSerial = false;
      let detectedPrinter: USBDevice | null = null;

      if (typeof navigator !== 'undefined') {
        if ('usb' in navigator) {
          const usbDevices = await navigator.usb.getDevices();
          hasUsb = usbDevices.length > 0;
          // Look for common photo printer classes or known PIDs/VIDs if needed
          // For now, we identify the first paired USB device as a potential printer
          detectedPrinter = usbDevices[0] || null;
        }
        if ('serial' in navigator) {
          // @ts-ignore
          const serialPorts = await navigator.serial.getPorts();
          hasSerial = serialPorts.length > 0;
        }
      }
      
      setStatus(prev => ({
        ...prev,
        online: typeof navigator !== 'undefined' ? navigator.onLine : true,
        storage: `${stats.usedMB}MB`,
        storagePercent: stats.percent,
        syncPending: queue.length,
        printer: detectedPrinter ? (detectedPrinter.productName || "PRINTER READY") : (hasUsb ? "HUB ACTIVE" : "HUB PENDING"),
        camera: hasCam,
        usbHub: hasUsb,
        billAcceptor: hasSerial,
        printerDevice: detectedPrinter
      }));

    } catch (e) {
      // Handshake silent retry
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(checkHealth, 3000);
    checkHealth();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', checkHealth);
      window.addEventListener('offline', checkHealth);
      
      if ('usb' in navigator) {
        const handleConnect = (event: USBConnectionEvent) => {
          KioskLogger.log('info', 'Hardware', `USB Device Connected: ${event.device.productName || 'Unknown'}`);
          checkHealth();
        };
        const handleDisconnect = (event: USBConnectionEvent) => {
          KioskLogger.log('warn', 'Hardware', `USB Device Disconnected: ${event.device.productName || 'Unknown'}`);
          checkHealth();
        };

        navigator.usb.addEventListener('connect', handleConnect);
        navigator.usb.addEventListener('disconnect', handleDisconnect);

        return () => {
          navigator.usb.removeEventListener('connect', handleConnect);
          navigator.usb.removeEventListener('disconnect', handleDisconnect);
          clearInterval(interval);
        };
      }
    }

    return () => {
      clearInterval(interval);
    };
  }, [checkHealth]);

  return (
    <div className="fixed bottom-2 left-6 right-6 z-[40] flex justify-between items-center pointer-events-none select-none">
      <div className="flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity pointer-events-auto bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full border border-white/5">
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Wifi className={cn("w-2.5 h-2.5", status.online ? "text-green-500" : "text-red-500")} />
          <span>Cloud</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Usb className={cn("w-2.5 h-2.5", status.usbHub ? "text-blue-400" : "text-white/20")} />
          <span>UGreen Hub</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Banknote className={cn("w-2.5 h-2.5", status.billAcceptor ? "text-green-500" : "text-white/20")} />
          <span>Bill Acceptor: {status.billAcceptor ? "LINKED" : "OFFLINE"}</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Printer className={cn("w-2.5 h-2.5", status.printerDevice ? "text-primary" : "text-white/20")} />
          <span>{status.printer}</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Database className={cn("w-2.5 h-2.5", parseInt(status.storagePercent) > 80 ? "text-red-500" : "text-blue-400")} />
          <span>Cache: {status.storagePercent}%</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 opacity-20">
        <ShieldCheck className="w-2.5 h-2.5 text-green-500" />
        <span className="text-[8px] font-black uppercase tracking-widest text-white">Hardware Hub Active</span>
      </div>
    </div>
  );
}
