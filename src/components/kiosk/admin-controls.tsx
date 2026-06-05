
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
  Smile,
  ShieldAlert,
  Zap,
  Activity,
  FileText,
  Trash2,
  AlertTriangle,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  HardDrive
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
  const logs = KioskLogger.getLogs();

  useEffect(() => {
    const updateStats = () => {
      const s = SessionStore.getStorageStats();
      const q = SessionStore.getSyncQueue();
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

  const handleForceReload = () => {
    KioskLogger.log('warn', 'Admin', 'Force reload triggered by owner.');
    window.location.reload();
  };

  const handleClearQueue = () => {
    localStorage.removeItem('jnl_kiosk_sync_queue');
    KioskLogger.log('warn', 'Admin', 'Sync queue cleared by owner.');
  };

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
            <div className="bg-blue-600/10 border border-blue-500/30 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-400">
                <Code2 className="w-3 h-3" /> Dev Mode
              </div>
              <button onClick={onToggleDevMode} className="text-blue-400">
                {isDevMode ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 opacity-40" />}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={onTestCamera} 
                  className={cn(
                    "w-full py-4 text-[10px] font-black uppercase flex items-center justify-center gap-2 border-2 transition-all",
                    currentStatus === 'test-camera' 
                      ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(255,51,153,0.4)]" 
                      : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10"
                  )}
                >
                  <Sparkles className="w-4 h-4" /> Live Visual Diagnostic
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => onBypassPayment(50)} className="bg-primary/20 border border-primary/40 py-2 text-[9px] font-black uppercase flex items-center justify-center gap-1">
                 <Zap className="w-3 h-3" /> P50 Test
               </button>
               <button onClick={() => onBypassPayment(100)} className="bg-primary/20 border border-primary/40 py-2 text-[9px] font-black uppercase flex items-center justify-center gap-1">
                 <Zap className="w-3 h-3" /> P100 Test
               </button>
            </div>

            <button onClick={onSetupUsb} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2 text-[10px] font-black uppercase flex items-center justify-center gap-2">
              <Usb className="w-3 h-3" /> {usbStatus === 'connected' ? "Remount Storage" : "Mount Storage"}
            </button>

            <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto scrollbar-hide pr-1">
              {states.map((state) => (
                <button
                  key={state.id}
                  onClick={() => onJumpTo(state.id)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 text-[8px] font-bold uppercase transition-all border-l-2",
                    currentStatus === state.id 
                      ? "bg-primary/20 border-primary text-primary" 
                      : "bg-white/5 border-transparent text-white/60 hover:bg-white/10"
                  )}
                >
                  <state.icon className="w-2.5 h-2.5" />
                  {state.label}
                </button>
              ))}
            </div>
            
            <button onClick={onReset} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 py-2 text-[10px] font-black uppercase flex items-center justify-center gap-2 text-red-500">
              <RefreshCcw className="w-3 h-3" /> Force Reset
            </button>
          </div>
        )}

        {view === 'logs' && (
          <div className="space-y-3">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-white/40 uppercase">System Events</span>
                <button onClick={() => KioskLogger.clear()} className="text-[9px] font-bold text-red-500 uppercase"><Trash2 className="w-3 h-3" /></button>
             </div>
             <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                {logs.length === 0 ? (
                  <p className="text-[8px] text-white/20 italic text-center py-8">No events logged.</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="text-[8px] border-b border-white/5 pb-2">
                       <div className="flex justify-between text-white/40 mb-1">
                          <span>{log.module}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                       </div>
                       <p className={cn(log.level === 'error' ? "text-red-400" : "text-white/80")}>{log.message}</p>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        {view === 'diag' && (
          <div className="space-y-4">
             <div className="bg-white/5 p-3 space-y-3">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                   <div className="flex items-center gap-1.5 text-white/40"><HardDrive className="w-2.5 h-2.5" /> Storage Used</div>
                   <span className={cn(parseInt(stats.percent) > 85 ? "text-red-500" : "text-white")}>{stats.used} ({stats.percent}%)</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                   <div className="flex items-center gap-1.5 text-white/40"><RefreshCcw className="w-2.5 h-2.5" /> Sync Queue</div>
                   <span className={cn(stats.queue > 0 ? "text-primary" : "text-white/40")}>{stats.queue} Items</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                   <span className="text-white/40">Camera Stream</span>
                   <span className={cn(isCameraActive ? "text-green-500" : "text-red-500")}>
                      {isCameraActive ? "READY" : "OFFLINE"}
                   </span>
                </div>
             </div>
             
             <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={handleForceReload} 
                  className="w-full bg-white/10 py-2 text-[9px] font-black uppercase flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-3 h-3" /> Reload App
                </button>
                <button 
                  onClick={handleClearQueue} 
                  className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-2 text-[9px] font-black uppercase flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3 h-3" /> Clear Sync Queue
                </button>
             </div>

             <div className="p-2 border border-yellow-500/20 bg-yellow-500/5 rounded">
                <p className="text-[8px] font-bold text-yellow-500/80 leading-tight uppercase">
                  <AlertTriangle className="w-2.5 h-2.5 inline mr-1" /> Use force actions only during maintenance or persistent freezes.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
