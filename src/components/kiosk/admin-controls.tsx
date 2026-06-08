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
  Printer,
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
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KioskLogger } from "@/lib/kiosk/logger";
import { SessionStore } from "@/lib/kiosk/persistence";

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
  isDevMode: boolean;
  onToggleDevMode: () => void;
  isCameraActive?: boolean;
  onTestCamera?: () => void;
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
  onTestCamera
}: AdminControlsProps) {
  const [view, setView] = useState<'main' | 'logs' | 'diag'>('main');
  const [stats, setStats] = useState({ used: '0MB', percent: '0', queue: 0 });
  const [isMaintenance, setIsMaintenance] = useState(false);
  const logs = KioskLogger.getLogs();

  useEffect(() => {
    const updateStats = () => {
      const s = SessionStore.getStorageStats();
      const q = SessionStore.getSyncQueue().filter(i => i.status === 'pending');
      setStats({ used: s.usedMB, percent: s.percent, queue: q.length });
    };
    const interval = setInterval(updateStats, 2000);
    updateStats();
    return () => clearInterval(interval);
  }, []);

  const states: { id: SessionState; label: string; icon: any }[] = [
    { id: "welcome", label: "Intro", icon: PlayCircle },
    { id: "payment", label: "Cash", icon: CreditCard },
    { id: "setup", label: "Setup", icon: Palette },
    { id: "capturing", label: "Camera", icon: Camera },
    { id: "review", label: "Review", icon: ImageIcon },
    { id: "decorating", label: "Decor", icon: ImageIcon },
    { id: "consent", label: "Privacy", icon: ShieldAlert },
    { id: "printing", label: "Print/QR", icon: Printer },
  ];

  return (
    <div className="fixed bottom-16 right-4 z-[100] flex flex-col items-end gap-2 scale-90 sm:scale-100 origin-bottom-right">
      <div className="bg-zinc-950/95 backdrop-blur-md border-2 border-primary/50 p-4 shadow-[0_0_30px_rgba(255,51,153,0.3)] w-80 animate-in slide-in-from-right-4">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
             <button onClick={() => setView('main')} className={cn("text-[10px] font-black uppercase tracking-tighter", view === 'main' ? "text-primary" : "text-white/40")}>Control</button>
             <button onClick={() => setView('logs')} className={cn("text-[10px] font-black uppercase tracking-tighter", view === 'logs' ? "text-primary" : "text-white/40")}>Logs</button>
             <button onClick={() => setView('diag')} className={cn("text-[10px] font-black uppercase tracking-tighter", view === 'diag' ? "text-primary" : "text-white/40")}>Diag</button>
          </div>
          <button onClick={onExitOwnerMode} className="text-white/40 hover:text-white">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {view === 'main' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 bg-blue-600/10 border border-blue-500/30 p-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[8px] font-black uppercase text-blue-400">
                  <Code2 className="w-3 h-3" /> Dev Mode
                </div>
                <button onClick={onToggleDevMode} className="text-blue-400">
                  {isDevMode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5 opacity-40" />}
                </button>
              </div>
              <div className="flex-1 bg-yellow-600/10 border border-yellow-500/30 p-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[8px] font-black uppercase text-yellow-400">
                  <ShieldCheck className="w-3 h-3" /> Maint.
                </div>
                <button onClick={() => setIsMaintenance(!isMaintenance)} className="text-yellow-400">
                  {isMaintenance ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5 opacity-40" />}
                </button>
              </div>
            </div>

            <button 
              onClick={onTestCamera} 
              className={cn(
                "w-full py-3 text-[10px] font-black uppercase flex items-center justify-center gap-2 border-2 transition-all",
                currentStatus === 'test-camera' ? "bg-primary border-primary text-white" : "bg-white/5 border-white/20 text-white/60"
              )}
            >
              <Sparkles className="w-4 h-4" /> Visual Test Mode
            </button>

            {/* Owner access to skip payment and jump to packages */}
            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => onBypassPayment(50)} className="bg-primary/20 border border-primary/40 py-2 text-[9px] font-black uppercase">P50 Bypass</button>
               <button onClick={() => onBypassPayment(100)} className="bg-primary/20 border border-primary/40 py-2 text-[9px] font-black uppercase">P100 Bypass</button>
            </div>

            <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto scrollbar-hide">
              {states.map((state) => (
                <button
                  key={state.id}
                  onClick={() => onJumpTo(state.id)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 text-[8px] font-bold uppercase border-l-2",
                    currentStatus === state.id ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-transparent text-white/60"
                  )}
                >
                  <state.icon className="w-2.5 h-2.5" />
                  {state.label}
                </button>
              ))}
            </div>
            
            <button onClick={onReset} className="w-full bg-red-500/10 border border-red-500/30 py-2 text-[10px] font-black uppercase text-red-500 flex items-center justify-center gap-2">
              <RefreshCcw className="w-3 h-3" /> Emergency Reset
            </button>
          </div>
        )}

        {view === 'logs' && (
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-white/40 uppercase">Recovery Logs</span>
                <button onClick={() => KioskLogger.clear()} className="text-red-500"><Trash2 className="w-3 h-3" /></button>
             </div>
             <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                {logs.map((log, i) => (
                  <div key={i} className="text-[7px] border-b border-white/5 pb-2">
                     <div className="flex justify-between text-white/40">
                        <span>{log.module}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                     </div>
                     <p className={cn(log.level === 'error' ? "text-red-400" : "text-white/80")}>{log.message}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'diag' && (
          <div className="space-y-4">
             <div className="bg-white/5 p-3 space-y-2">
                <div className="flex justify-between text-[8px] font-bold uppercase">
                   <span className="text-white/40">Storage Cache</span>
                   <span>{stats.used} ({stats.percent}%)</span>
                </div>
                <div className="flex justify-between text-[8px] font-bold uppercase">
                   <span className="text-white/40">Pending Sync</span>
                   <span className={cn(stats.queue > 0 ? "text-primary" : "text-white/40")}>{stats.queue} Items</span>
                </div>
                <div className="flex justify-between text-[8px] font-bold uppercase">
                   <span className="text-white/40">Hardware Stream</span>
                   <span className={isCameraActive ? "text-green-500" : "text-red-500"}>{isCameraActive ? "CONNECTED" : "OFFLINE"}</span>
                </div>
                <div className="flex justify-between text-[8px] font-bold uppercase">
                   <span className="text-white/40">USB Storage</span>
                   <span className={usbStatus === 'connected' ? "text-blue-400" : "text-white/20"}>{usbStatus.toUpperCase()}</span>
                </div>
             </div>
             <button onClick={onSetupUsb} className="w-full bg-white/5 border border-white/10 py-2 text-[9px] font-black uppercase flex items-center justify-center gap-2">
                <Usb className="w-3 h-3" /> Mount External Gallery
             </button>
             <button onClick={() => window.location.reload()} className="w-full bg-zinc-800 py-2 text-[9px] font-black uppercase">Reload Engine</button>
          </div>
        )}
      </div>
    </div>
  );
}
