
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
  Share2
} from "lucide-react";
import { cn } from "@/lib/utils";

type SessionState = "welcome" | "payment" | "capturing" | "review" | "consent" | "printing";

interface AdminControlsProps {
  currentStatus: SessionState;
  onJumpTo: (state: SessionState) => void;
  onReset: () => void;
  onExitOwnerMode: () => void;
  hasPackage: boolean;
  onBypassPayment: () => void;
}

export function AdminControls({ 
  currentStatus, 
  onJumpTo, 
  onReset, 
  onExitOwnerMode,
  hasPackage,
  onBypassPayment
}: AdminControlsProps) {
  const states: { id: SessionState; label: string; icon: any }[] = [
    { id: "welcome", label: "Intro", icon: PlayCircle },
    { id: "payment", label: "Cash", icon: CreditCard },
    { id: "capturing", label: "Camera", icon: Camera },
    { id: "review", label: "Review", icon: ImageIcon },
    { id: "consent", label: "Consent", icon: Share2 },
    { id: "printing", label: "Final", icon: Printer },
  ];

  return (
    <div className="fixed bottom-16 right-4 z-[100] flex flex-col items-end gap-2">
      <div className="bg-zinc-900/90 backdrop-blur-md border-2 border-primary/50 p-4 shadow-[0_0_30px_rgba(255,51,153,0.3)] w-64 animate-in slide-in-from-right-4">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <span className="font-headline font-black italic text-xs uppercase tracking-tighter">Owner Dashboard</span>
          </div>
          <button 
            onClick={onExitOwnerMode}
            className="text-white/40 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={onReset}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase py-3 transition-colors"
            >
              <RefreshCcw className="w-3 h-3" />
              Reset All
            </button>
            <button 
              disabled={!hasPackage || currentStatus !== 'payment'}
              onClick={onBypassPayment}
              className={cn(
                "flex items-center justify-center gap-2 text-[10px] font-black uppercase py-3 transition-colors",
                hasPackage && currentStatus === 'payment' ? "bg-green-600 hover:bg-green-500 text-white" : "bg-white/5 text-white/20 cursor-not-allowed"
              )}
            >
              <CreditCard className="w-3 h-3" />
              Pay Bypass
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-bold text-white/40 uppercase mb-2 tracking-widest">Jump to Screen:</p>
            <div className="grid grid-cols-1 gap-1">
              {states.map((state) => (
                <button
                  key={state.id}
                  onClick={() => onJumpTo(state.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 text-[10px] font-bold uppercase transition-all border-l-2",
                    currentStatus === state.id 
                      ? "bg-primary/20 border-primary text-primary" 
                      : "bg-white/5 border-transparent text-white/60 hover:bg-white/10"
                  )}
                >
                  <state.icon className="w-3 h-3" />
                  {state.label}
                  {currentStatus === state.id && <span className="ml-auto text-[8px] opacity-50">Active</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-white/10 flex justify-between items-center text-[8px] font-bold text-white/20 tracking-widest uppercase">
          <span>v2.2 Build-415</span>
          <span className="text-primary/40 italic">JNL STUDIO PRO</span>
        </div>
      </div>
    </div>
  );
}
