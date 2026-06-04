
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { AdminAuthDialog } from "@/components/kiosk/admin-auth-dialog";
import { AdminControls } from "@/components/kiosk/admin-controls";
import { 
  Camera, Zap, Wallet, ArrowRight, Loader2, ShieldAlert, Facebook, 
  Sparkles, Frame, Usb, Printer, Smile, Quote, Share2, Heart, Star, Flame
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BLUEPRINTS, FrameBlueprint } from "@/components/kiosk/frame-blueprint";
import { BlueprintFrame } from "@/components/kiosk/blueprint-frame";

type SessionState = "welcome" | "payment" | "setup" | "capturing" | "review" | "decorating" | "consent" | "printing";

const FILTERS = [
  { id: "none", label: "STYLE A", class: "" },
  { id: "bw", label: "STYLE B", class: "grayscale" },
  { id: "sepia", label: "STYLE C", class: "sepia contrast-125" },
  { id: "vivid", label: "STYLE D", class: "saturate-150 contrast-110" },
  { id: "cool", label: "STYLE E", class: "hue-rotate-180 brightness-110" },
  { id: "noir", label: "STYLE F", class: "grayscale contrast-200 brightness-75" },
  { id: "soft", label: "STYLE G", class: "blur-[0.5px] brightness-110 contrast-90" },
  { id: "warm", label: "STYLE H", class: "sepia-[0.3] saturate-125" },
  { id: "hard", label: "STYLE I", class: "contrast-150 brightness-90" },
  { id: "glow", label: "STYLE J", class: "brightness-125 saturate-150 contrast-110" },
];

const STICKERS = [
  { id: "heart", icon: <Heart className="w-8 h-8 text-red-500" />, label: "HEART" },
  { id: "star", icon: <Star className="w-8 h-8 text-yellow-400" />, label: "STAR" },
  { id: "sparkle", icon: <Sparkles className="w-8 h-8 text-white" />, label: "SPARKLE" },
  { id: "fire", icon: <Flame className="w-8 h-8 text-orange-500" />, label: "FIRE" },
  { id: "camera", icon: <Camera className="w-8 h-8 text-primary" />, label: "SNAP" },
];

const QUOTES = [
  { id: "none", text: "", label: "NONE" },
  { id: "stay", text: "STAY POSITIVE", label: "POSITIVE" },
  { id: "magic", text: "JNL MAGIC", label: "MAGIC" },
  { id: "iconic", text: "PURE ICONIC", label: "ICONIC" },
  { id: "best", text: "BEST DAY EVER", label: "BEST DAY" },
];

