"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  LogOut, 
  RefreshCcw, 
  Activity,
  Trash2,
  CheckCircle2,
  Cpu,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Printer,
  ChevronUp,
  ChevronDown,
  GripHorizontal,
  Database,
  QrCode,
  HardDrive
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KioskLogger } from "@/lib/kiosk/logger";
import { SessionState } from "@/lib/kiosk/constants";

interface AdminControlsProps {
  currentStatus: SessionState;
  onJumpTo: (state: SessionState) => void;
  onReset: () => void;
  onExitOwnerMode: () => void;
  onSimulateCash: (amount: number) => void;
  onMountUsb: (handle: FileSystemDirectoryHandle) => void;
  usbHandle: FileSystemDirectoryHandle | null;
  runtimeStatus?: {
    photoGenerated: string;
    photoSaved: string;
    intentTriggered: string;
    intentAcknowledged: string;
    cloudSync: string;
    sessionCreated: string;
    fileCreated: string;
    fileSize: string;
    usbBackup: string;
    navigatorShareStarted: string;
    navigatorShareResolved: string;
    navigatorShareRejected: string;
    nokoprintOpened: string;
    secureContext: string;
    topLevelContext: string;
    userAgent: string;
    lastErrorMessage: string;
    savePath?: string;
    qrSourceUrl?: string;
    shareIntentPayload?: string;
    lastSaveError?: string;
  };
}

