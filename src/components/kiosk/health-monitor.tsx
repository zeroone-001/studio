
"use client";

import React, { useState, useEffect } from "react";
import { Printer, Wallet, Wifi, ShieldCheck, Database, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export function HealthMonitor() {
  const [status, setStatus] = useState({
    online: true,
    storage: "94%",
    memory: "low",
    printer: "ready",
  });

  useEffect(() => {
    const checkHealth = () => {
      setStatus(prev => ({
        ...prev,
        online: navigator.onLine,
      }));
    };

    const interval = setInterval(checkHealth, 5000);
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
      <div className="flex items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Wifi className={cn("w-2.5 h-2.5", status.online ? "text-green-500" : "text-red-500")} />
          <span>{status.online ? "Online" : "Offline Mode"}</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Database className="w-2.5 h-2.5 text-blue-400" />
          <span>Disk: {status.storage}</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-white tracking-tighter">
          <Printer className="w-2.5 h-2.5 text-primary" />
          <span>Printer: {status.printer}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 opacity-20">
        <ShieldCheck className="w-2.5 h-2.5 text-green-500" />
        <span className="text-[8px] font-black uppercase tracking-widest text-white">System Secured</span>
      </div>
    </div>
  );
}