export default function KioskPage() {
  const [appState, setAppState] = useState<SessionState>("welcome");
  const [packageSelected, setPackageSelected] = useState<50 | 100 | null>(null);
  const [paymentReceived, setPaymentReceived] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  
  // Customization States
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<FrameBlueprint | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<typeof STICKERS[0] | null>(null);
  const [selectedQuote, setSelectedQuote] = useState(QUOTES[0]);
  
  // Admin & Storage States
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [usbHandle, setUsbHandle] = useState<any>(null);
  const [usbError, setUsbError] = useState<string | null>(null);

  // Filter layouts based on package
  const availableBlueprints = BLUEPRINTS.filter(bp => bp.package === packageSelected);
  const availableFilters = FILTERS.slice(0, packageSelected === 100 ? 10 : 5);

  const setupUsbStorage = async () => {
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setUsbHandle(handle);
      setUsbError(null);
    } catch (e: any) {
      setUsbError("USB Setup Failed.");
    }
  };

  const saveToUsb = async (dataUri: string) => {
    if (!usbHandle) return false;
    try {
      const today = new Date().toISOString().split('T')[0];
      const sessionId = Math.random().toString(36).substring(7);
      const dateDir = await usbHandle.getDirectoryHandle(today, { create: true });
      const sessionDir = await dateDir.getDirectoryHandle(`Session_${sessionId}`, { create: true });
      const fileHandle = await sessionDir.getFileHandle(`portrait_${Date.now()}.jpg`, { create: true });
      const response = await fetch(dataUri);
      const blob = await response.blob();
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (e) {
      setUsbError("USB Write Error.");
      return false;
    }
  };

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setIsAdminDialogOpen(true);
        return 0;
      }
      return next;
    });
    setTimeout(() => setLogoClickCount(0), 3000);
  };

  useEffect(() => {
    if (appState === "payment" && packageSelected) {
      if (paymentReceived >= packageSelected) {
        const timer = setTimeout(() => {
          setAppState("setup");
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [paymentReceived, appState, packageSelected]);

  useEffect(() => {
    if (appState === "capturing") {
      startShotSequence();
    }
  }, [appState]);

  const startShotSequence = async () => {
    const totalShots = packageSelected === 50 ? 3 : 6;
    const photos: string[] = [];

    for (let i = 0; i < totalShots; i++) {
      setCurrentShotIndex(i + 1);
      
      // 3 second countdown
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      
      setCountdown(null);
      setIsProcessing(true);
      // Simulate capture
      const mockPhoto = `https://picsum.photos/seed/jnl-${Date.now()}-${i}/1200/1600`;
      photos.push(mockPhoto);
      await new Promise(r => setTimeout(r, 800)); // Shutter delay
      setIsProcessing(false);
    }

    setCapturedPhotos(photos);
    setAppState("review");
  };

  const resetSession = useCallback(() => {
    setAppState("welcome");
    setPaymentReceived(0);
    setPackageSelected(null);
    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    setCountdown(null);
    setIsProcessing(false);
    setSelectedBlueprint(null);
    setSelectedFilter(FILTERS[0]);
    setSelectedSticker(null);
    setSelectedQuote(QUOTES[0]);
  }, []);

  return (
    <KioskLayout>
      <div 
        className="absolute top-12 left-0 right-0 z-[60] text-center cursor-default select-none active:opacity-80 transition-opacity"
        onClick={handleLogoClick}
      >
        <h1 className="font-headline font-black text-5xl sm:text-7xl tracking-tighter text-white neon-glow">
          JNL <span className="text-primary">STUDIO</span>
        </h1>
        <p className="font-body font-bold text-[10px] sm:text-sm uppercase tracking-[0.4em] opacity-60 mt-2">
          Premium Portrait Blueprint
        </p>
      </div>

      <AdminAuthDialog 
        isOpen={isAdminDialogOpen} 
        onClose={() => setIsAdminDialogOpen(false)}
        onAuthSuccess={() => setIsOwnerMode(true)}
      />

      {isOwnerMode && (
        <AdminControls 
          currentStatus={appState}
          onJumpTo={setAppState}
          onReset={resetSession}
          onExitOwnerMode={() => setIsOwnerMode(false)}
          hasPackage={!!packageSelected}
          onBypassPayment={() => setPaymentReceived(packageSelected || 0)}
          usbStatus={usbHandle ? "connected" : "disconnected"}
          onSetupUsb={setupUsbStorage}
        />
      )}

      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
        {isOwnerMode && (
          <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter animate-pulse border border-white/20">
            <ShieldAlert className="w-3 h-3" />
            OWNER TEST MODE
          </div>
        )}
        {usbHandle && (
          <div className="flex items-center gap-2 bg-green-600/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase border border-green-500/50">
            <Usb className="w-3 h-3" />
            USB ACTIVE
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto pt-36 sm:pt-48 pb-20 sm:pb-24">
        
        {appState === "welcome" && (
          <div className="text-center animate-in fade-in zoom-in duration-700 w-full max-w-sm">
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 mb-10 sm:mb-16 mx-auto">
               <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
               <div className="absolute inset-6 rounded-full border-2 border-primary/50" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-20 h-20 sm:w-28 sm:h-28 text-primary animate-neon-pulse" />
               </div>
            </div>
            <h2 className="font-headline font-black text-3xl sm:text-5xl mb-8 uppercase tracking-tighter">READY FOR YOUR SHOT?</h2>
            <NeonButton 
              onClick={() => setAppState("payment")} 
              className="w-full text-xl sm:text-2xl"
              disabled={!usbHandle && !isOwnerMode}
            >
              TAP TO START
            </NeonButton>
          </div>
        )}

        {appState === "payment" && (
          <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="font-headline font-black text-3xl sm:text-4xl mb-8 sm:mb-12 text-center uppercase italic">Select Package</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-10 sm:mb-14">
              <button 
                onClick={() => setPackageSelected(50)}
                className={cn(
                  "p-8 sm:p-10 border-2 transition-all text-left flex justify-between items-center relative overflow-hidden",
                  packageSelected === 50 ? "border-primary bg-primary/10" : "border-white/20 hover:border-white/50"
                )}
              >
                <div>
                  <div className="text-4xl sm:text-5xl font-black italic">50 PHP</div>
                  <div className="text-[10px] sm:text-sm font-bold opacity-60 uppercase mt-2">3 SHOTS • 5 BLUEPRINTS</div>
                </div>
                <ArrowRight className={cn("w-8 h-8", packageSelected === 50 ? "text-primary" : "text-white/20")} />
              </button>

              <button 
                onClick={() => setPackageSelected(100)}
                className={cn(
                  "p-8 sm:p-10 border-2 transition-all text-left flex justify-between items-center relative overflow-hidden",
                  packageSelected === 100 ? "border-primary bg-primary/10" : "border-white/20 hover:border-white/50"
                )}
              >
                <div>
                  <div className="text-4xl sm:text-5xl font-black italic">100 PHP</div>
                  <div className="text-[10px] sm:text-sm font-bold opacity-60 uppercase mt-2">6 SHOTS • 10 BLUEPRINTS</div>
                </div>
                <Zap className={cn("w-8 h-8", packageSelected === 100 ? "text-primary" : "text-white/20")} />
              </button>
            </div>

            {packageSelected && (
              <div className="text-center p-8 sm:p-12 border-2 border-dashed border-white/20 bg-white/5">
                <Wallet className="w-12 h-12 mx-auto mb-6 text-primary animate-bounce" />
                <p className="font-bold uppercase tracking-widest text-2xl">Insert {packageSelected} PHP</p>
                <p className="text-[10px] opacity-50 mt-4 font-bold uppercase tracking-wider italic">Awaiting Bill Detection...</p>
              </div>
            )}
          </div>
        )}

        {appState === "setup" && (
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in duration-500">
             {/* Preview */}
             <div className="relative w-full max-h-[60vh] mx-auto overflow-hidden">
                <BlueprintFrame 
                  blueprint={selectedBlueprint || availableBlueprints[0]} 
                  photos={[]} 
                  filterClass={selectedFilter.class}
                  isPreview
                  quoteText="YOUR SHOT HERE"
                />
             </div>

             {/* Setup Controls */}
             <div className="space-y-6 sm:max-h-[70vh] overflow-y-auto pr-4 scrollbar-hide">
              <h2 className="font-headline font-black text-3xl italic uppercase text-primary">Pre-Shot Blueprint</h2>
              
              <div className="space-y-8">
                {/* Blueprints */}
                <div>
                  <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                    <Frame className="w-4 h-4 text-primary" /> Choose Layout (A-{(availableBlueprints.length + 9).toString(36).toUpperCase()})
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {availableBlueprints.map((bp) => (
                      <button 
                        key={bp.id} 
                        onClick={() => setSelectedBlueprint(bp)} 
                        className={cn(
                          "aspect-square flex items-center justify-center text-[10px] font-black uppercase border-2 transition-all italic", 
                          (selectedBlueprint?.id || availableBlueprints[0].id) === bp.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40 hover:border-white/30"
                        )}
                      >
                        {bp.label.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                    <Sparkles className="w-4 h-4 text-primary" /> Portrait Style
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {availableFilters.map((f) => (
                      <button key={f.id} onClick={() => setSelectedFilter(f)} className={cn("aspect-square flex items-center justify-center text-[8px] font-black uppercase border-2 transition-all italic p-1", selectedFilter.id === f.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40 hover:border-white/30")}>{f.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              <NeonButton 
                onClick={() => {
                  if (!selectedBlueprint) setSelectedBlueprint(availableBlueprints[0]);
                  setAppState("capturing");
                }} 
                className="w-full !py-8 mt-6"
              >
                START SHOOTING
              </NeonButton>
            </div>
          </div>
        )}

        {appState === "capturing" && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative aspect-[3/4] max-h-[65vh] w-full max-w-lg bg-zinc-900 overflow-hidden shadow-[0_0_60px_rgba(255,51,153,0.4)] border-4 border-white">
               <div className={cn("absolute inset-0 bg-[url('https://picsum.photos/seed/live-jnl/1200/1600')] bg-cover bg-center", selectedFilter.class)} />
               {countdown !== null && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                    <span className="text-[10rem] font-headline font-black italic text-white animate-bounce drop-shadow-[0_0_40px_rgba(255,51,153,0.9)]">{countdown}</span>
                 </div>
               )}
               <div className="absolute top-6 left-6 z-30">
                  <div className="bg-primary px-4 py-2 font-black italic uppercase tracking-widest text-xs">
                    SHOT {currentShotIndex} / {packageSelected === 50 ? 3 : 6}
                  </div>
               </div>
               {isProcessing && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30 animate-pulse">
                    <Camera className="w-16 h-16 text-primary mb-4" />
                    <p className="font-headline font-black text-2xl italic tracking-widest uppercase">CAPTURED!</p>
                 </div>
               )}
            </div>
            <p className="mt-8 font-body font-black italic text-xl opacity-80 uppercase tracking-widest animate-pulse">Strike a pose!</p>
          </div>
        )}

        {appState === "review" && (
          <div className="w-full max-w-lg animate-in fade-in duration-500">
            <h2 className="font-headline font-black text-3xl mb-6 text-center italic uppercase">Looking Sharp!</h2>
            <div className="w-full mb-8 mx-auto">
               {selectedBlueprint && (
                 <BlueprintFrame 
                   blueprint={selectedBlueprint} 
                   photos={capturedPhotos} 
                   filterClass={selectedFilter.class}
                   isPreview
                 />
               )}
            </div>
            <div className="grid grid-cols-2 gap-4">
               <NeonButton onClick={() => setAppState("decorating")} className="w-full py-8 text-xl">DECORATE</NeonButton>
               <button onClick={() => setAppState("setup")} className="w-full border-2 border-white font-headline font-black text-xl py-8 italic hover:bg-white hover:text-black transition-colors uppercase">RETAKE</button>
            </div>
          </div>
        )}

        {appState === "decorating" && (
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in duration-500">
             {/* Live Preview */}
             <div className="relative w-full max-h-[60vh] mx-auto overflow-hidden">
                {selectedBlueprint && (
                   <BlueprintFrame 
                     blueprint={selectedBlueprint} 
                     photos={capturedPhotos} 
                     filterClass={selectedFilter.class}
                     isPreview
                     quoteText={selectedQuote.text}
                   />
                )}
                {selectedSticker && (
                  <div className="absolute top-1/4 left-1/4 drop-shadow-lg animate-bounce z-20 select-none">
                    {selectedSticker.icon}
                  </div>
                )}
             </div>

             {/* Decoration Controls */}
             <div className="space-y-6 sm:max-h-[70vh] overflow-y-auto pr-4 scrollbar-hide">
                <h2 className="font-headline font-black text-3xl italic uppercase text-primary">Final Touches</h2>
                
                <div className="space-y-8">
                  {/* Stickers */}
                  <div>
                    <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                      <Smile className="w-4 h-4 text-primary" /> Stickers
                    </div>
                    <div className="flex gap-4">
                      {STICKERS.map((s) => (
                        <button key={s.id} onClick={() => setSelectedSticker(s === selectedSticker ? null : s)} className={cn("w-14 h-14 flex items-center justify-center bg-white/5 border-2 rounded-lg transition-all", selectedSticker?.id === s.id ? "border-primary bg-primary/20" : "border-white/10")}>
                          {s.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quotes */}
                  <div>
                    <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                      <Quote className="w-4 h-4 text-primary" /> Motivation
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {QUOTES.map((q) => (
                        <button key={q.id} onClick={() => setSelectedQuote(q)} className={cn("py-3 px-4 text-[10px] font-black uppercase border-2 transition-all italic", selectedQuote.id === q.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40")}>{q.label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <NeonButton onClick={() => setAppState("consent")} className="w-full !py-8 mt-6">FINALIZE & PRINT</NeonButton>
             </div>
          </div>
        )}

        {appState === "consent" && (
          <div className="w-full max-w-md text-center animate-in slide-in-from-bottom-12 duration-700">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-primary">
              <Share2 className="w-12 h-12 text-primary" />
            </div>
            <h2 className="font-headline font-black text-4xl mb-6 italic uppercase tracking-tighter">BE FEATURED!</h2>
            <p className="text-sm opacity-80 mb-12 uppercase tracking-widest font-bold leading-relaxed px-6">MAY WE FEATURE YOUR PORTRAIT ON OUR FACEBOOK PAGE?</p>
            <div className="flex flex-col gap-4 px-6">
              <NeonButton onClick={() => setAppState("printing")} className="w-full py-8">YES, SHARE IT!</NeonButton>
              <button onClick={() => setAppState("printing")} className="w-full border-2 border-white/20 py-6 font-headline font-black text-xl italic uppercase tracking-widest">NO, KEEP IT PRIVATE</button>
            </div>
          </div>
        )}

        {appState === "printing" && (
          <div className="text-center animate-in zoom-in duration-500 w-full max-w-md px-6">
            <div className="space-y-10">
              <div className="bg-white/5 p-8 border-2 border-white/10">
                <div className="w-40 h-40 mx-auto mb-8 bg-white p-3 flex items-center justify-center"><ArrowRight className="w-12 h-12 text-black" /></div>
                <h3 className="font-headline font-black text-2xl mb-2 italic uppercase">SCAN SOFT COPY</h3>
                <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">Saved to JNL USB Drive</p>
              </div>

              <div className="bg-primary/5 p-8 border-2 border-primary/20">
                <div className="w-24 h-24 mx-auto mb-6 bg-white p-2">
                  <Image src="https://picsum.photos/seed/fb-qr/300/300" alt="FB" width={96} height={96} />
                </div>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Facebook className="w-5 h-5 text-primary" />
                  <h3 className="font-headline font-black text-xl italic uppercase tracking-widest">FOLLOW US</h3>
                </div>
              </div>
            </div>
            <div className="mt-12 flex flex-col gap-6">
               <div className="flex items-center gap-3 justify-center text-primary text-xs font-black italic uppercase tracking-widest"><Printer className="w-5 h-5 animate-bounce" /> PRINTING PORTRAIT...</div>
               <NeonButton onClick={resetSession} className="w-full py-8">NEW SESSION</NeonButton>
            </div>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
