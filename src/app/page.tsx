"use client";

import React, { useState, useEffect, useCallback } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { HealthMonitor } from "@/components/kiosk/health-monitor";
import { AdminAuthDialog } from "@/components/kiosk/admin-auth-dialog";
import { AdminControls } from "@/components/kiosk/admin-controls";
import { Camera, Zap, Wallet, ArrowRight, Loader2, ShieldAlert, Facebook, Check, X, Share2, Sparkles, Frame } from "lucide-react";
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
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [hasSocialConsent, setHasSocialConsent] = useState<boolean | null>(null);
  
  // Customization States
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  
  // Admin Mode States
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

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
    const mockPhoto = "https://picsum.photos/seed/capture/1080/1440";
    setCapturedPhoto(mockPhoto);
    setIsEnhancing(true);
    
    try {
      await new Promise(r => setTimeout(r, 2000));
      setAppState("review");
    } catch (e) {
      setAppState("review");
    } finally {
      setIsEnhancing(false);
    }
  };

  const resetSession = useCallback(() => {
    setAppState("welcome");
    setPaymentReceived(0);
    setPackageSelected(null);
    setCapturedPhoto(null);
    setCountdown(null);
    setIsEnhancing(false);
    setHasSocialConsent(null);
    setSelectedFilter(FILTERS[0]);
    setSelectedFrame(FRAMES[0]);
  }, []);

  const handleStart = () => setAppState("payment");
  
  const handleSelectPackage = (p: 50 | 100) => {
    setPackageSelected(p);
    setPaymentReceived(0);
  };

  const handleBypassPayment = () => {
    if (isOwnerMode && packageSelected) {
      setPaymentReceived(packageSelected);
    }
  };

  const handleConsent = (agreed: boolean) => {
    setHasSocialConsent(agreed);
    setAppState("printing");
  };

  return (
    <KioskLayout>
      <div 
        className="absolute top-8 sm:top-12 left-0 right-0 z-[60] text-center cursor-default select-none active:opacity-80 transition-opacity"
        onClick={handleLogoClick}
      >
        <h1 className="font-headline font-black text-4xl sm:text-6xl tracking-tighter text-white neon-glow">
          JNL <span className="text-primary">STUDIO</span>
        </h1>
        <p className="font-body font-bold text-[8px] sm:text-xs uppercase tracking-[0.4em] opacity-60 mt-1 sm:mt-2">
          Premium Photobooth Experience
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
          onBypassPayment={handleBypassPayment}
        />
      )}

      {isOwnerMode && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter animate-pulse border border-white/20">
          <ShieldAlert className="w-3 h-3" />
          OWNER TEST MODE
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto pt-32 sm:pt-40 pb-16 sm:pb-20">
        {appState === "welcome" && (
          <div className="text-center animate-in fade-in zoom-in duration-700 w-full max-w-sm">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-8 sm:mb-12 mx-auto">
               <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
               <div className="absolute inset-4 rounded-full border-2 border-primary/40" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-16 h-16 sm:w-24 sm:h-24 text-primary animate-neon-pulse" />
               </div>
            </div>
            <h2 className="font-headline font-black text-2xl sm:text-4xl mb-6 uppercase tracking-tighter">READY FOR YOUR SHOT?</h2>
            <NeonButton onClick={handleStart} className="w-full">
              TAP TO START
            </NeonButton>
          </div>
        )}

        {appState === "payment" && (
          <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="font-headline font-black text-2xl sm:text-3xl mb-6 sm:mb-8 text-center uppercase italic">Choose Your Package</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <button 
                onClick={() => handleSelectPackage(50)}
                className={cn(
                  "p-6 sm:p-8 border-2 transition-all text-left flex justify-between items-center relative overflow-hidden",
                  packageSelected === 50 ? "border-primary bg-primary/10" : "border-white/20 hover:border-white/50"
                )}
              >
                <div>
                  <div className="text-3xl sm:text-4xl font-black italic">50 PHP</div>
                  <div className="text-[10px] sm:text-sm font-bold opacity-60 uppercase">3 Shots • Digital Only</div>
                </div>
                <ArrowRight className={cn("w-6 h-6 sm:w-8 sm:h-8", packageSelected === 50 ? "text-primary" : "text-white/20")} />
              </button>

              <button 
                onClick={() => handleSelectPackage(100)}
                className={cn(
                  "p-6 sm:p-8 border-2 transition-all text-left flex justify-between items-center relative overflow-hidden",
                  packageSelected === 100 ? "border-primary bg-primary/10" : "border-white/20 hover:border-white/50"
                )}
              >
                <div>
                  <div className="text-3xl sm:text-4xl font-black italic">100 PHP</div>
                  <div className="text-[10px] sm:text-sm font-bold opacity-60 uppercase">6 Shots • Digital + Print</div>
                </div>
                <Zap className={cn("w-6 h-6 sm:w-8 sm:h-8", packageSelected === 100 ? "text-primary" : "text-white/20")} />
              </button>
            </div>

            {packageSelected && (
              <div className="text-center p-6 sm:p-8 border-2 border-dashed border-white/20 bg-white/5">
                <Wallet className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-primary animate-bounce" />
                <p className="font-bold uppercase tracking-widest text-lg sm:text-xl">Insert {packageSelected} PHP</p>
                <p className="text-[10px] opacity-50 mt-2">Waiting for hardware payment signal...</p>
                
                {isOwnerMode && (
                  <NeonButton 
                    onClick={handleBypassPayment}
                    className="mt-6 w-full !py-4 bg-green-600 border-green-600 shadow-green-900/50"
                  >
                    OWNER BYPASS PAYMENT
                  </NeonButton>
                )}
              </div>
            )}
          </div>
        )}

        {appState === "capturing" && (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <div className="w-full aspect-[3/4] max-h-[60vh] bg-zinc-900 border-4 border-primary relative overflow-hidden shadow-[0_0_50px_rgba(255,51,153,0.3)]">
               <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/live/1080/1440')] bg-cover bg-center grayscale contrast-125" />
               <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
               
               {countdown !== null && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                    <span className="text-[8rem] sm:text-[12rem] font-headline font-black italic text-white animate-bounce drop-shadow-[0_0_30px_rgba(255,51,153,0.8)]">
                      {countdown}
                    </span>
                 </div>
               )}

               {isEnhancing && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30">
                    <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-primary animate-spin mb-4" />
                    <p className="font-headline font-black text-lg sm:text-xl italic tracking-widest animate-pulse uppercase text-center px-4">OPTIMIZING PORTRAIT...</p>
                    <p className="text-[8px] sm:text-[10px] uppercase opacity-60 mt-2 font-bold">AI Smart Filtering & Skin-tone Preservation</p>
                 </div>
               )}
            </div>
            <div className="mt-6 sm:mt-8 text-center">
              <div className="flex gap-2 justify-center mb-4">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className={cn("w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-primary", i === 1 ? "bg-primary" : "bg-transparent")} />
                 ))}
              </div>
              <p className="font-body font-black italic text-base sm:text-lg opacity-80 uppercase tracking-widest">Strike a pose!</p>
            </div>
          </div>
        )}

        {appState === "review" && (
          <div className="w-full max-w-lg animate-in fade-in duration-500">
            <h2 className="font-headline font-black text-2xl sm:text-3xl mb-4 sm:mb-6 text-center italic uppercase">Looking Sharp!</h2>
            
            <div className="relative aspect-[3/4] max-h-[50vh] w-full mb-6 sm:mb-8 border-4 border-white shadow-2xl overflow-hidden mx-auto">
               {capturedPhoto && (
                 <Image 
                   src={capturedPhoto} 
                   alt="Captured" 
                   fill 
                   className="object-cover"
                 />
               )}
               <div className="absolute bottom-4 right-4 text-right">
                  <div className="font-headline font-black text-lg sm:text-xl text-white drop-shadow-md italic">
                    JNL <span className="text-primary">STUDIO</span>
                  </div>
                  <div className="text-[6px] sm:text-[8px] text-white opacity-60 tracking-tighter uppercase font-bold">
                    PREMIUM PHOTOBOOTH
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
               <NeonButton 
                 onClick={() => setAppState("editing")} 
                 className="w-full !py-4 sm:!py-6 text-sm sm:text-lg"
               >
                 CUSTOMIZE
               </NeonButton>
               <button 
                 onClick={() => setAppState("capturing")}
                 className="w-full border-2 border-white font-headline font-black text-sm sm:text-lg py-4 sm:py-6 italic hover:bg-white hover:text-black transition-colors uppercase"
               >
                 RETAKE
               </button>
            </div>
          </div>
        )}

        {appState === "editing" && (
          <div className="w-full max-w-lg animate-in fade-in duration-500">
            <h2 className="font-headline font-black text-2xl sm:text-3xl mb-4 sm:mb-6 text-center italic uppercase">Style Your Shot</h2>
            
            <div className="relative aspect-[3/4] max-h-[40vh] w-full mb-6 sm:mb-8 flex items-center justify-center bg-zinc-900 border border-white/10 p-2 sm:p-4 mx-auto">
              <div className={cn("relative w-full h-full transition-all duration-500", selectedFrame.border)}>
                {capturedPhoto && (
                   <Image 
                     src={capturedPhoto} 
                     alt="Editing Preview" 
                     fill 
                     className={cn("object-cover transition-all duration-500", selectedFilter.class)}
                   />
                 )}
                 <div className="absolute bottom-4 right-4 text-right z-10 pointer-events-none">
                    <div className="font-headline font-black text-lg sm:text-xl text-white drop-shadow-md italic">
                      JNL <span className="text-primary">STUDIO</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3 text-primary uppercase font-black text-[10px] sm:text-xs tracking-widest">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> Filters
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f)}
                      className={cn(
                        "py-2 sm:py-3 text-[8px] sm:text-[10px] font-black uppercase border-2 transition-all italic",
                        selectedFilter.id === f.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40 hover:border-white/30"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3 text-primary uppercase font-black text-[10px] sm:text-xs tracking-widest">
                  <Frame className="w-3 h-3 sm:w-4 sm:h-4" /> Frames
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {FRAMES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFrame(f)}
                      className={cn(
                        "py-2 sm:py-3 text-[8px] sm:text-[10px] font-black uppercase border-2 transition-all italic",
                        selectedFrame.id === f.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40 hover:border-white/30"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <NeonButton 
                onClick={() => setAppState("consent")} 
                className="w-full !py-4 sm:!py-6 mt-4 sm:mt-8"
              >
                APPLY & FINISH
              </NeonButton>
            </div>
          </div>
        )}

        {appState === "consent" && (
          <div className="w-full max-w-md text-center animate-in slide-in-from-bottom-12 duration-700">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border-2 border-primary">
              <Share2 className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
            </div>
            <h2 className="font-headline font-black text-3xl sm:text-4xl mb-4 italic uppercase">BE FEATURED!</h2>
            <p className="text-[10px] sm:text-sm opacity-80 mb-8 sm:mb-12 uppercase tracking-widest font-bold leading-relaxed px-4">
              May we feature your stunning JNL Studio portrait on our official Facebook page for promotional purposes?
            </p>
            
            <div className="flex flex-col gap-3 sm:gap-4 px-4">
              <NeonButton 
                onClick={() => handleConsent(true)} 
                className="w-full !py-6 sm:!py-8 bg-primary border-primary flex items-center justify-center gap-2 sm:gap-3"
              >
                <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                YES, SHARE IT!
              </NeonButton>
              
              <button 
                onClick={() => handleConsent(false)}
                className="w-full border-2 border-white/20 py-4 sm:py-6 font-headline font-black text-sm sm:text-lg italic hover:bg-white/10 transition-colors flex items-center justify-center gap-2 sm:gap-3 uppercase"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 opacity-40" />
                NO, KEEP IT PRIVATE
              </button>
            </div>
            
            <p className="text-[8px] sm:text-[10px] opacity-40 uppercase font-bold mt-8 sm:mt-12 tracking-tighter">
              Your privacy is our priority. We only post with your explicit consent.
            </p>
          </div>
        )}

        {appState === "printing" && (
          <div className="text-center animate-in zoom-in duration-500 w-full max-w-sm px-4">
            <div className="space-y-8 sm:space-y-12">
              <div className="bg-white/5 p-4 sm:p-6 border-2 border-white/10">
                <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-4 sm:mb-6 bg-white p-2">
                   <div className="w-full h-full border-4 border-black flex items-center justify-center relative overflow-hidden">
                      <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full p-1 opacity-80">
                        {Array.from({length: 16}).map((_, i) => (
                          <div key={i} className={cn("bg-black", i % 3 === 0 ? "opacity-100" : "opacity-0")} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="bg-white p-1 shadow-lg">
                            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-primary" />
                         </div>
                      </div>
                   </div>
                </div>
                <h3 className="font-headline font-black text-xl sm:text-2xl mb-1 sm:mb-2 italic uppercase">DOWNLOAD PHOTO</h3>
                <p className="text-[8px] sm:text-[10px] opacity-60 uppercase font-bold tracking-tighter">
                  Scan to save your premium JNL portraits
                </p>
              </div>

              <div className="bg-primary/5 p-4 sm:p-6 border-2 border-primary/20 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-10">
                  <Facebook className="w-16 h-16 sm:w-24 sm:h-24 text-primary" />
                </div>
                <div className="w-24 h-24 sm:w-40 sm:h-40 mx-auto mb-4 sm:mb-6 bg-white p-2 relative z-10">
                  <Image 
                    src="https://picsum.photos/seed/fb-qr/300/300" 
                    alt="Facebook QR" 
                    width={160} 
                    height={160} 
                    className="grayscale contrast-125"
                  />
                </div>
                <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h3 className="font-headline font-black text-lg sm:text-xl italic uppercase tracking-tighter">FOLLOW JNL STUDIO</h3>
                </div>
                <p className="text-[8px] sm:text-[10px] opacity-60 uppercase font-bold tracking-tighter">
                  Stay updated with our latest promotions
                </p>
              </div>
            </div>
            
            <div className="mt-8 sm:mt-12 flex flex-col gap-4">
               <div className="flex items-center gap-2 justify-center text-primary text-[10px] sm:text-xs font-black italic mb-2 sm:mb-4 uppercase tracking-widest">
                 <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                 PRINTER READYING...
               </div>
               
               <NeonButton 
                 onClick={resetSession} 
                 className="w-full !py-4 sm:!py-6"
               >
                 DONE
               </NeonButton>
            </div>
          </div>
        )}
      </div>

      <HealthMonitor />

      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-transparent to-primary opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary via-transparent to-primary opacity-20 pointer-events-none" />
    </KioskLayout>
  );
}
