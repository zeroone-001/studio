"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { AdminAuthDialog } from "@/components/kiosk/admin-auth-dialog";
import { AdminControls } from "@/components/kiosk/admin-controls";
import { Camera, Zap, Wallet, ArrowRight, Loader2, ShieldAlert, Facebook, Check, X, Share2, Sparkles, Frame, Usb, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type SessionState = "welcome" | "payment" | "capturing" | "review" | "editing" | "consent" | "printing";

const FILTERS = [
  { id: "none", label: "NORMAL", class: "" },
  { id: "bw", label: "B&W", class: "grayscale" },
  { id: "sepia", label: "VINTAGE", class: "sepia contrast-125" },
  { id: "vivid", label: "VIVID", class: "saturate-150 contrast-110" },
];

const FRAMES = [
  { id: "none", label: "NO FRAME", border: "border-transparent" },
  { id: "neon", label: "NEON GLOW", border: "border-primary shadow-[0_0_20px_rgba(255,51,153,0.5)]" },
  { id: "vintage", label: "CLASSIC WHITE", border: "border-[16px] border-white" },
  { id: "minimal", label: "MINIMALIST", border: "border-2 border-white/20" },
];

export default function KioskPage() {
  const [appState, setAppState] = useState<SessionState>("welcome");
  const [packageSelected, setPackageSelected] = useState<50 | 100 | null>(null);
  const [paymentReceived, setPaymentReceived] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [hasSocialConsent, setHasSocialConsent] = useState<boolean | null>(null);
  
  // Customization States
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  
  // Admin & Storage States
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [usbHandle, setUsbHandle] = useState<any>(null);
  const [usbError, setUsbError] = useState<string | null>(null);

  // USB Storage Logic
  const setupUsbStorage = async () => {
    try {
      // @ts-ignore - File System Access API
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });
      setUsbHandle(handle);
      setUsbError(null);
    } catch (e: any) {
      console.error("USB setup failed", e);
      setUsbError("Permission denied or USB disconnected.");
    }
  };

  const saveToUsb = async (dataUri: string) => {
    if (!usbHandle) return false;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const sessionId = Math.random().toString(36).substring(7);
      
      // Create folder structure: Date/Session/photo.jpg
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
      console.error("USB save error", e);
      setUsbError("USB storage error. Please re-connect.");
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
          setAppState("capturing");
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [paymentReceived, appState, packageSelected]);

  useEffect(() => {
    if (appState === "capturing") {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            takePhoto();
            return null;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [appState]);

  const takePhoto = async () => {
    setIsProcessing(true);
    // Simulate high-quality capture
    const mockPhoto = `https://picsum.photos/seed/${Date.now()}/1080/1440`;
    
    try {
      if (usbHandle) {
        await saveToUsb(mockPhoto);
      }
      setCapturedPhoto(mockPhoto);
      await new Promise(r => setTimeout(r, 2500));
      setAppState("review");
    } catch (e) {
      setAppState("review");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSession = useCallback(() => {
    setAppState("welcome");
    setPaymentReceived(0);
    setPackageSelected(null);
    setCapturedPhoto(null);
    setCountdown(null);
    setIsProcessing(false);
    setHasSocialConsent(null);
    setSelectedFilter(FILTERS[0]);
    setSelectedFrame(FRAMES[0]);
  }, []);

  return (
    <KioskLayout>
      {/* Hidden Owner Trigger on Logo */}
      <div 
        className="absolute top-12 left-0 right-0 z-[60] text-center cursor-default select-none active:opacity-80 transition-opacity"
        onClick={handleLogoClick}
      >
        <h1 className="font-headline font-black text-5xl sm:text-7xl tracking-tighter text-white neon-glow">
          JNL <span className="text-primary">STUDIO</span>
        </h1>
        <p className="font-body font-bold text-[10px] sm:text-sm uppercase tracking-[0.4em] opacity-60 mt-2">
          Premium Portrait Kiosk
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

      {/* Owner & Storage Badge */}
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
            USB STORAGE ACTIVE
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto pt-36 sm:pt-48 pb-20 sm:pb-24">
        
        {/* USB Missing Warning (Only if trying to capture) */}
        {!usbHandle && !isOwnerMode && appState === "payment" && (
          <div className="mb-6 w-full max-w-md bg-amber-500/20 border-2 border-amber-500 p-4 animate-pulse flex items-center gap-4">
             <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
             <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
               SYSTEM NOTICE: External storage required. Contact staff before starting.
             </p>
          </div>
        )}

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
                  <div className="text-[10px] sm:text-sm font-bold opacity-60 uppercase mt-2">3 SHOTS • PREMIUM DIGITAL</div>
                </div>
                <ArrowRight className={cn("w-8 h-8 sm:w-10 h-10", packageSelected === 50 ? "text-primary" : "text-white/20")} />
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
                  <div className="text-[10px] sm:text-sm font-bold opacity-60 uppercase mt-2">6 SHOTS • DIGITAL + PRINT</div>
                </div>
                <Zap className={cn("w-8 h-8 sm:w-10 h-10", packageSelected === 100 ? "text-primary" : "text-white/20")} />
              </button>
            </div>

            {packageSelected && (
              <div className="text-center p-8 sm:p-12 border-2 border-dashed border-white/20 bg-white/5">
                <Wallet className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 text-primary animate-bounce" />
                <p className="font-bold uppercase tracking-widest text-2xl sm:text-3xl">Insert {packageSelected} PHP</p>
                <p className="text-[10px] opacity-50 mt-4 font-bold uppercase tracking-wider italic">Awaiting Hardware Signal...</p>
              </div>
            )}
          </div>
        )}

        {appState === "capturing" && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full aspect-[3/4] max-h-[65vh] bg-zinc-900 border-4 border-primary relative overflow-hidden shadow-[0_0_60px_rgba(255,51,153,0.4)]">
               <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/live/1080/1440')] bg-cover bg-center grayscale contrast-125 brightness-75" />
               <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
               
               {countdown !== null && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                    <span className="text-[10rem] sm:text-[16rem] font-headline font-black italic text-white animate-bounce drop-shadow-[0_0_40px_rgba(255,51,153,0.9)]">
                      {countdown}
                    </span>
                 </div>
               )}

               {isProcessing && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30">
                    <Loader2 className="w-16 h-16 sm:w-20 sm:h-20 text-primary animate-spin mb-6" />
                    <p className="font-headline font-black text-2xl sm:text-3xl italic tracking-widest animate-pulse uppercase text-center px-6">SAVING TO USB...</p>
                    <p className="text-[10px] sm:text-xs uppercase opacity-60 mt-4 font-bold tracking-[0.3em]">AI Enhanced Portrait Processing</p>
                 </div>
               )}
            </div>
            <div className="mt-8 sm:mt-10 text-center">
              <div className="flex gap-3 justify-center mb-6">
                 {Array.from({length: packageSelected === 100 ? 6 : 3}).map((_, i) => (
                   <div key={i} className={cn("w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-primary", i === 0 ? "bg-primary" : "bg-transparent")} />
                 ))}
              </div>
              <p className="font-body font-black italic text-xl sm:text-2xl opacity-80 uppercase tracking-widest animate-pulse">Strike a pose!</p>
            </div>
          </div>
        )}

        {appState === "review" && (
          <div className="w-full max-w-lg animate-in fade-in duration-500">
            <h2 className="font-headline font-black text-3xl sm:text-4xl mb-6 sm:mb-10 text-center italic uppercase">Looking Sharp!</h2>
            
            <div className="relative aspect-[3/4] max-h-[55vh] w-full mb-8 sm:mb-12 border-4 border-white shadow-2xl overflow-hidden mx-auto">
               {capturedPhoto && (
                 <Image src={capturedPhoto} alt="Captured" fill className="object-cover" />
               )}
               <div className="absolute bottom-6 right-6 text-right">
                  <div className="font-headline font-black text-2xl sm:text-3xl text-white drop-shadow-md italic">
                    JNL <span className="text-primary">STUDIO</span>
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-white opacity-60 tracking-tighter uppercase font-bold">
                    PREMIUM PHOTOBOOTH
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
               <NeonButton onClick={() => setAppState("editing")} className="w-full py-8 sm:py-10 text-xl">
                 CUSTOMIZE
               </NeonButton>
               <button 
                 onClick={() => setAppState("capturing")}
                 className="w-full border-2 border-white font-headline font-black text-xl sm:text-2xl py-8 sm:py-10 italic hover:bg-white hover:text-black transition-colors uppercase"
               >
                 RETAKE
               </button>
            </div>
          </div>
        )}

        {appState === "editing" && (
          <div className="w-full max-w-lg animate-in fade-in duration-500">
            <h2 className="font-headline font-black text-3xl sm:text-4xl mb-6 sm:mb-10 text-center italic uppercase">Style Your Shot</h2>
            
            <div className="relative aspect-[3/4] max-h-[45vh] w-full mb-8 sm:mb-10 flex items-center justify-center bg-zinc-900 border border-white/10 p-4 mx-auto">
              <div className={cn("relative w-full h-full transition-all duration-500", selectedFrame.border)}>
                {capturedPhoto && (
                   <Image src={capturedPhoto} alt="Preview" fill className={cn("object-cover transition-all duration-500", selectedFilter.class)} />
                 )}
                 <div className="absolute bottom-6 right-6 text-right z-10">
                    <div className="font-headline font-black text-2xl text-white drop-shadow-md italic">
                      JNL <span className="text-primary">STUDIO</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-4 text-primary uppercase font-black text-xs sm:text-sm tracking-widest">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> Filters
                </div>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f)}
                      className={cn(
                        "py-3 sm:py-5 text-[10px] sm:text-xs font-black uppercase border-2 transition-all italic",
                        selectedFilter.id === f.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40 hover:border-white/30"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4 text-primary uppercase font-black text-xs sm:text-sm tracking-widest">
                  <Frame className="w-4 h-4 sm:w-5 sm:h-5" /> Frames
                </div>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {FRAMES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFrame(f)}
                      className={cn(
                        "py-3 sm:py-5 text-[10px] sm:text-xs font-black uppercase border-2 transition-all italic",
                        selectedFrame.id === f.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40 hover:border-white/30"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <NeonButton onClick={() => setAppState("consent")} className="w-full py-8 sm:py-10 mt-6 sm:mt-10">
                APPLY & FINISH
              </NeonButton>
            </div>
          </div>
        )}

        {appState === "consent" && (
          <div className="w-full max-w-md text-center animate-in slide-in-from-bottom-12 duration-700">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-10 sm:mb-12 border-2 border-primary">
              <Share2 className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
            </div>
            <h2 className="font-headline font-black text-4xl sm:text-6xl mb-6 italic uppercase tracking-tighter">BE FEATURED!</h2>
            <p className="text-sm sm:text-lg opacity-80 mb-12 sm:mb-16 uppercase tracking-widest font-bold leading-relaxed px-6">
              MAY WE FEATURE YOUR PORTRAIT ON OUR FACEBOOK PAGE FOR PROMOTION?
            </p>
            
            <div className="flex flex-col gap-4 sm:gap-6 px-6">
              <NeonButton 
                onClick={() => { setHasSocialConsent(true); setAppState("printing"); }} 
                className="w-full py-8 sm:py-12 bg-primary border-primary flex items-center justify-center gap-4"
              >
                <Check className="w-8 h-8" />
                YES, SHARE IT!
              </NeonButton>
              
              <button 
                onClick={() => { setHasSocialConsent(false); setAppState("printing"); }}
                className="w-full border-2 border-white/20 py-6 sm:py-10 font-headline font-black text-xl sm:text-2xl italic hover:bg-white/10 transition-colors uppercase tracking-widest"
              >
                NO, KEEP IT PRIVATE
              </button>
            </div>
          </div>
        )}

        {appState === "printing" && (
          <div className="text-center animate-in zoom-in duration-500 w-full max-w-md px-6">
            <div className="space-y-10 sm:space-y-14">
              <div className="bg-white/5 p-8 sm:p-12 border-2 border-white/10">
                <div className="w-40 h-40 sm:w-56 sm:h-56 mx-auto mb-8 bg-white p-3">
                   <div className="w-full h-full border-4 border-black flex items-center justify-center relative overflow-hidden">
                      <div className="grid grid-cols-5 grid-rows-5 gap-2 w-full h-full p-2 opacity-80">
                        {Array.from({length: 25}).map((_, i) => (
                          <div key={i} className={cn("bg-black", i % 2 === 0 ? "opacity-100" : "opacity-0")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="bg-white p-2 shadow-2xl">
                            <div className="w-8 h-8 bg-primary" />
                         </div>
                      </div>
                   </div>
                </div>
                <h3 className="font-headline font-black text-2xl sm:text-3xl mb-2 italic uppercase">DOWNLOAD PHOTO</h3>
                <p className="text-[10px] sm:text-xs opacity-60 uppercase font-bold tracking-widest">Scan to save your soft copy from USB</p>
              </div>

              <div className="bg-primary/5 p-8 sm:p-12 border-2 border-primary/20 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 opacity-10">
                  <Facebook className="w-24 h-24 sm:w-32 sm:h-32 text-primary" />
                </div>
                <div className="w-24 h-24 sm:w-40 sm:h-40 mx-auto mb-6 bg-white p-2 relative z-10">
                  <Image src="https://picsum.photos/seed/fb-qr/300/300" alt="FB" width={160} height={160} className="grayscale contrast-125" />
                </div>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Facebook className="w-6 h-6 text-primary" />
                  <h3 className="font-headline font-black text-xl sm:text-2xl italic uppercase tracking-widest">FOLLOW JNL STUDIO</h3>
                </div>
              </div>
            </div>
            
            <div className="mt-12 sm:mt-16 flex flex-col gap-6">
               <div className="flex items-center gap-3 justify-center text-primary text-xs sm:text-sm font-black italic uppercase tracking-widest">
                 <Loader2 className="w-5 h-5 animate-spin" />
                 PRINTER INITIALIZING...
               </div>
               
               <NeonButton onClick={resetSession} className="w-full py-8 sm:py-10">
                 DONE
               </NeonButton>
            </div>
          </div>
        )}
      </div>

      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary via-transparent to-primary opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary via-transparent to-primary opacity-20 pointer-events-none" />
    </KioskLayout>
  );
}