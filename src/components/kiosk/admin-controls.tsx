"use client";

import React from "react";
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
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

type SessionState = "welcome" | "payment" | "setup" | "capturing" | "review" | "decorating" | "consent" | "printing" | "test-stickers";

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
  onToggleDevMode
}: AdminControlsProps) {
  const states: { id: SessionState; label: string; icon: any }[] = [
    { id: "welcome", label: "Intro", icon: PlayCircle },
    { id: "payment", label: "Cash", icon: CreditCard },
    { id: "setup", label: "Setup", icon: Palette },
    { id: "capturing", label: "Camera", icon: Camera },
    { id: "review", label: "Review", icon: ImageIcon },
    { id: "decorating", label: "Decor", icon: ImageIcon },
    { id: "consent", label: "Privacy", icon: ShieldAlert },
    { id: "printing", label: "Print/QR", icon: Printer },
    { id: "test-stickers", label: "Gesture Test", icon: Smile },
  ];

  return (
    <div className="fixed bottom-16 right-4 z-[100] flex flex-col items-end gap-2 scale-90 sm:scale-100 origin-bottom-right">
      <div className="bg-zinc-950/95 backdrop-blur-md border-2 border-primary/50 p-4 shadow-[0_0_30px_rgba(255,51,153,0.3)] w-72 animate-in slide-in-from-right-4 border-b-primary/80">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <span className="font-headline font-black italic text-xs uppercase tracking-tighter">Owner Dashboard</span>
          </div>
          <button onClick={onExitOwnerMode} className="text-white/40 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-600/10 border border-blue-500/30 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-400">
              <Code2 className="w-3 h-3" /> Dev Mode
            </div>
            <button onClick={onToggleDevMode} className="text-blue-400">
              {isDevMode ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 opacity-40" />}
            </button>
          </div>

          <div className="space-y-2">
             <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Test Bypasses:</p>
             <div className="grid grid-cols-2 gap-2">
               <button onClick={() => onBypassPayment(50)} className="bg-primary/20 border border-primary/40 py-2 text-[9px] font-black uppercase flex items-center justify-center gap-1">
                 <Zap className="w-3 h-3" /> P50 Test
               </button>
               <button onClick={() => onBypassPayment(100)} className="bg-primary/20 border border-primary/40 py-2 text-[9px] font-black uppercase flex items-center justify-center gap-1">
                 <Zap className="w-3 h-3" /> P100 Test
               </button>
             </div>
          </div>

          <button onClick={onSetupUsb} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2 text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-colors">
            <Usb className="w-3 h-3" /> {usbStatus === 'connected' ? "Remount Storage" : "Mount Storage"}
          </button>

          <div className="space-y-1">
            <p className="text-[9px] font-bold text-white/40 uppercase mb-2 tracking-widest">Quick Nav:</p>
            <div className="grid grid-cols-2 gap-1">
              {states.map((state) => (
                <button
                  key={state.id}
                  onClick={() => onJumpTo(state.id)}
                  className={cn(
                    "flex items-center gap-2 w-full px-2 py-2 text-[8px] font-bold uppercase transition-all border-l-2",
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
          </div>
          
          <button onClick={onReset} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 py-2 text-[10px] font-black uppercase flex items-center justify-center gap-2 text-red-500 transition-colors">
            <RefreshCcw className="w-3 h-3" /> Global Reset
          </button>
        </div>
      </div>
    </div>
  );
}
