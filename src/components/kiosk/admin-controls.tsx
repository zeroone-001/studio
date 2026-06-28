
"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  RefreshCcw, 
  LogOut, 
  PlayCircle, 
  CreditCard, 
  Camera, 
  Image as ImageIcon, 
  Printer as PrinterIcon,
  Palette,
  Usb,
  Code2,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Zap,
  Activity,
  Trash2,
  AlertTriangle,
  Sparkles,
  HardDrive,
  Database,
  Wifi,
  ShieldCheck,
  Video,
  MonitorSmartphone,
  FolderOpen,
  CheckCircle2,
  Printer,
  Banknote,
  Cpu,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KioskLogger } from "@/lib/kiosk/logger";
import { SessionStore } from "@/lib/kiosk/persistence";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SessionState = "welcome" | "payment" | "setup" | "capturing" | "review" | "decorating" | "consent" | "printing" | "test-camera";

interface AdminControlsProps {
  currentStatus: SessionState;
  onJumpTo: (state: SessionState) => void;
  onReset: () => void;
  onExitOwnerMode: () => void;
  hasPackage: boolean;
  onSimulateCash: (amount: number) => void;
  onBypassPayment: (pkg: 50 | 100) => void;
  usbStatus: "connected" | "disconnected";
  onSetupUsb: () => void;
  onSetupBillAcceptor: () => void;
  isDevMode: boolean;
  onToggleDevMode: () => void;
  isCameraActive?: boolean;
  onTestCamera?: () => void;
  cameras?: MediaDeviceInfo[];
  selectedCameraId?: string;
  onSelectCamera?: (id: string) => void;
}

export function AdminControls({ 
  currentStatus, 
  onJumpTo, 
  onReset, 
  onExitOwnerMode,
  onBypassPayment,
  usbStatus,
  onSetupUsb,
  isDevMode,
  onToggleDevMode,
  isCameraActive = false,
  onTestCamera,
  cameras = [],
  selectedCameraId,
  onSelectCamera
}: AdminControlsProps) {
  const [view, setView] = useState<'main' | 'logs' | 'diag'>('main');
  const logs = KioskLogger.getLogs();

  return (
    <div className="fixed bottom-16 right-4 z-[100] flex flex-col items-end gap-2 scale-90 sm:scale-100 origin-bottom-right">
      <div className="bg-zinc-950/95 border-2 border-primary/50 p-4 shadow-2xl w-96 animate-in slide-in-from-right-4">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
             <button onClick={() => setView('main')} className={cn("text-[9px] font-black uppercase tracking-widest", view === 'main' ? "text-primary" : "text-white/40")}>Control</button>
             <button onClick={() => setView('logs')} className={cn("text-[9px] font-black uppercase tracking-widest", view === 'logs' ? "text-primary" : "text-white/40")}>Diagnostics</button>
             <button onClick={() => setView('diag')} className={cn("text-[9px] font-black uppercase tracking-widest", view === 'diag' ? "text-primary" : "text-white/40")}>Hardware</button>
          </div>
          <button onClick={onExitOwnerMode} className="text-white/40 hover:text-white"><LogOut className="w-4 h-4" /></button>
        </div>

        {view === 'main' && (
          <div className="space-y-4">
            <button onClick={onTestCamera} className="w-full py-4 text-[10px] font-black uppercase flex items-center justify-center gap-2 bg-white/5 border-2 border-white/10">
              <MonitorSmartphone className="w-4 h-4" /> Visual Test Mode
            </button>
            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => onBypassPayment(50)} className="bg-primary/20 border border-primary/40 py-2 text-[9px] font-black uppercase">P50 Bypass</button>
               <button onClick={() => onBypassPayment(100)} className="bg-primary/20 border border-primary/40 py-2 text-[9px] font-black uppercase">P100 Bypass</button>
            </div>
            <button onClick={onReset} className="w-full bg-red-500/10 border border-red-500/30 py-2 text-[10px] font-black uppercase text-red-500">Emergency Reset</button>
          </div>
        )}

        {view === 'logs' && (
          <div className="space-y-3">
             <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-black text-primary uppercase flex items-center gap-2"><Activity className="w-3 h-3" /> Runtime Trace</span>
                <button onClick={() => KioskLogger.clear()} className="text-red-500"><Trash2 className="w-3 h-3" /></button>
             </div>
             <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                {logs.length === 0 && <div className="text-[9px] italic text-white/20 text-center py-10">No diagnostic data available.</div>}
                {logs.map((log, i) => (
                  <div key={i} className={cn("text-[8px] p-2 rounded-lg border", log.status === 'SUCCESS' ? "bg-green-500/5 border-green-500/20" : log.status === 'FAILED' ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/5")}>
                     <div className="flex justify-between items-center mb-1">
                        <span className={cn("font-black px-1.5 py-0.5 rounded-sm", log.status === 'SUCCESS' ? "bg-green-500 text-white" : log.status === 'FAILED' ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400")}>
                          {log.module}
                        </span>
                        <span className="text-white/20">{new Date(log.timestamp).toLocaleTimeString()}</span>
                     </div>
                     <p className="font-bold text-white/80">{log.message}</p>
                     {log.error && <p className="text-red-400 mt-1 italic font-medium">ERROR: {log.error}</p>}
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'diag' && (
          <div className="space-y-4">
             <div className="space-y-2">
              <label className="text-[8px] font-black uppercase text-white/40">Video Source</label>
              <Select value={selectedCameraId} onValueChange={onSelectCamera}>
                <SelectTrigger className="bg-white/5 border-white/10 text-[10px] h-10 uppercase font-bold">
                  <SelectValue placeholder="No Camera Detected" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/20">
                  {cameras.map((camera) => (
                    <SelectItem key={camera.deviceId} value={camera.deviceId} className="text-[10px] uppercase font-bold">
                      {camera.label || `Camera ${camera.deviceId.slice(0, 5)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button onClick={onSetupUsb} className={cn("w-full py-4 text-[10px] font-black uppercase flex items-center justify-center gap-2 border-2", usbStatus === 'connected' ? "bg-blue-500 border-blue-400 text-white" : "bg-white/5 border-white/10 text-white/60")}>
              {usbStatus === 'connected' ? <CheckCircle2 className="w-4 h-4" /> : <FolderOpen className="w-4 h-4" />}
              {usbStatus === 'connected' ? "LEXAR USB READY" : "MOUNT LEXAR USB"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
