
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
  HardDrive,
  Cloud,
  Smartphone,
  ShieldAlert,
  Terminal
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
    // IMAGE PIPELINE
    captureSuccess: string;
    canvasExists: string;
    canvasWidth: string;
    canvasHeight: string;
    frameApplied: string;
    filterApplied: string;
    blobCreated: string;
    blobSize: string;
    // SOFT COPY TRACE
    uploadStarted: string;
    uploadCompleted: string;
    uploadFailed: string;
    uploadTarget: string;
    uploadedFileUrl: string;
    storageProvider: string;
    lastUploadError: string;
    // FIREBASE EMERGENCY DEBUG
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
    // HARDWARE TRUTH
    usbDevicesCount: number;
    shareCapable: string;
    usbHandleValid: string;
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

  const TraceItem = ({ label, value }: { label: string, value?: string }) => (
    <div className="flex justify-between items-center px-1 border-b border-white/5 py-1">
      <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1">
        {value === 'PASS' || value === 'TRUE' || value === 'YES' || value === 'LOGGED_IN' ? (
          <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
        ) : value === 'FAIL' || value === 'FALSE' || value === 'NO' || value === 'SIGNED_OUT' ? (
          <AlertCircle className="w-2.5 h-2.5 text-red-500" />
        ) : (
          <Loader2 className="w-2.5 h-2.5 text-white/10 animate-spin" />
        )}
        <span className={cn(
          "text-[8px] font-black italic", 
          (value === 'PASS' || value === 'TRUE' || value === 'YES' || value === 'LOGGED_IN') ? "text-green-500" : (value === 'FAIL' || value === 'FALSE' || value === 'NO' || value === 'SIGNED_OUT') ? "text-red-500" : "text-white/20"
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
               {/* EMERGENCY FIREBASE STORAGE DEBUG */}
               <div className="bg-red-500/10 border-2 border-red-500/40 p-3 rounded-xl space-y-2">
                  <h3 className="text-[8px] font-black uppercase text-red-500 italic mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> FIREBASE STORAGE DEBUG
                  </h3>
                  <div className="grid grid-cols-1 gap-1">
                     <div className="flex flex-col py-1 border-b border-red-500/10">
                       <span className="text-[6px] text-white/40 uppercase">Project ID</span>
                       <span className="text-[7px] font-mono text-white/80">{runtimeStatus?.fbProjectId}</span>
                     </div>
                     <div className="flex flex-col py-1 border-b border-red-500/10">
                       <span className="text-[6px] text-white/40 uppercase">Storage Bucket</span>
                       <span className="text-[7px] font-mono text-white/80">{runtimeStatus?.fbStorageBucket}</span>
                     </div>
                     <TraceItem label="Auth State" value={runtimeStatus?.fbAuthState} />
                     <div className="flex flex-col py-1 border-b border-red-500/10">
                       <span className="text-[6px] text-white/40 uppercase">User UID</span>
                       <span className="text-[7px] font-mono text-white/60 break-all">{runtimeStatus?.fbUserUid}</span>
                     </div>
                     <div className="flex justify-between items-center py-1 border-b border-red-500/10">
                       <span className="text-[7px] font-bold text-white/40 uppercase">Progress</span>
                       <span className="text-[8px] font-black text-amber-500">{runtimeStatus?.fbUploadProgress}</span>
                     </div>
                     <div className="flex justify-between items-center py-1 border-b border-red-500/10">
                       <span className="text-[7px] font-bold text-white/40 uppercase">Task State</span>
                       <span className="text-[8px] font-black text-indigo-400">{runtimeStatus?.fbTaskState}</span>
                     </div>
                     <div className="flex flex-col py-1 border-b border-red-500/10">
                       <span className="text-[6px] text-white/40 uppercase">Error Code</span>
                       <span className="text-[7px] font-black text-red-400">{runtimeStatus?.fbErrorCode}</span>
                     </div>
                     <div className="flex flex-col py-1 border-b border-red-500/10">
                       <span className="text-[6px] text-white/40 uppercase">Error Message</span>
                       <span className="text-[7px] font-medium text-red-300 italic">{runtimeStatus?.fbErrorMessage}</span>
                     </div>
                     <div className="flex flex-col py-1 border-b border-red-500/10">
                       <span className="text-[6px] text-white/40 uppercase">Full Exception</span>
                       <span className="text-[6px] font-mono text-white/20 break-all bg-black/40 p-1.5 rounded">{runtimeStatus?.fbException}</span>
                     </div>
                     <TraceItem label="Download URL Generated" value={runtimeStatus?.fbUrlGenerated} />
                  </div>
               </div>

               {runtimeStatus && (
                 <div className="bg-black/60 border border-green-500/30 p-3 rounded-xl space-y-2">
                    <h3 className="text-[7px] font-black uppercase text-green-400 italic mb-2 flex items-center gap-2">
                      <Zap className="w-3 h-3" /> IMAGE GENERATION TRACE
                    </h3>
                    <div className="grid grid-cols-1 gap-1">
                       <TraceItem label="Capture Success" value={runtimeStatus.captureSuccess} />
                       <TraceItem label="Canvas Exists" value={runtimeStatus.canvasExists} />
                       <div className="flex justify-between items-center px-1 border-b border-white/5 py-1">
                         <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">Canvas Resolution</span>
                         <span className="text-[8px] font-mono text-white/80">{runtimeStatus.canvasWidth}x{runtimeStatus.canvasHeight}</span>
                       </div>
                       <TraceItem label="Frame Applied" value={runtimeStatus.frameApplied} />
                       <TraceItem label="Filter Applied" value={runtimeStatus.filterApplied} />
                       <TraceItem label="Blob Created" value={runtimeStatus.blobCreated} />
                       <div className="flex justify-between items-center px-1 border-b border-white/5 py-1">
                         <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">Blob Byte Size</span>
                         <span className="text-[8px] font-mono text-white/80">{runtimeStatus.blobSize}</span>
                       </div>
                       <TraceItem label="File Created" value={runtimeStatus.fileCreated} />
                    </div>
                 </div>
               )}

               {runtimeStatus && (
                 <div className="bg-black/60 border border-indigo-500/30 p-3 rounded-xl space-y-2">
                    <h3 className="text-[7px] font-black uppercase text-indigo-400 italic mb-2 flex items-center gap-2">
                      <Cloud className="w-3 h-3" /> SOFT COPY PIPELINE
                    </h3>
                    <div className="grid grid-cols-1 gap-1">
                       <TraceItem label="Upload Started" value={runtimeStatus.uploadStarted} />
                       <TraceItem label="Upload Completed" value={runtimeStatus.uploadCompleted} />
                       <TraceItem label="Upload Failed" value={runtimeStatus.uploadFailed} />
                       <div className="flex flex-col py-1 border-b border-white/5 px-1">
                         <span className="text-[7px] text-white/40 uppercase mb-0.5">Target Path</span>
                         <span className="text-[6px] font-mono text-indigo-300 break-all">{runtimeStatus.uploadTarget}</span>
                       </div>
                       <div className="flex flex-col py-1 border-b border-white/5 px-1">
                         <span className="text-[7px] text-white/40 uppercase mb-0.5">Storage Provider</span>
                         <span className="text-[6px] font-mono text-white/60">{runtimeStatus.storageProvider}</span>
                       </div>
                       <div className="flex flex-col py-1 border-b border-white/5 px-1">
                         <span className="text-[7px] text-white/40 uppercase mb-0.5">Final Binary URL</span>
                         <span className="text-[6px] font-mono text-emerald-300 break-all">{runtimeStatus.uploadedFileUrl}</span>
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
                    <Smartphone className="w-3 h-3" /> HARDWARE TRUTH
                  </label>
                  <div className="bg-black/40 border border-white/10 p-3 rounded-xl space-y-2">
                     <div className="flex justify-between items-center px-1 border-b border-white/5 py-1">
                       <span className="text-[7px] font-bold text-white/40 uppercase">USB Devices Found</span>
                       <span className={cn("text-[8px] font-black", (runtimeStatus?.usbDevicesCount || 0) > 0 ? "text-green-500" : "text-red-500")}>
                         {runtimeStatus?.usbDevicesCount || 0} DEVICES
                       </span>
                     </div>
                     <TraceItem label="Android Share Capable" value={runtimeStatus?.shareCapable} />
                     <TraceItem label="Lexar Permission Valid" value={usbHandle ? 'YES' : 'NO'} />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[7px] font-black uppercase text-white/40 flex items-center gap-2">
                    <QrCode className="w-3 h-3" /> CLOUD / QR
                  </label>
                  <div className="bg-black/40 border border-white/10 p-3 rounded-xl space-y-2">
                     <div className="flex justify-between items-center">
                       <span className="text-[8px] font-bold text-white/40 uppercase">Sync Link</span>
                       <span className={cn("text-[8px] font-black italic", runtimeStatus?.cloudSync === 'PASS' ? "text-green-500" : "text-red-500")}>
                          {runtimeStatus?.cloudSync || 'PENDING'}
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
