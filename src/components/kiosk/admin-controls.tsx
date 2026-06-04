
"use client";

import React, { useState } from "react";
import { 
  Settings, 
  RefreshCcw, 
  LogOut, 
  PlayCircle, 
  CreditCard, 
  Camera, 
  Image as ImageIcon, 
  Printer,
  Share2,
  Palette,
  Usb,
  HardDrive,
  AlertCircle,
  LayoutGrid,
  CheckCircle2,
  Database,
  Code2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BLUEPRINTS } from "./frame-blueprint";
import { BlueprintFrame } from "./blueprint-frame";

type SessionState = "welcome" | "payment" | "setup" | "capturing" | "review" | "decorating" | "consent" | "printing";

interface AdminControlsProps {
  currentStatus: SessionState;
  onJumpTo: (state: SessionState) => void;
  onReset: () => void;
  onExitOwnerMode: () => void;
  hasPackage: boolean;
  onBypassPayment: () => void;
  usbStatus: "connected" | "disconnected";
  onSetupUsb: () => void;
  onTestSave?: () => void;
  isDevMode: boolean;
  onToggleDevMode: () => void;
}

export function AdminControls({ 
  currentStatus, 
  onJumpTo, 
  onReset, 
  onExitOwnerMode,
  hasPackage,
  onBypassPayment,
  usbStatus,
  onSetupUsb,
  onTestSave,
  isDevMode,
  onToggleDevMode
}: AdminControlsProps) {
  const [showBlueprints, setShowBlueprints] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const states: { id: SessionState; label: string; icon: any }[] = [
    { id: "welcome", label: "Intro", icon: PlayCircle },
    { id: "payment", label: "Cash", icon: CreditCard },
    { id: "setup", label: "Setup", icon: Palette },
    { id: "capturing", label: "Camera", icon: Camera },
    { id: "review", label: "Review", icon: ImageIcon },
    { id: "decorating", label: "Decor", icon: ImageIcon },
    { id: "consent", label: "Consent", icon: Share2 },
    { id: "printing", label: "Final", icon: Printer },
  ];

  const handleTestSave = async () => {
    if (onTestSave) {
      setTestResult("testing...");
      await onTestSave();
      setTestResult("Write Success!");
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  return (
    <div className="fixed bottom-16 right-4 z-[100] flex flex-col items-end gap-2 scale-90 sm:scale-100 origin-bottom-right">
      
      {showBlueprints && (
        <div className="bg-zinc-950 border-2 border-primary p-6 w-[80vw] h-[80vh] overflow-y-auto mb-4 animate-in fade-in zoom-in slide-in-from-right-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline font-black text-2xl italic uppercase text-primary">Frame Blueprint Viewer</h3>
            <button onClick={() => setShowBlueprints(false)} className="bg-white/10 p-2 text-xs font-bold uppercase">Close Viewer</button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {BLUEPRINTS.map(bp => (
              <div key={bp.id} className="space-y-2">
                <p className="text-[10px] font-black uppercase text-white/40">{bp.label} ({bp.package} PHP)</p>
                <BlueprintFrame 
                  blueprint={bp} 
                  photos={[]} 
                  isPreview 
                  quoteText="SAMPLE QUOTE"
                  className="border border-white/20"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-zinc-950/95 backdrop-blur-md border-2 border-primary/50 p-4 shadow-[0_0_30px_rgba(255,51,153,0.3)] w-72 animate-in slide-in-from-right-4 border-b-primary/80">
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
          {/* Dev Mode Toggle */}
          <div className="bg-blue-600/10 border border-blue-500/30 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-400">
              <Code2 className="w-3 h-3" />
              Development Mode
            </div>
            <button onClick={onToggleDevMode} className="text-blue-400">
              {isDevMode ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 opacity-40" />}
            </button>
          </div>

          <div className="bg-white/5 p-3 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-white/60">
                <Usb className={cn("w-3 h-3", usbStatus === 'connected' ? "text-green-500" : "text-red-500")} />
                USB Storage Status
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase",
                usbStatus === 'connected' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
              )}>
                {usbStatus}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={onSetupUsb}
                className="w-full bg-primary/10 hover:bg-primary/20 border border-primary/30 py-2 text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <HardDrive className="w-3 h-3" />
                {usbStatus === 'connected' ? "Remount Folder" : "Mount USB Folder"}
              </button>
              
              <button 
                disabled={usbStatus !== 'connected'}
                onClick={handleTestSave}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2 text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-30"
              >
                <CheckCircle2 className="w-3 h-3" />
                {testResult || "Test Write Access"}
              </button>
            </div>
          </div>

          <button 
            onClick={() => setShowBlueprints(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 py-3 text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <LayoutGrid className="w-3 h-3" />
            Verify Blueprints
          </button>

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
            <p className="text-[9px] font-bold text-white/40 uppercase mb-2 tracking-widest">Navigation:</p>
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
        </div>

        <div className="mt-4 pt-2 border-t border-white/10 flex justify-between items-center text-[8px] font-bold text-white/20 tracking-widest uppercase">
          <span className="flex items-center gap-1"><Database className="w-2 h-2" /> Direct USB Storage</span>
          <span className="text-primary/40 italic">JNL v4.0</span>
        </div>
      </div>
    </div>
  );
}
