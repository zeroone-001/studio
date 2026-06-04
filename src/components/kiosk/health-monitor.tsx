
"use client";

import React, { useState, useEffect } from "react";
import { Printer, Wallet, Wifi, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function HealthMonitor() {
  const [status, setStatus] = useState({
    printer: "online",
    validator: "ready",
    sync: "usb-active",
  });

  // Mock health check interval
  useEffect(() => {
    const interval = setInterval(() => {
      // Logic to check printer/validator status would go here
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[10px] uppercase tracking-tighter opacity-40">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Printer className="w-3 h-3" />
          <span>Printer: {status.printer}</span>
        </div>
        <div className="flex items-center gap-1">
          <Wallet className="w-3 h-3" />
          <span>Validator: {status.validator}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-primary" />
          <span>USB SYNC ACTIVE</span>
        </div>
        <div className="flex items-center gap-1">
          <Wifi className="w-3 h-3" />
          <span>Cloud Sync: Syncing</span>
        </div>
      </div>
    </div>
  );
}