export function AdminControls({ 
  currentStatus, 
  onJumpTo, 
  onReset, 
  onExitOwnerMode,
  onSimulateCash,
  onMountUsb,
  usbHandle,
  runtimeStatus
}: AdminControlsProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [view, setView] = useState<'main' | 'logs' | 'diag'>('main');
  const [usbStatus, setUsbStatus] = useState("OFFLINE");
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const logs = KioskLogger.getLogs();

  useEffect(() => {
    const checkUsb = async () => {
      if ('usb' in navigator) {
        try {
          const devices = await navigator.usb.getDevices();
          setUsbStatus(devices.length > 0 ? "ONLINE" : "OFFLINE");
        } catch (e) {
          setUsbStatus("OFFLINE");
        }
      }
    };
    checkUsb();
    const interval = setInterval(checkUsb, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      isDragging.current = true;
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        dragOffset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }
    }
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    };
    const handlePointerUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const pairPrinter = async () => {
    if ('usb' in navigator) {
      try {
        // @ts-ignore
        await navigator.usb.requestDevice({ filters: [] });
        KioskLogger.log('info', 'HARDWARE', 'New USB Device Paired', 'SUCCESS');
      } catch (e) {
        KioskLogger.log('error', 'HARDWARE', 'USB Pairing Cancelled', 'FAILED');
      }
    }
  };

  const mountUsb = async () => {
    try {
      // @ts-ignore
      if (window.showDirectoryPicker) {
        // @ts-ignore
        const handle = await window.showDirectoryPicker();
        onMountUsb(handle);
        KioskLogger.log('info', 'HARDWARE', 'Lexar USB Mounted', 'SUCCESS');
      } else {
        KioskLogger.log('error', 'HARDWARE', 'FileSystem API Not Supported', 'FAILED');
      }
    } catch (e) {
      KioskLogger.log('error', 'HARDWARE', 'USB Mount Cancelled', 'FAILED');
    }
  };

  const testPackage = (amount: number) => {
    onSimulateCash(amount);
    onJumpTo('package-selection');
  };

  if (isMinimized) {
    return (
      <div 
        ref={panelRef}
        className="fixed z-[999] cursor-pointer"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onPointerDown={handlePointerDown}
      >
        <button 
          onClick={() => setIsMinimized(false)}
          className="drag-handle w-12 h-12 bg-primary border-2 border-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
        >
          <Zap className="w-6 h-6 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={panelRef}
      className="fixed z-[999] scale-90 sm:scale-100 touch-none"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onPointerDown={handlePointerDown}
    >
      <div className="bg-zinc-950/95 border-2 border-primary/50 shadow-2xl w-96 rounded-2xl overflow-hidden flex flex-col">
        <div className="drag-handle bg-primary/20 p-3 border-b border-white/10 flex items-center justify-between cursor-move">
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase text-primary italic tracking-widest">OWNER UTILITY</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(true)} className="p-1.5 text-white/40 hover:text-white"><ChevronUp className="w-4 h-4" /></button>
            <button onClick={onExitOwnerMode} className="p-1.5 text-white/40 hover:text-red-500"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex border-b border-white/10">
          <button onClick={() => setView('main')} className={cn("flex-1 py-3 text-[8px] font-black uppercase tracking-widest", view === 'main' ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-white/40 hover:text-white")}>Control</button>
          <button onClick={() => setView('logs')} className={cn("flex-1 py-3 text-[8px] font-black uppercase tracking-widest", view === 'logs' ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-white/40 hover:text-white")}>Trace</button>
          <button onClick={() => setView('diag')} className={cn("flex-1 py-3 text-[8px] font-black uppercase tracking-widest", view === 'diag' ? "bg-primary/10 text-primary border-b-2 border-primary" : "text-white/40 hover:text-white")}>System</button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-hide space-y-4">
          {view === 'main' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => testPackage(50)}
                  className="py-4 bg-primary/20 border border-primary/40 text-primary text-[10px] font-black uppercase italic rounded-xl hover:bg-primary/30 active:scale-95 transition-all"
                >
                  TEST ₱50 TIER
                </button>
                <button 
                  onClick={() => testPackage(100)}
                  className="py-4 bg-primary/20 border border-primary/40 text-primary text-[10px] font-black uppercase italic rounded-xl hover:bg-primary/30 active:scale-95 transition-all"
                >
                  TEST ₱100 TIER
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[7px] font-black uppercase text-white/40 tracking-widest">Hardware Ops</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={pairPrinter}
                    className="py-4 text-[9px] font-black uppercase flex items-center justify-center gap-2 border border-blue-500/30 bg-blue-500/5 text-blue-400 rounded-xl hover:bg-blue-500/10"
                  >
                    <Printer className="w-4 h-4" /> PAIR PRINTER
                  </button>
                  <button 
                    onClick={mountUsb}
                    className={cn(
                      "py-4 text-[9px] font-black uppercase flex items-center justify-center gap-2 border rounded-xl transition-all",
                      usbHandle ? "border-green-500/30 bg-green-500/5 text-green-400" : "border-amber-500/30 bg-amber-500/5 text-amber-400"
                    )}
                  >
                    <HardDrive className="w-4 h-4" /> {usbHandle ? "USB READY" : "MOUNT USB"}
                  </button>
                </div>
              </div>

              <button onClick={onReset} className="w-full bg-red-500/10 border border-red-500/30 py-3 text-[9px] font-black uppercase text-red-500 rounded-xl flex items-center justify-center gap-2">
                <RefreshCcw className="w-3 h-3" /> FULL SYSTEM RESET
              </button>
            </div>
          )}

          {view === 'logs' && (
            <div className="space-y-4">
               {runtimeStatus && (
                 <div className="bg-white/5 border border-primary/20 p-3 rounded-xl space-y-2">
                    <h3 className="text-[7px] font-black uppercase text-primary italic mb-2 flex items-center gap-2">
                      <Activity className="w-3 h-3" /> LIVE TRACE (HANDOFF)
                    </h3>
                    <div className="grid grid-cols-1 gap-1">
                      {Object.entries(runtimeStatus)
                        .filter(([k]) => ![
                          'userAgent', 'lastErrorMessage', 'secureContext', 'topLevelContext',
                          'savePath', 'qrSourceUrl', 'shareIntentPayload', 'lastSaveError'
                        ].includes(k))
                        .map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center px-1 border-b border-white/5 py-1">
                            <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <div className="flex items-center gap-1">
                              {val === 'SUCCESS' ? <CheckCircle2 className="w-2.5 h-2.5 text-green-500" /> : val === 'FAILED' ? <AlertCircle className="w-2.5 h-2.5 text-red-500" /> : <Loader2 className="w-2.5 h-2.5 text-white/10 animate-spin" />}
                              <span className={cn("text-[8px] font-black italic", val === 'SUCCESS' ? "text-green-500" : val === 'FAILED' ? "text-red-500" : "text-white/20")}>{val}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                 </div>
               )}

               {/* ACTUAL RUNTIME DIAGNOSTICS (SESSION AUDIT) */}
               {runtimeStatus && (
                 <div className="bg-black/60 border border-indigo-500/30 p-3 rounded-xl space-y-2">
                    <h3 className="text-[7px] font-black uppercase text-indigo-400 italic mb-2 flex items-center gap-2">
                      <Database className="w-3 h-3" /> SESSION AUDIT (LAST RUN)
                    </h3>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center py-1 border-b border-white/5 px-1">
                        <span className="text-[7px] text-white/40 uppercase">File Created?</span>
                        <span className={cn("text-[8px] font-black", runtimeStatus.fileCreated === 'SUCCESS' ? "text-green-500" : "text-red-500")}>
                          {runtimeStatus.fileCreated === 'SUCCESS' ? "TRUE" : "FALSE"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-white/5 px-1">
                        <span className="text-[7px] text-white/40 uppercase">File Size</span>
                        <span className="text-[8px] font-mono text-white/80">{runtimeStatus.fileSize || '0 bytes'}</span>
                      </div>
                      <div className="flex flex-col py-1 border-b border-white/5 px-1">
                        <span className="text-[7px] text-white/40 uppercase mb-0.5">Save Path</span>
                        <span className="text-[6px] font-mono text-indigo-300 break-all">{runtimeStatus.savePath || 'NONE'}</span>
                      </div>
                      <div className="flex flex-col py-1 border-b border-white/5 px-1">
                        <span className="text-[7px] text-white/40 uppercase mb-0.5">QR Source URL</span>
                        <span className="text-[6px] font-mono text-amber-300 break-all">{runtimeStatus.qrSourceUrl || 'NONE'}</span>
                      </div>
                      <div className="flex flex-col py-1 border-b border-white/5 px-1">
                        <span className="text-[7px] text-white/40 uppercase mb-0.5">Share Intent Payload</span>
                        <span className="text-[6px] font-mono text-emerald-300 break-all">{runtimeStatus.shareIntentPayload || 'NONE'}</span>
                      </div>
                      <div className="flex flex-col py-1 border-b border-white/5 px-1">
                        <span className="text-[7px] text-white/40 uppercase mb-0.5">Last Save Error</span>
                        <span className="text-[6px] font-mono text-red-400 break-all">{runtimeStatus.lastSaveError || 'NONE'}</span>
                      </div>
                      <div className="flex flex-col py-1 px-1">
                        <span className="text-[7px] text-white/40 uppercase mb-0.5">Last Print Error</span>
                        <span className="text-[6px] font-mono text-red-400 break-all">{runtimeStatus.lastErrorMessage || 'NONE'}</span>
                      </div>
                    </div>
                 </div>
               )}

               <div className="flex justify-between items-center px-1">
                  <span className="text-[8px] font-black text-white/40 uppercase">System Logs</span>
                  <button onClick={() => KioskLogger.clear()} className="text-red-500"><Trash2 className="w-3 h-3" /></button>
               </div>
               <div className="space-y-1">
                  {logs.slice(0, 5).map((log, i) => (
                    <div key={i} className="text-[7px] bg-white/5 p-2 rounded-lg border border-white/5 flex justify-between">
                      <span className="text-white/80 font-bold">{log.message}</span>
                      <span className={cn("font-black", log.status === 'SUCCESS' ? "text-green-500" : "text-red-500")}>{log.status}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {view === 'diag' && (
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[7px] font-black uppercase text-white/40 flex items-center gap-2">
                    <Printer className="w-3 h-3" /> PRINTER / USB
                  </label>
                  <div className="bg-black/40 border border-white/10 p-3 rounded-xl space-y-2">
                     <div className="flex justify-between items-center">
                       <span className="text-[8px] font-bold text-white/40 uppercase">HW Status</span>
                       <span className={cn("text-[8px] font-black italic", usbStatus === 'ONLINE' ? "text-green-500" : "text-red-500")}>{usbStatus}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-[8px] font-bold text-white/40 uppercase">Lexar Mount</span>
                       <span className={cn("text-[8px] font-black italic", usbHandle ? "text-green-500" : "text-amber-500")}>{usbHandle ? "READY" : "WAITING"}</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[7px] font-black uppercase text-white/40 flex items-center gap-2">
                    <QrCode className="w-3 h-3" /> CLOUD / QR
                  </label>
                  <div className="bg-black/40 border border-white/10 p-3 rounded-xl space-y-2">
                     <div className="flex justify-between items-center">
                       <span className="text-[8px] font-bold text-white/40 uppercase">Sync Link</span>
                       <span className={cn("text-[8px] font-black italic", runtimeStatus?.cloudSync === 'SUCCESS' ? "text-green-500" : "text-red-500")}>
                          {runtimeStatus?.cloudSync}
                       </span>
                     </div>
                  </div>
               </div>

               <div className="bg-black/20 p-2 rounded-lg text-[6px] font-mono text-white/20 break-all">
                  UA: {runtimeStatus?.userAgent}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
