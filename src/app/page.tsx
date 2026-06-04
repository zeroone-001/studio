
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { AdminAuthDialog } from "@/components/kiosk/admin-auth-dialog";
import { AdminControls } from "@/components/kiosk/admin-controls";
import { JnlLogo } from "@/components/kiosk/jnl-logo";
import { 
  Wallet, Sparkles, Frame, Quote, Trash2, Cat, Moon, Sun, 
  Coffee, Pizza, Flower2, Crown, Layers, CameraIcon, Flashlight, User, HeartIcon,
  ShieldCheck, QrCode, Facebook, CheckCircle2, Printer, Share2, Usb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BLUEPRINTS, FrameBlueprint } from "@/components/kiosk/frame-blueprint";
import { BlueprintFrame } from "@/components/kiosk/blueprint-frame";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import * as Kawaii from "@/components/kiosk/kawaii-stickers";

export type SessionState = "welcome" | "payment" | "setup" | "capturing" | "review" | "decorating" | "consent" | "printing" | "test-stickers";

export const FILTERS = [
  { id: "natural", label: "STYLE A", class: "contrast-110 brightness-105 saturate-110" },
  { id: "silver", label: "STYLE B", class: "grayscale contrast-125 brightness-110" },
  { id: "vintage", label: "STYLE C", class: "sepia-[0.4] saturate-150 contrast-110 brightness-105" },
  { id: "dreamy", label: "STYLE D", class: "brightness-115 contrast-90 saturate-125 blur-[0.3px]" },
  { id: "nordic", label: "STYLE E", class: "hue-rotate-[15deg] saturate-75 brightness-110 contrast-105" },
  { id: "noir", label: "STYLE F", class: "grayscale contrast-150 brightness-90" },
  { id: "radiant", label: "STYLE G", class: "brightness-125 contrast-110 saturate-150" },
  { id: "autumn", label: "STYLE H", class: "sepia-[0.2] hue-rotate-[-10deg] saturate-150 contrast-110" },
  { id: "pacific", label: "STYLE I", class: "hue-rotate-[180deg] saturate-50 brightness-110 contrast-110" },
  { id: "aesthetic", label: "STYLE J", class: "saturate-[0.6] brightness-115 contrast-105" },
];

export const STICKER_DEFS = [
  { id: "puffy-heart", icon: Kawaii.PuffyHeart, color: "", category: "HEARTS" },
  { id: "ribbon-heart", icon: Kawaii.RibbonHeart, color: "", category: "HEARTS" },
  { id: "sparkle-heart", icon: HeartIcon, color: "text-pink-300", category: "HEARTS" },
  { id: "bunny", icon: Kawaii.KawaiiBunny, color: "", category: "CUTE" },
  { id: "bear", icon: Kawaii.TeddyBear, color: "", category: "CUTE" },
  { id: "cat-face", icon: Cat, color: "text-orange-200", category: "CUTE" },
  { id: "pizza", icon: Pizza, color: "text-yellow-600", category: "CUTE" },
  { id: "coffee", icon: Coffee, color: "text-amber-900", category: "CUTE" },
  { id: "mini-camera", icon: CameraIcon, color: "text-zinc-400", category: "PHOTO" },
  { id: "film", icon: Layers, color: "text-zinc-500", category: "PHOTO" },
  { id: "flash", icon: Flashlight, color: "text-yellow-400", category: "PHOTO" },
  { id: "selfie", icon: User, color: "text-blue-300", category: "PHOTO" },
  { id: "cloud", icon: Kawaii.KawaiiCloud, color: "", category: "AESTHETIC" },
  { id: "sparkle", icon: Kawaii.PastelSparkle, color: "", category: "AESTHETIC" },
  { id: "moon", icon: Moon, color: "text-indigo-200", category: "AESTHETIC" },
  { id: "sun", icon: Sun, color: "text-yellow-300", category: "AESTHETIC" },
  { id: "crown", icon: Crown, color: "text-yellow-400", category: "AESTHETIC" },
  { id: "flower", icon: Flower2, color: "text-pink-400", category: "AESTHETIC" },
  { id: "slay", icon: Kawaii.SlayText, color: "", category: "TEXT" },
  { id: "cutie", icon: Kawaii.CutieText, color: "", category: "TEXT" },
  { id: "besties", icon: Kawaii.BestiesText, color: "", category: "TEXT" },
];

