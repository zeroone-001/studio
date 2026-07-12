"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  LogOut, 
  RefreshCcw, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronUp,
  GripHorizontal,
  Smartphone,
  ShieldAlert,
  FileCode,
  Printer,
  HardDrive,
  Zap,
  Image as ImageIcon
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
  onMountGallery: (handle: FileSystemDirectoryHandle) => void;
  usbHandle: FileSystemDirectoryHandle | null;
  galleryHandle: FileSystemDirectoryHandle | null;
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
    captureSuccess: string;
    canvasExists: string;
    canvasWidth: string;
    canvasHeight: string;
    frameApplied: string;
    filterApplied: string;
    blobCreated: string;
    blobSize: string;
    uploadStarted: string;
    uploadCompleted: string;
    uploadFailed: string;
    uploadTarget: string;
    uploadedFileUrl: string;
    storageProvider: string;
    lastUploadError: string;
    fbProjectId: string;
    fbStorageBucket: string;
    fbUserUid: string;
    fbAuthState: string;
    fbUploadProgress: string;
    fbTaskState: string;
    fbErrorCode: string;
    fbErrorMessage: string;
    fbException: string;
    fbUrlGenerated: string;
    usbDevicesCount: number;
    shareCapable: string;
    usbHandleValid: string;
    rawApiKey: string;
    rawApiKeyType: string;
    rawApiKeyLength: number;
    rawAuthDomain: string;
    rawProjectId: string;
    rawStorageBucket: string;
    rawMessagingId: string;
    rawAppId: string;
    rawConfigSrc: string;
  };
}

export function AdminControls({ 
  currentStatus, 
  onJumpTo, 
  onReset, 
  onExitOwnerMode,
  onSimulateCash,
  onMountUsb,
  onMountGallery,
  usbHandle,
  galleryHandle,
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

  const TraceItem = ({ label, value }: { label: string, value?: string | number }) => (
    <div className="flex justify-between items-center px-1 border-b border-white/5 py-1">
      <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1">
        {value === 'PASS' || value === 'TRUE' || value === 'YES' || value === 'LOGGED_IN' ? (
          <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
        ) : value === 'FAIL' || value === 'FALSE' || value === 'NO' || value === 'SIGNED_OUT' || value === 'ERROR' ? (
          <AlertCircle className="w-2.5 h-2.5 text-red-500" />
        ) : (
          <Loader2 className="w-2.5 h-2.5 text-white/10 animate-spin" />
        )}
        <span className={cn(
          "text-[8px] font-black italic", 
          (value === 'PASS' || value === 'TRUE' || value === 'YES' || value === 'LOGGED_IN') ? "text-green-500" : (value === 'FAIL' || value === 'FALSE' || value === 'NO' || value === 'SIGNED_OUT' || value === 'ERROR') ? "text-red-500" : "text-white/20"
        )}>
          {value || 'PENDING'}
        </span>
      </div>
    </div>
  );

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
                  onClick={() => { onSimulateCash(50); onJumpTo('package-selection'); }}
                  className="py-4 bg-primary/20 border border-primary/40 text-primary text-[10px] font-black uppercase italic rounded-xl hover:bg-primary/30 active:scale-95 transition-all"
                >
                  TEST ₱50 TIER
                </button>
                <button 
                  onClick={() => { onSimulateCash(100); onJumpTo('package-selection'); }}
                  className="py-4 bg-primary/20 border border-primary/40 text-primary text-[10px] font-black uppercase italic rounded-xl hover:bg-primary/30 active:scale-95 transition-all"
                >
                  TEST ₱100 TIER
                </button>
              </div>
              <button onClick={onReset} className="w-full py-4 bg-red-500/10 border border-red-500/30 text-[9px] font-black uppercase text-red-500 rounded-xl flex items-center justify-center gap-2">
                <RefreshCcw className="w-3 h-3" /> RESET SESSION
              </button>
            </div>
          )}

          {view === 'logs' && (
            <div className="space-y-4">
               <div className="bg-red-500/10 border-2 border-red-500/40 p-3 rounded-xl space-y-2">
                  <h3 className="text-[8px] font-black uppercase text-red-500 italic mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> FIREBASE STATUS TRACE
                  </h3>
                  <div className="grid grid-cols-1 gap-1">
                     <TraceItem label="Auth State" value={runtimeStatus?.fbAuthState} />
                     <TraceItem label="Error Code" value={runtimeStatus?.fbErrorCode} />
                     <div className="flex flex-col py-1 border-b border-red-500/10">
                       <span className="text-[6px] text-white/40 uppercase">System Exception</span>
                       <span className="text-[7px] font-black text-red-400 break-words">{runtimeStatus?.fbException}</span>
                     </div>
                  </div>
               </div>

               <div className="flex justify-between items-center px-1">
                  <span className="text-[8px] font-black text-white/40 uppercase">Recent System Logs</span>
                  <button onClick={() => KioskLogger.clear()} className="text-red-500"><Trash2 className="w-3 h-3" /></button>
               </div>
               <div className="space-y-1">
                  {logs.slice(0, 10).map((log, i) => (
                    <div key={i} className="text-[7px] bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 font-bold">{log.module}: {log.message}</span>
                        <span className={cn("font-black", log.status === 'SUCCESS' ? "text-green-500" : "text-red-500")}>{log.status}</span>
                      </div>
                      {log.error && <span className="text-red-400 italic text-[6px]">{log.error}</span>}
                    </div>
                  ))}
               </div>
            </div>
          )}

          {view === 'diag' && (
            <div className="space-y-4">
               <div className="bg-indigo-500/10 border-2 border-indigo-500/40 p-3 rounded-xl space-y-2">
                  <h3 className="text-[8px] font-black uppercase text-indigo-400 italic mb-2 flex items-center gap-2">
                    <FileCode className="w-3 h-3" /> RUNTIME CONFIG PROOF
                  </h3>
                  <div className="grid grid-cols-1 gap-1">
                     <div className="flex flex-col py-1 border-b border-white/10">
                       <span className="text-[6px] text-white/40 uppercase">apiKey</span>
                       <span className="text-[7px] font-mono text-amber-400 break-all">{runtimeStatus?.rawApiKey}</span>
                     </div>
                     <TraceItem label="apiKey Length" value={runtimeStatus?.rawApiKeyLength} />
                     <div className="flex flex-col py-1 border-b border-white/10">
                       <span className="text-[6px] text-white/40 uppercase">projectId</span>
                       <span className="text-[7px] font-mono text-white/60">{runtimeStatus?.rawProjectId}</span>
                     </div>
                     <div className="flex flex-col py-1 border-b border-white/10">
                       <span className="text-[6px] text-white/40 uppercase">appId</span>
                       <span className="text-[7px] font-mono text-white/60">{runtimeStatus?.rawAppId}</span>
                     </div>
                     <div className="flex flex-col py-1 border-b border-white/10">
                       <span className="text-[6px] text-white/40 uppercase">authDomain</span>
                       <span className="text-[7px] font-mono text-white/60">{runtimeStatus?.rawAuthDomain}</span>
                     </div>
                     <div className="flex flex-col py-1 border-b border-white/10">
                       <span className="text-[6px] text-white/40 uppercase">storageBucket</span>
                       <span className="text-[7px] font-mono text-white/60">{runtimeStatus?.rawStorageBucket}</span>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
