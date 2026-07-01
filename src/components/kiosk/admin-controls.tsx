
"use client";

import React, { useState, useEffect } from "react";
import { 
  LogOut, 
  RefreshCcw, 
  MonitorSmartphone,
  Activity,
  Trash2,
  CheckCircle2,
  FolderOpen,
  Layout as LayoutIcon,
  Layers,
  Usb,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KioskLogger } from "@/lib/kiosk/logger";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SessionState } from "@/lib/kiosk/constants";
import { BLUEPRINTS } from "./frame-blueprint";
import { BlueprintFrame } from "./blueprint-frame";

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
  cameras = [],
  selectedCameraId,
  onSelectCamera
}: AdminControlsProps) {
  const [view, setView] = useState<'main' | 'logs' | 'diag' | 'previews'>('main');
  const [pairedDevices, setPairedDevices] = useState<USBDevice[]>([]);
  const logs = KioskLogger.getLogs();

  const updateDevices = async () => {
    if ('usb' in navigator) {
      const devices = await navigator.usb.getDevices();
      setPairedDevices(devices);
    }
  };

  useEffect(() => {
    updateDevices();
    const interval = setInterval(updateDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePairHardware = async () => {
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      try {
        KioskLogger.log('info', 'HARDWARE', 'Requesting USB Pair Handshake.', 'PENDING');
        // Filter for Epson (0x04b8) or Lexar
        await navigator.usb.requestDevice({
          filters: [
            { vendorId: 0x04b8 }, // Epson Signature
            { vendorId: 0x058f }, // Alcor Micro (Lexar Hubs)
            { vendorId: 0x0781 }  // Sandisk
          ]
        });
        KioskLogger.log('info', 'HARDWARE', 'USB Pair Handshake Completed.', 'SUCCESS');
        await updateDevices();
      } catch (e: any) {
        KioskLogger.log('error', 'HARDWARE', 'USB Pair Rejected or Timeout.', 'FAILED', e.message);
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
             <button onClick={() => setView('diag')} className={cn("text-[9px] font-black uppercase tracking-widest", view === 'diag' ? "text-primary" : "text-white/40")}>Hardware</button>
          </div>
          <button onClick={onExitOwnerMode} className="text-white/40 hover:text-white"><LogOut className="w-4 h-4" /></button>
        </div>

        {view === 'main' && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
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

            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase text-white/40">Testing</label>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => onBypassPayment(50)} className="bg-primary/20 border border-primary/40 py-2 text-[9px] font-black uppercase hover:bg-primary/30">₱50 Test</button>
                 <button onClick={() => onBypassPayment(100)} className="bg-primary/20 border border-primary/40 py-2 text-[9px] font-black uppercase hover:bg-primary/30">₱100 Test</button>
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
                  <Cpu className="w-3 h-3" /> Paired USB Inventory
                </label>
                <div className="bg-black/40 border border-white/10 p-3 space-y-2 min-h-20 max-h-40 overflow-y-auto">
                   {pairedDevices.length === 0 ? (
                     <div className="text-[9px] italic text-white/20">No hardware paired with browser.</div>
                   ) : (
                     pairedDevices.map((d, i) => (
                       <div key={i} className="text-[9px] font-mono flex flex-col border-b border-white/5 pb-2 last:border-0">
                         <span className="text-primary font-black">{d.productName || "Unknown Device"}</span>
                         <span className="text-white/40">VID: 0x{d.vendorId.toString(16).padStart(4, '0')} | PID: 0x{d.productId.toString(16).padStart(4, '0')}</span>
                       </div>
                     ))
                   )}
                </div>
             </div>

             <button onClick={handlePairHardware} className="w-full py-4 text-[10px] font-black uppercase flex items-center justify-center gap-2 border-2 bg-primary/20 border-primary/40 text-primary hover:bg-primary/30">
               <Usb className="w-4 h-4" /> PAIR PRINTER / HUB
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