export const QUOTES = [
  { id: "none", text: "", label: "NONE" },
  { id: "stay", text: "STAY POSITIVE", label: "POSITIVE" },
  { id: "magic", text: "JNL MAGIC", label: "MAGIC" },
  { id: "iconic", text: "PURE ICONIC", label: "ICONIC" },
  { id: "best", text: "BEST DAY EVER", label: "BEST DAY" },
  { id: "gold", text: "YOU ARE GOLD", label: "GOLD" },
  { id: "shine", text: "KEEP SHINING", label: "SHINE" },
  { id: "humble", text: "STAY HUMBLE", label: "HUMBLE" },
  { id: "love", text: "RADIATE LOVE", label: "LOVE" },
  { id: "kind", text: "BE KIND", label: "KIND" },
  { id: "dream", text: "DREAM BIG", label: "DREAM" },
  { id: "loud", text: "LIVE LOUD", label: "LOUD" },
  { id: "joy", text: "CHOOSE JOY", label: "JOY" },
  { id: "light", text: "BE THE LIGHT", label: "LIGHT" },
  { id: "gotthis", text: "YOU GOT THIS", label: "GOT THIS" },
  { id: "brave", text: "BOLD & BRAVE", label: "BRAVE" },
  { id: "vibes", text: "GOOD VIBES", label: "VIBES" },
  { id: "true", text: "STAY TRUE", label: "TRUE" },
  { id: "fearless", text: "FEARLESS", label: "FEARLESS" },
  { id: "make", text: "MAKE MAGIC", label: "MAKE" },
  { id: "bliss", text: "PURE BLISS", label: "BLISS" },
  { id: "soul", text: "ICONIC SOUL", label: "SOUL" },
  { id: "authentic", text: "BE AUTHENTIC", label: "AUTHENTIC" },
  { id: "limitless", text: "LIMITLESS", label: "LIMIT" },
  { id: "curious", text: "STAY CURIOUS", label: "CURIOUS" },
  { id: "ownvibe", text: "OWN YOUR VIBE", label: "OWN VIBE" },
  { id: "bright", text: "SHINE BRIGHT", label: "BRIGHT" },
  { id: "heartgold", text: "HEART OF GOLD", label: "HEART" },
  { id: "keepgoing", text: "KEEP GOING", label: "GOING" },
  { id: "smile", text: "JUST SMILE", label: "SMILE" },
  { id: "today", text: "TODAY IS GOOD", label: "TODAY" },
  { id: "inside", text: "MAGIC INSIDE", label: "INSIDE" },
  { id: "wild", text: "STAY WILD", label: "WILD" },
  { id: "born", text: "BORN TO SHINE", label: "BORN" },
  { id: "braveheart", text: "BRAVE HEART", label: "HEART" },
  { id: "dreamer", text: "DREAMER", label: "DREAMER" },
  { id: "strong", text: "STAY STRONG", label: "STRONG" },
  { id: "energy", text: "PURE ENERGY", label: "ENERGY" },
  { id: "lovelife", text: "LOVE LIFE", label: "LOVE LIFE" },
  { id: "unstoppable", text: "BE UNSTOPPABLE", label: "UNSTOP" },
  { id: "inspired", text: "STAY INSPIRED", label: "INSPIRED" },
  { id: "blooming", text: "KEEP BLOOMING", label: "BLOOM" },
  { id: "radiant", text: "RADIANT VIBE", label: "RADIANT" },
  { id: "bold", text: "BE BOLD", label: "BOLD" },
  { id: "fully", text: "LIVE FULLY", label: "FULLY" },
  { id: "sweet", text: "STAY SWEET", label: "SWEET" },
  { id: "enough", text: "YOU ARE ENOUGH", label: "ENOUGH" },
  { id: "count", text: "MAKE IT COUNT", label: "COUNT" },
  { id: "grateful", text: "STAY GRATEFUL", label: "GRATEFUL" },
  { id: "happiness", text: "PURE HAPPINESS", label: "HAPPY" },
  { id: "beyond", text: "BEYOND LIMITS", label: "BEYOND" },
  { id: "always", text: "SHINE ALWAYS", label: "ALWAYS" },
  { id: "change", text: "BE THE CHANGE", label: "CHANGE" },
  { id: "moments", text: "MAGIC MOMENTS", label: "MOMENTS" },
];

