
"use client";

import React, { useState, useEffect } from "react";
import { 
  LogOut, 
  RefreshCcw, 
  Activity,
  Trash2,
  CheckCircle2,
  FolderOpen,
  Usb,
  Cpu,
  Share2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KioskLogger } from "@/lib/kiosk/logger";
import { SessionState } from "@/lib/kiosk/constants";

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
  cameras?: MediaDeviceInfo[];
  selectedCameraId?: string;
  onSelectCamera?: (id: string) => void;
  runtimeStatus?: {
    photoGenerated: string;
    blobCreated: string;
    photoSaved: string;
    intentTriggered: string;
    intentAcknowledged: string;
    cloudSync: string;
    sessionCreated: string;
    fileCreated: string;
    navigatorShareStarted: string;
    navigatorShareResolved: string;
    navigatorShareRejected: string;
    nokoprintOpened: string;
    lastErrorMessage: string;
  };
}

export function AdminControls({ 
  currentStatus, 
  onJumpTo, 
  onReset, 
  onExitOwnerMode,
  onSimulateCash,
  onBypassPayment,
  usbStatus,
  onSetupUsb,
  runtimeStatus
}: AdminControlsProps) {
  const [view, setView] = useState<'main' | 'logs' | 'diag'>('main');
  const [intentStatus, setIntentStatus] = useState("checking");
  const logs = KioskLogger.getLogs();

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      if (navigator.share && navigator.canShare) {
        setIntentStatus("READY");
      } else {
        setIntentStatus("UNSUPPORTED");
      }
    }
  }, []);

  const handleTestIntent = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        KioskLogger.log('info', 'PRINT', 'Testing Android Share Intent...', 'PENDING');
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
          await navigator.share({
            files: [file],
            title: 'Test Intent',
            text: 'Testing NokoPrint Bridge'
          });
          KioskLogger.log('info', 'PRINT', 'Test Intent Dispatched.', 'SUCCESS');
        }, 'image/jpeg');
      } catch (e: any) {
        KioskLogger.log('warn', 'PRINT', 'Test Intent Aborted.', 'FAILED', e.message);
      }
    }
  };

  return (
    <div className="fixed bottom-16 right-4 z-[100] flex flex-col items-end gap-2 scale-90 sm:scale-100 origin-bottom-right">
      <div className="bg-zinc-950/95 border-2 border-primary/50 p-4 shadow-2xl w-96 animate-in slide-in-from-right-4">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
             <button onClick={() => setView('main')} className={cn("text-[9px] font-black uppercase tracking-widest", view === 'main' ? "text-primary" : "text-white/40")}>Control</button>
             <button onClick={() => setView('logs')} className={cn("text-[9px] font-black uppercase tracking-widest", view === 'logs' ? "text-primary" : "text-white/40")}>Trace</button>
             <button onClick={() => setView('diag')} className={cn("text-[9px] font-black uppercase tracking-widest", view === 'diag' ? "text-primary" : "text-white/40")}>System</button>
          </div>
          <button onClick={onExitOwnerMode} className="text-white/40 hover:text-white"><LogOut className="w-4 h-4" /></button>
        </div>

        {view === 'main' && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
            {runtimeStatus && (
              <div className="bg-white/5 border border-primary/20 p-3 rounded-lg space-y-2">
                <h3 className="text-[8px] font-black uppercase text-primary italic mb-2 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> PRINT PIPELINE (LIVE)
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {Object.entries(runtimeStatus).filter(([k]) => k !== 'lastErrorMessage').map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center px-1">
                      <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <div className="flex items-center gap-1">
                        {val === 'SUCCESS' ? <CheckCircle2 className="w-2.5 h-2.5 text-green-500" /> : val === 'FAILED' ? <AlertCircle className="w-2.5 h-2.5 text-red-500" /> : <Loader2 className="w-2.5 h-2.5 text-white/10 animate-spin" />}
                        <span className={cn("text-[8px] font-black italic", val === 'SUCCESS' ? "text-green-500" : val === 'FAILED' ? "text-red-500" : "text-white/20")}>{val}</span>
                      </div>
                    </div>
                  ))}
                  {runtimeStatus.lastErrorMessage && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 text-[7px] text-red-400 font-mono break-words">
                      ERROR: {runtimeStatus.lastErrorMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase text-white/40">State Navigation</label>
              <div className="grid grid-cols-2 gap-2">
                 {(["welcome", "payment", "setup", "review", "decorating", "printing", "thankyou"] as SessionState[]).map(state => (
                   <button 
                    key={state}
                    onClick={() => onJumpTo(state)} 
                    className={cn(
                      "py-2 text-[8px] font-black uppercase border",
                      currentStatus === state ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-white/60"
                    )}
                   >
                     Jump: {state}
                   </button>
                 ))}
              </div>
            </div>

            <button onClick={onReset} className="w-full bg-red-500/10 border border-red-500/30 py-3 text-[10px] font-black uppercase text-red-500 flex items-center justify-center gap-2">
              <RefreshCcw className="w-3 h-3" /> Emergency Reset
            </button>
          </div>
        )}

        {view === 'logs' && (
          <div className="space-y-3">
             <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-black text-primary uppercase flex items-center gap-2"><Activity className="w-3 h-3" /> System Trace</span>
                <button onClick={() => KioskLogger.clear()} className="text-red-500 hover:scale-110 transition-transform"><Trash2 className="w-3 h-3" /></button>
             </div>
             <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                {logs.length === 0 && <div className="text-[9px] italic text-white/20 text-center py-10">Waiting for events...</div>}
                {logs.map((log, i) => (
                  <div key={i} className={cn("text-[8px] p-2 rounded-lg border", log.status === 'SUCCESS' ? "bg-green-500/5 border-green-500/20" : log.status === 'FAILED' ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/5")}>
                     <div className="flex justify-between items-center mb-1">
                        <span className={cn("font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter", log.status === 'SUCCESS' ? "bg-green-500 text-white" : log.status === 'FAILED' ? "bg-red-500 text-white" : "bg-zinc-800 text-zinc-400")}>
                          {log.module}
                        </span>
                        <span className="text-white/20">{new Date(log.timestamp).toLocaleTimeString()}</span>
                     </div>
                     <p className="font-bold text-white/80">{log.message}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'diag' && (
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-white/40 flex items-center gap-2">
                  <Cpu className="w-3 h-3" /> System Components
                </label>
                <div className="bg-black/40 border border-white/10 p-3 space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-[9px] font-bold text-white/40 uppercase">Android Share Intent</span>
                     <span className={cn("text-[9px] font-black italic", intentStatus === 'READY' ? "text-green-500" : "text-red-500")}>{intentStatus}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[9px] font-bold text-white/40 uppercase">Lexar Storage</span>
                     <span className={cn("text-[9px] font-black italic", usbStatus === 'connected' ? "text-green-500" : "text-white/20")}>{usbStatus.toUpperCase()}</span>
                   </div>
                </div>
             </div>

             <button onClick={handleTestIntent} className="w-full py-4 text-[10px] font-black uppercase flex items-center justify-center gap-2 border-2 bg-primary/20 border-primary/40 text-primary hover:bg-primary/30">
               <Share2 className="w-4 h-4" /> TEST ANDROID INTENT
             </button>

             <button onClick={onSetupUsb} className={cn("w-full py-4 text-[10px] font-black uppercase flex items-center justify-center gap-2 border-2", usbStatus === 'connected' ? "bg-blue-500 border-blue-400 text-white" : "bg-white/5 border-white/10 text-white/60")}>
              {usbStatus === 'connected' ? <CheckCircle2 className="w-4 h-4" /> : <FolderOpen className="w-4 h-4" />}
              {usbStatus === 'connected' ? "LEXAR READY" : "MOUNT LEXAR USB"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
