
"use client";

import React, { useState, useEffect } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { HealthMonitor } from "@/components/kiosk/health-monitor";
import { Camera, Zap, Wallet, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { aiPortraitEnhancement } from "@/ai/flows/ai-portrait-enhancement";

type SessionState = "welcome" | "payment" | "capturing" | "review" | "printing";

export default function KioskPage() {
  const [appState, setAppState] = useState<SessionState>("welcome");
  const [packageSelected, setPackageSelected] = useState<50 | 100 | null>(null);
  const [paymentReceived, setPaymentReceived] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Simulated Payment Detector Logic
  useEffect(() => {
    if (appState === "payment" && paymentReceived >= (packageSelected || 0)) {
      setTimeout(() => setAppState("capturing"), 1500);
    }
  }, [paymentReceived, appState, packageSelected]);

  // Capture Logic
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
    // Mock photo capture
    const mockPhoto = "https://picsum.photos/seed/capture/1080/1440";
    setCapturedPhoto(mockPhoto);
    setIsEnhancing(true);
    
    try {
      // In a real app, we'd pass actual base64 data here
      // const enhanced = await aiPortraitEnhancement({ photoDataUri: "data:image/jpeg;base64,..." });
      // setCapturedPhoto(enhanced.enhancedPhotoDataUri);
      
      // Simulating AI process time
      await new Promise(r => setTimeout(r, 2000));
      setAppState("review");
    } catch (e) {
      console.error("AI Enhancement failed", e);
      setAppState("review");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleStart = () => setAppState("payment");
  const handleSelectPackage = (p: 50 | 100) => {
    setPackageSelected(p);
    // Simulate bill validator activation
  };

  return (
    <KioskLayout>
      {/* Dynamic JNL Studio Header */}
      <div className="absolute top-12 left-0 right-0 z-50 text-center pointer-events-none">
        <h1 className="font-headline font-black text-6xl tracking-tighter text-white neon-glow">
          JNL <span className="text-primary">STUDIO</span>
        </h1>
        <p className="font-body font-bold text-xs uppercase tracking-[0.4em] opacity-60 mt-2">
          Premium Photobooth Experience
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {appState === "welcome" && (
          <div className="text-center animate-in fade-in zoom-in duration-700">
            <div className="relative w-64 h-64 mb-12 mx-auto">
               <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
               <div className="absolute inset-4 rounded-full border-2 border-primary/40" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-24 h-24 text-primary animate-neon-pulse" />
               </div>
            </div>
            <h2 className="font-headline font-black text-4xl mb-6">READY FOR YOUR SHOT?</h2>
            <NeonButton onClick={handleStart} className="w-full max-w-sm">
              TAP TO START
            </NeonButton>
          </div>
        )}

        {appState === "payment" && (
          <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="font-headline font-black text-3xl mb-8 text-center uppercase italic">Choose Your Package</h2>
            
            <div className="grid grid-cols-1 gap-6 mb-12">
              <button 
                onClick={() => handleSelectPackage(50)}
                className={cn(
                  "p-8 border-2 transition-all text-left flex justify-between items-center relative overflow-hidden",
                  packageSelected === 50 ? "border-primary bg-primary/10" : "border-white/20 hover:border-white/50"
                )}
              >
                <div>
                  <div className="text-4xl font-black italic">50 PHP</div>
                  <div className="text-sm font-bold opacity-60 uppercase">3 Shots • Digital Only</div>
                </div>
                <ArrowRight className={cn("w-8 h-8", packageSelected === 50 ? "text-primary" : "text-white/20")} />
              </button>

              <button 
                onClick={() => handleSelectPackage(100)}
                className={cn(
                  "p-8 border-2 transition-all text-left flex justify-between items-center relative overflow-hidden",
                  packageSelected === 100 ? "border-primary bg-primary/10" : "border-white/20 hover:border-white/50"
                )}
              >
                <div>
                  <div className="text-4xl font-black italic">100 PHP</div>
                  <div className="text-sm font-bold opacity-60 uppercase">4 Shots • Digital + Print</div>
                </div>
                <Zap className={cn("w-8 h-8", packageSelected === 100 ? "text-primary" : "text-white/20")} />
              </button>
            </div>

            {packageSelected && (
              <div className="text-center p-8 border-2 border-dashed border-white/20 bg-white/5 animate-pulse">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p className="font-bold uppercase tracking-widest text-xl">Insert {packageSelected} PHP</p>
                <p className="text-xs opacity-50 mt-2">Validated payment detected automatically</p>
                
                {/* Demo Payment simulator button */}
                <button 
                  onClick={() => setPaymentReceived(packageSelected)}
                  className="mt-6 text-[10px] text-white/20 hover:text-white/40 uppercase"
                >
                  (Demo: Simulate Payment)
                </button>
              </div>
            )}
          </div>
        )}

        {appState === "capturing" && (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <div className="w-full aspect-[3/4] bg-zinc-900 border-4 border-primary relative overflow-hidden">
               {/* Camera Feed Placeholder */}
               <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/live/1080/1440')] bg-cover bg-center grayscale contrast-125" />
               <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
               
               {countdown !== null && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                    <span className="text-[12rem] font-headline font-black italic text-white animate-bounce drop-shadow-[0_0_30px_rgba(255,51,153,0.8)]">
                      {countdown}
                    </span>
                 </div>
               )}

               {isEnhancing && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                    <p className="font-headline font-black text-xl italic tracking-widest animate-pulse">OPTIMIZING PORTRAIT...</p>
                    <p className="text-[10px] uppercase opacity-60 mt-2">AI Smart Filtering & Skin-tone Preservation</p>
                 </div>
               )}
            </div>
            <div className="mt-8 text-center">
              <div className="flex gap-2 justify-center mb-4">
                 {[1,2,3].map(i => (
                   <div key={i} className={cn("w-3 h-3 rounded-full border border-primary", i === 1 ? "bg-primary" : "bg-transparent")} />
                 ))}
              </div>
              <p className="font-body font-black italic text-lg opacity-80">STRIKE A POSE!</p>
            </div>
          </div>
        )}

        {appState === "review" && (
          <div className="w-full max-w-lg animate-in fade-in duration-500">
            <h2 className="font-headline font-black text-3xl mb-6 text-center italic uppercase">Looking Sharp!</h2>
            
            <div className="relative aspect-[3/4] w-full mb-8 border-4 border-white">
               {capturedPhoto && (
                 <Image 
                   src={capturedPhoto} 
                   alt="Captured" 
                   fill 
                   className="object-cover"
                 />
               )}
               {/* Branding Watermark */}
               <div className="absolute bottom-4 right-4 text-right">
                  <div className="font-headline font-black text-xl text-white drop-shadow-md italic">
                    JNL <span className="text-primary">STUDIO</span>
                  </div>
                  <div className="text-[8px] text-white opacity-60 tracking-tighter uppercase font-bold">
                    PREMIUM PHOTOBOOTH
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <NeonButton 
                 onClick={() => setAppState("printing")} 
                 className="w-full !py-6"
               >
                 FINALIZE
               </NeonButton>
               <button 
                 onClick={() => setAppState("capturing")}
                 className="w-full border-2 border-white font-headline font-black text-lg py-6 italic hover:bg-white hover:text-black transition-colors"
               >
                 RETAKE
               </button>
            </div>
          </div>
        )}

        {appState === "printing" && (
          <div className="text-center animate-in zoom-in duration-500">
            <div className="w-64 h-64 mx-auto mb-8 bg-white p-4">
               {/* QR Placeholder */}
               <div className="w-full h-full border-8 border-black flex items-center justify-center relative">
                  <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full p-2 opacity-80">
                    {Array.from({length: 16}).map((_, i) => (
                      <div key={i} className={cn("bg-black", Math.random() > 0.5 ? "opacity-100" : "opacity-0")} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="bg-white p-1">
                        <div className="w-8 h-8 bg-primary" />
                     </div>
                  </div>
               </div>
            </div>
            <h3 className="font-headline font-black text-3xl mb-4 italic">DOWNLOAD SOFT-COPY</h3>
            <p className="text-sm opacity-60 max-w-xs mx-auto mb-12 uppercase font-bold tracking-tighter">
              Scan the QR code above to save your premium JNL Studio portraits. Link expires in 24 hours.
            </p>
            
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
               <div className="flex items-center gap-2 justify-center text-primary text-xs font-black italic mb-4">
                 <Loader2 className="w-4 h-4 animate-spin" />
                 PRINTER INITIALIZING...
               </div>
               
               <NeonButton 
                 onClick={() => {
                   setAppState("welcome");
                   setPaymentReceived(0);
                   setPackageSelected(null);
                 }} 
                 className="w-full"
               >
                 DONE
               </NeonButton>
            </div>
          </div>
        )}
      </div>

      <HealthMonitor />

      {/* Decorative Neon Accents */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-transparent to-primary opacity-20" />
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary via-transparent to-primary opacity-20" />
    </KioskLayout>
  );
}