export interface PlacedSticker {
  id: string;
  type: string;
  x: number; 
  y: number; 
  size: number;
  rotation: number;
}

export default function KioskPage() {
  const [appState, setAppState] = useState<SessionState>("welcome");
  const [packageSelected, setPackageSelected] = useState<50 | 100 | null>(null);
  const [paymentReceived, setPaymentReceived] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [printProgress, setPrintProgress] = useState(0);
  const [promotionalConsent, setPromotionalConsent] = useState<boolean | null>(null);
  const [isSavingToUsb, setIsSavingToUsb] = useState(false);
  
  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Customization States
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<FrameBlueprint | null>(null);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedQuote, setSelectedQuote] = useState(QUOTES[0]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [activeStickerCategory, setActiveStickerCategory] = useState("HEARTS");

  // Admin & Storage States
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [usbHandle, setUsbHandle] = useState<any>(null);
  const [isDevMode, setIsDevMode] = useState(true);

  // Hidden Trigger Logic
  const [logoTapCount, setLogoTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleHiddenTrigger = useCallback(() => {
    setLogoTapCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setIsAdminDialogOpen(true);
        return 0;
      }
      
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = setTimeout(() => setLogoTapCount(0), 1000);
      
      return newCount;
    });
  }, []);

  const availableBlueprints = useMemo(() => {
    if (!packageSelected) return [];
    return BLUEPRINTS.filter(bp => bp.package === packageSelected);
  }, [packageSelected]);

  const availableFilters = useMemo(() => {
    return FILTERS.slice(0, packageSelected === 100 ? 10 : 5);
  }, [packageSelected]);

  useEffect(() => {
    if (packageSelected) {
      const first = BLUEPRINTS.find(bp => bp.package === packageSelected);
      if (first) setSelectedBlueprint(first);
    }
  }, [packageSelected]);

  useEffect(() => {
    if (appState === "printing" && printProgress < 100) {
      const timer = setInterval(() => {
        setPrintProgress(prev => Math.min(prev + 2, 100));
      }, 100);
      return () => clearInterval(timer);
    }
  }, [appState, printProgress]);

  // USB Auto-Save Logic
  useEffect(() => {
    if (appState === "printing" && promotionalConsent === true && usbHandle) {
      setIsSavingToUsb(true);
      const timer = setTimeout(() => {
        setIsSavingToUsb(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [appState, promotionalConsent, usbHandle]);

  const resetSession = useCallback(() => {
    stopCamera();
    setAppState("welcome");
    setPaymentReceived(0);
    setPackageSelected(null);
    setCapturedPhotos([]);
    setCurrentShotIndex(0);
    setCountdown(null);
    setIsProcessing(false);
    setSelectedBlueprint(null);
    setSelectedFilter(FILTERS[0]);
    setPlacedStickers([]);
    setSelectedQuote(QUOTES[0]);
    setSelectedStickerId(null);
    setPrintProgress(0);
    setPromotionalConsent(null);
    setIsSavingToUsb(false);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (appState === "printing" && printProgress === 100) {
      timer = setTimeout(() => {
        resetSession();
      }, 45000); 
    }
    return () => clearTimeout(timer);
  }, [appState, printProgress, resetSession]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1706 } },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraError(null);
    } catch (err) {
      setCameraError("Unable to access device camera.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const takePhoto = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.9);
    }
    return null;
  };

  const startShotSequence = async () => {
    const totalShots = packageSelected === 50 ? 3 : 6;
    const photos: string[] = [];
    for (let i = 0; i < totalShots; i++) {
      setCurrentShotIndex(i + 1);
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(null);
      setIsProcessing(true);
      const shot = takePhoto();
      photos.push(shot || `https://picsum.photos/seed/jnl-${Date.now()}-${i}/1200/1600`);
      await new Promise(r => setTimeout(r, 800)); 
      setIsProcessing(false);
    }
    setCapturedPhotos(photos);
    setAppState("review");
  };

  useEffect(() => {
    if (appState === "setup" || appState === "capturing") {
      startCamera();
    } else {
      stopCamera();
    }
  }, [appState]);

  useEffect(() => {
    if (appState === "capturing") {
      startShotSequence();
    }
  }, [appState]);

  const addSticker = useCallback((type: string) => {
    const newSticker: PlacedSticker = { id: `sticker-${Date.now()}`, type, x: 50, y: 40, size: 15, rotation: 0 };
    setPlacedStickers(prev => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  }, []);

  const handleUpdateSticker = useCallback((id: string, updates: Partial<PlacedSticker>) => {
    setPlacedStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const handleRemoveSticker = useCallback((id: string) => {
    setPlacedStickers(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleBringToFront = useCallback((id: string) => {
    setPlacedStickers(prev => [...prev.filter(s => s.id !== id), prev.find(s => s.id === id)!]);
  }, []);

  const isStorageBlocked = !usbHandle && !isDevMode;

  return (
    <KioskLayout>
      <canvas ref={canvasRef} className="hidden" />
      
      {appState !== "welcome" && (
        <div className="fixed bottom-6 left-6 right-6 z-[60] flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="pointer-events-auto" onClick={handleHiddenTrigger}>
            <p className="font-headline font-black text-[10px] sm:text-xs tracking-[0.2em] text-white uppercase italic flex items-center gap-3">
              <span>JNL</span>
              <span className="text-primary">STUDIO</span>
            </p>
          </div>
          <p className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-[0.3em] pointer-events-none">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </p>
        </div>
      )}

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
          onSimulateCash={(amount) => setPaymentReceived(prev => prev + amount)}
          onBypassPayment={(pkg) => { setPackageSelected(pkg); setPaymentReceived(pkg); setAppState("setup"); }}
          usbStatus={usbHandle ? "connected" : "disconnected"}
          onSetupUsb={() => setUsbHandle({})}
          isDevMode={isDevMode}
          onToggleDevMode={() => setIsDevMode(!isDevMode)}
        />
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto pt-36 sm:pt-48 pb-20 sm:pb-24 scrollbar-hide">
        
        {appState === "welcome" && (
          <div className="flex flex-col items-center w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
            <div className="flex justify-center mb-[40px]" onClick={handleHiddenTrigger}>
              <JnlLogo variant="icon" color="light" className="w-32 h-32" />
            </div>
            <div className="flex justify-center mb-[30px] w-full px-4">
              <h1 className="font-headline font-black text-5xl sm:text-7xl tracking-tight uppercase italic text-center whitespace-nowrap flex items-center gap-4">
                <span className="text-white">JNL</span>
                <span className="text-primary">STUDIO</span>
              </h1>
            </div>
            <div className="flex justify-center mb-[20px] w-full px-4">
              <h2 className="font-headline font-black text-2xl sm:text-3xl tracking-[0.2em] uppercase italic text-white/90 text-center">TOUCH TO START</h2>
            </div>
            <div className="flex justify-center mb-[80px] w-full px-4">
              <p className="font-bold text-[10px] sm:text-xs tracking-[0.5em] uppercase text-white/40 text-center">PHOTOBOOTH</p>
            </div>
            <div className="flex justify-center w-full">
              <NeonButton onClick={() => setAppState("payment")} className="w-[75%] sm:w-[80%] text-2xl py-10" disabled={isStorageBlocked && !isOwnerMode}>READY?</NeonButton>
            </div>
          </div>
        )}

        {appState === "payment" && (
          <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-500 text-center">
            <div className="mb-10">
               <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-dashed border-primary/30 animate-pulse">
                  <Wallet className="w-12 h-12 text-primary" />
               </div>
               <h2 className="font-headline font-black text-3xl mb-2 italic uppercase">INSERT CASH</h2>
               <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">AWAITING BILL</p>
            </div>
            <div className="bg-white/5 border-2 border-white/10 p-8 mb-8">
               <div className="text-5xl sm:text-6xl font-black italic text-primary mb-2">{paymentReceived} <span className="text-2xl text-white">PHP</span></div>
               <div className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">TOTAL DETECTED</div>
            </div>
            <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
              {isOwnerMode && (
                <>
                  <NeonButton onClick={() => { setPackageSelected(50); setPaymentReceived(50); setAppState("setup"); }} className="w-full py-6 text-base">TEST ₱50 PKG</NeonButton>
                  <NeonButton onClick={() => { setPackageSelected(100); setPaymentReceived(100); setAppState("setup"); }} className="w-full py-6 text-base">TEST ₱100 PKG</NeonButton>
                </>
              )}
              {paymentReceived >= 50 && (
                <NeonButton onClick={() => { setPackageSelected(paymentReceived >= 100 ? 100 : 50); setAppState("setup"); }} className="w-full py-6 text-xl">START SESSION</NeonButton>
              )}
            </div>
          </div>
        )}

        {appState === "setup" && (
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in duration-500">
             <div className="relative w-full aspect-[3/4] max-h-[60vh] mx-auto overflow-hidden bg-zinc-900 border-2 border-white/20">
                <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", selectedFilter.class)} />
             </div>
             <div className="space-y-6 sm:max-h-[70vh] overflow-y-auto pr-4 scrollbar-hide">
              <h2 className="font-headline font-black text-3xl italic uppercase text-primary">Styling</h2>
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                    <Frame className="w-4 h-4 text-primary" /> Layout
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {availableBlueprints.map((bp) => (
                      <button key={bp.id} onClick={() => setSelectedBlueprint(bp)} className={cn("aspect-square flex items-center justify-center text-[10px] font-black border-2 transition-all italic", selectedBlueprint?.id === bp.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40")}>
                        {bp.label.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                    <Sparkles className="w-4 h-4 text-primary" /> Filters
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {availableFilters.map((f) => (
                      <button key={f.id} onClick={() => setSelectedFilter(f)} className={cn("aspect-square flex items-center justify-center text-[8px] font-black border-2 transition-all italic p-1", selectedFilter.id === f.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40")}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <NeonButton onClick={() => setAppState("capturing")} className="w-full !py-8 mt-6">SHOOT</NeonButton>
            </div>
          </div>
        )}

        {appState === "capturing" && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative aspect-[3/4] max-h-[65vh] w-full max-w-lg bg-zinc-900 overflow-hidden shadow-[0_0_60px_rgba(255,51,153,0.4)] border-4 border-white">
               <video ref={videoRef} autoPlay playsInline muted className={cn("absolute inset-0 w-full h-full object-cover", selectedFilter.class)} />
               {countdown !== null && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                    <span className="text-[10rem] font-headline font-black italic text-white animate-bounce drop-shadow-[0_0_40px_rgba(255,51,153,0.9)]">{countdown}</span>
                 </div>
               )}
            </div>
          </div>
        )}

        {appState === "review" && (
          <div className="w-full max-w-lg animate-in fade-in duration-500 text-center">
            <h2 className="font-headline font-black text-3xl mb-6 italic uppercase">Looking Sharp!</h2>
            <div className="w-full max-w-[450px] mb-8 mx-auto">
               {selectedBlueprint && (
                 <BlueprintFrame blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.class} isPreview />
               )}
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
               <NeonButton onClick={() => setAppState("decorating")} className="w-full py-8 text-xl">DECORATE</NeonButton>
               <button onClick={() => setAppState("setup")} className="w-full border-2 border-white font-headline font-black text-xl py-8 italic uppercase hover:bg-white hover:text-black">RETAKE</button>
            </div>
          </div>
        )}

        {appState === "decorating" && (
          <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start animate-in fade-in duration-500">
             <div className="relative flex-1 w-full max-h-[70vh] flex items-center justify-center">
                <div className="relative w-full h-full max-w-[450px]">
                  {selectedBlueprint && (
                    <BlueprintFrame 
                      blueprint={selectedBlueprint} 
                      photos={capturedPhotos} 
                      filterClass={selectedFilter.class}
                      isPreview
                      quoteText={selectedQuote.text}
                      stickers={placedStickers}
                      selectedStickerId={selectedStickerId}
                      onUpdateSticker={handleUpdateSticker}
                      onRemoveSticker={handleRemoveSticker}
                      onSelectSticker={setSelectedStickerId}
                      onBringToFront={handleBringToFront}
                    />
                  )}
                </div>
             </div>
             <div className="w-full lg:w-96 space-y-6 lg:max-h-[75vh] overflow-y-auto pr-4 scrollbar-hide">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline font-black text-3xl italic uppercase text-primary">Decoration</h2>
                  <button onClick={() => setPlacedStickers([])} className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-3 py-1.5 border border-red-500/20"><Trash2 className="w-3 h-3 inline mr-2" /> Clear All</button>
                </div>
                <div className="space-y-8">
                  <Tabs defaultValue="HEARTS" onValueChange={setActiveStickerCategory} className="w-full">
                    <TabsList className="w-full grid grid-cols-5 bg-white/5 border border-white/10 mb-4 h-12">
                      {["HEARTS", "CUTE", "PHOTO", "AESTHETIC", "TEXT"].map((cat) => (
                        <TabsTrigger key={cat} value={cat} className="text-[8px] font-black tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-white">{cat}</TabsTrigger>
                      ))}
                    </TabsList>
                    <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                      {STICKER_DEFS.filter(s => s.category === activeStickerCategory).map((s) => (
                        <button key={s.id} onClick={() => addSticker(s.id)} className="aspect-square flex items-center justify-center bg-white/5 border-2 border-white/10 rounded-xl hover:border-primary active:scale-90 transition-all">
                          <s.icon className={cn("w-8 h-8", s.color)} />
                        </button>
                      ))}
                    </div>
                  </Tabs>
                  <div>
                    <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                      <Quote className="w-4 h-4 text-primary" /> Quote
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                      {QUOTES.map((q) => (
                        <button key={q.id} onClick={() => setSelectedQuote(q)} className={cn("py-3 px-4 text-[10px] font-black uppercase border-2 transition-all italic", selectedQuote.id === q.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40")}>{q.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <NeonButton onClick={() => setAppState("consent")} className="w-full !py-8 mt-6">DONE</NeonButton>
             </div>
          </div>
        )}

        {appState === "consent" && (
          <div className="w-full max-w-xl animate-in slide-in-from-bottom-8 duration-500 text-center">
            <div className="mb-10">
               <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary/30">
                  <Share2 className="w-12 h-12 text-primary" />
               </div>
               <h2 className="font-headline font-black text-4xl mb-4 italic uppercase leading-none">Promotional <br />Consent</h2>
               <p className="text-sm opacity-60 uppercase font-bold tracking-widest leading-relaxed px-4">May we post your photo on the JNL Studio FB Page for promotional highlights?</p>
            </div>
            <div className="grid grid-cols-1 gap-4 px-4">
               <button onClick={() => { setPromotionalConsent(true); setAppState("printing"); }} className="w-full bg-primary py-8 text-xl font-headline font-black italic uppercase text-white shadow-[0_0_20px_rgba(255,51,153,0.4)] flex flex-col items-center justify-center gap-1 group transition-all">
                  <span>YES, GO FOR IT!</span>
                  <span className="text-[10px] opacity-60 tracking-widest group-hover:opacity-100">(Saves to JNL Studio FB Gallery)</span>
               </button>
               <button onClick={() => { setPromotionalConsent(false); setAppState("printing"); }} className="w-full border-2 border-white/20 font-headline font-black text-lg py-6 italic uppercase hover:bg-white/10 text-white/40 transition-all flex flex-col items-center justify-center gap-1">
                  <span>NO, KEEP IT PRIVATE</span>
                  <span className="text-[10px] opacity-40 tracking-widest">(Delete from server after download)</span>
               </button>
            </div>
          </div>
        )}

        {appState === "printing" && (
          <div className="w-full max-w-4xl animate-in fade-in duration-500">
             {printProgress < 100 ? (
                <div className="text-center space-y-8 py-12">
                   <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         {isSavingToUsb ? <Usb className="w-12 h-12 text-primary animate-bounce" /> : <Printer className="w-12 h-12 text-primary animate-pulse" />}
                      </div>
                   </div>
                   <div className="space-y-2">
                      <h2 className="font-headline font-black text-3xl italic uppercase">
                        {isSavingToUsb ? "Syncing to USB Gallery..." : "Printing Portrait..."}
                      </h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                        {isSavingToUsb ? "Saving approved promotional copy" : "Please wait for the photo to exit the slot"}
                      </p>
                   </div>
                   <div className="max-w-md mx-auto">
                      <Progress value={printProgress} className="h-3 bg-white/5 border border-white/10" />
                      <div className="flex justify-between mt-2 text-[10px] font-black uppercase opacity-60">
                         <span>{isSavingToUsb ? "Writing File..." : "Preparing Frame"}</span>
                         <span>{printProgress}%</span>
                      </div>
                   </div>
                </div>
             ) : (
                <div className="flex flex-col items-center space-y-12 animate-in slide-in-from-bottom-8">
                   <div className="text-center space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
                         <CheckCircle2 className="w-4 h-4 text-green-500" />
                         <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">Capture Complete</span>
                      </div>
                      <h2 className="font-headline font-black text-5xl sm:text-6xl italic uppercase leading-none">THANK <span className="text-primary">YOU!</span></h2>
                      <p className="text-sm opacity-60 font-bold uppercase tracking-widest max-w-lg mx-auto leading-relaxed">Scan below to download your soft copy and follow JNL Studio for more iconic moments.</p>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                      <div className="bg-white/5 border border-white/10 p-8 sm:p-10 flex flex-col items-center text-center space-y-6 rounded-2xl">
                         <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30">
                            <QrCode className="w-7 h-7 text-primary" />
                         </div>
                         <div className="space-y-2">
                            <h3 className="font-headline font-black text-xl uppercase italic tracking-wide">SOFT COPY</h3>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">High-Resolution Download</p>
                         </div>
                         <div className="aspect-square w-48 sm:w-56 bg-white p-3 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-transform hover:scale-105">
                            <img src="https://picsum.photos/seed/softcopy/400/400" alt="Soft Copy QR" className="w-full h-full object-cover" />
                         </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 p-8 sm:p-10 flex flex-col items-center text-center space-y-6 rounded-2xl">
                         <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center border-2 border-blue-500/30">
                            <Facebook className="w-7 h-7 text-blue-500" />
                         </div>
                         <div className="space-y-2">
                            <h3 className="font-headline font-black text-xl uppercase italic tracking-wide">FOLLOW US</h3>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">Like & Share JNL Studio</p>
                         </div>
                         <div className="aspect-square w-48 sm:w-56 bg-white p-3 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-transform hover:scale-105">
                            <img src="https://picsum.photos/seed/fb-qr/400/400" alt="Facebook QR" className="w-full h-full object-cover" />
                         </div>
                      </div>
                   </div>

                   <NeonButton onClick={resetSession} className="px-24 !py-8 text-2xl mt-8">FINISH SESSION</NeonButton>
                </div>
             )}
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
