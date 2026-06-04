
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { AdminAuthDialog } from "@/components/kiosk/admin-auth-dialog";
import { AdminControls } from "@/components/kiosk/admin-controls";
import { JnlLogo } from "@/components/kiosk/jnl-logo";
import { 
  Camera, Zap, Wallet, ArrowRight, Loader2, ShieldAlert, Facebook, 
  Sparkles, Frame, Usb, Printer, Smile, Quote, Share2, Heart, Star, Flame,
  AlertTriangle, HardDrive, CheckCircle2, Crown, Cat, Moon, Sun, Cloud, 
  Coffee, Pizza, Flower2, Ghost, Rocket, Trash2, XCircle, RefreshCw, Maximize2,
  RotateCcw, Layers, CameraIcon, ImageIcon, Flashlight, User, HeartIcon
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BLUEPRINTS, FrameBlueprint } from "@/components/kiosk/frame-blueprint";
import { BlueprintFrame } from "@/components/kiosk/blueprint-frame";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  // HEARTS
  { id: "puffy-heart", icon: Kawaii.PuffyHeart, color: "", category: "HEARTS" },
  { id: "ribbon-heart", icon: Kawaii.RibbonHeart, color: "", category: "HEARTS" },
  { id: "sparkle-heart", icon: HeartIcon, color: "text-pink-300", category: "HEARTS" },
  // CUTE OBJECTS
  { id: "bunny", icon: Kawaii.KawaiiBunny, color: "", category: "CUTE" },
  { id: "bear", icon: Kawaii.TeddyBear, color: "", category: "CUTE" },
  { id: "cat-face", icon: Cat, color: "text-orange-200", category: "CUTE" },
  { id: "pizza", icon: Pizza, color: "text-yellow-600", category: "CUTE" },
  { id: "coffee", icon: Coffee, color: "text-amber-900", category: "CUTE" },
  // PHOTOBOOTH ITEMS
  { id: "mini-camera", icon: CameraIcon, color: "text-zinc-400", category: "PHOTO" },
  { id: "film", icon: Layers, color: "text-zinc-500", category: "PHOTO" },
  { id: "flash", icon: Flashlight, color: "text-yellow-400", category: "PHOTO" },
  { id: "selfie", icon: User, color: "text-blue-300", category: "PHOTO" },
  // AESTHETIC ITEMS
  { id: "cloud", icon: Kawaii.KawaiiCloud, color: "", category: "AESTHETIC" },
  { id: "sparkle", icon: Kawaii.PastelSparkle, color: "", category: "AESTHETIC" },
  { id: "moon", icon: Moon, color: "text-indigo-200", category: "AESTHETIC" },
  { id: "star", icon: Star, color: "text-yellow-300", category: "AESTHETIC" },
  { id: "crown", icon: Crown, color: "text-yellow-400", category: "AESTHETIC" },
  { id: "flower", icon: Flower2, color: "text-pink-400", category: "AESTHETIC" },
  // TEXT STICKERS
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
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [usbHandle, setUsbHandle] = useState<any>(null);
  const [isDevMode, setIsDevMode] = useState(true);

  const availableBlueprints = useMemo(() => {
    if (!packageSelected) return [];
    return BLUEPRINTS.filter(bp => bp.package === packageSelected);
  }, [packageSelected]);

  const availableFilters = useMemo(() => {
    return FILTERS.slice(0, packageSelected === 100 ? 10 : 5);
  }, [packageSelected]);

  // Sync blueprint selection when package is chosen
  useEffect(() => {
    if (packageSelected) {
      const first = BLUEPRINTS.find(bp => bp.package === packageSelected);
      if (first) setSelectedBlueprint(first);
    }
  }, [packageSelected]);

  // Camera Management
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 1706 }
        },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(null);
    } catch (err) {
      console.error("Camera Error:", err);
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
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.9);
    }
    return null;
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
  };

  // Hidden trigger click window
  useEffect(() => {
    if (logoClickCount > 0) {
      const timer = setTimeout(() => setLogoClickCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);

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
      if (shot) {
        photos.push(shot);
      } else {
        const mock = `https://picsum.photos/seed/jnl-${Date.now()}-${i}/1200/1600`;
        photos.push(mock);
      }
      
      await new Promise(r => setTimeout(r, 800)); 
      setIsProcessing(false);
    }
    setCapturedPhotos(photos);
    setAppState("review");
  };

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
  }, []);

  const addSticker = (type: string) => {
    const newSticker: PlacedSticker = {
      id: `sticker-${Date.now()}`,
      type,
      x: 50,
      y: 40,
      size: 15,
      rotation: 0
    };
    setPlacedStickers(prev => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const updateSticker = (id: string, updates: Partial<PlacedSticker>) => {
    setPlacedStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSticker = (id: string) => {
    setPlacedStickers(prev => prev.filter(s => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  const bringStickerToFront = (id: string) => {
    setPlacedStickers(prev => {
      const sticker = prev.find(s => s.id === id);
      if (!sticker) return prev;
      return [...prev.filter(s => s.id !== id), sticker];
    });
  };

  const isStorageBlocked = !usbHandle && !isDevMode;

  return (
    <KioskLayout>
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Small Text Logo - All Other Screens */}
      {appState !== "welcome" && (
        <div 
          className="fixed bottom-6 left-0 right-0 z-[60] text-center cursor-default select-none opacity-40 hover:opacity-100 transition-opacity"
          onClick={handleLogoClick}
        >
          <p className="font-headline font-black text-[10px] sm:text-xs tracking-[0.4em] text-white uppercase italic flex items-center justify-center gap-2">
            <span>JNL</span> <span className="text-primary">STUDIO</span>
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
          onBypassPayment={() => { setPaymentReceived(100); setPackageSelected(100); setAppState("setup"); }}
          usbStatus={usbHandle ? "connected" : "disconnected"}
          onSetupUsb={() => setUsbHandle({})} // Mock handle
          isDevMode={isDevMode}
          onToggleDevMode={() => setIsDevMode(!isDevMode)}
        />
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto pt-36 sm:pt-48 pb-20 sm:pb-24">
        
        {appState === "welcome" && (
          <div 
            className="flex flex-col items-center w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-1000"
            style={{ paddingTop: '120px', paddingBottom: '100px' }}
          >
            {/* 1. LOGO ICON */}
            <div className="flex justify-center mb-[40px] cursor-default" onClick={handleLogoClick}>
              <JnlLogo variant="icon" color="light" className="w-32 h-32" />
            </div>
            
            {/* 2. MAIN TITLE */}
            <div className="flex justify-center mb-[30px] w-full px-4 overflow-hidden">
              <h1 className="font-headline font-black text-5xl sm:text-7xl tracking-tight uppercase italic text-center whitespace-nowrap flex items-center gap-4">
                <span className="text-white">JNL</span>
                <span className="text-primary">STUDIO</span>
              </h1>
            </div>
            
            {/* 3. SUBTITLE */}
            <div className="flex justify-center mb-[20px] w-full px-4">
              <h2 className="font-headline font-black text-2xl sm:text-3xl tracking-[0.2em] uppercase italic text-white/90 text-center">
                TOUCH TO START
              </h2>
            </div>
            
            {/* 4. PHOTOBOOTH LABEL */}
            <div className="flex justify-center mb-[80px] w-full px-4">
              <p className="font-bold text-[10px] sm:text-xs tracking-[0.5em] uppercase text-white/40 text-center">
                PHOTOBOOTH
              </p>
            </div>
            
            {/* 5. BUTTON */}
            <div className="flex justify-center w-full">
              <NeonButton 
                onClick={() => setAppState("payment")} 
                className="w-[75%] sm:w-[80%] text-2xl py-10"
                disabled={isStorageBlocked && !isOwnerMode}
              >
                READY?
              </NeonButton>
            </div>
          </div>
        )}

        {appState === "payment" && (
          <div className="w-full max-md animate-in slide-in-from-bottom-8 duration-500 text-center">
            <div className="mb-10 text-center">
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

            {(paymentReceived >= 50 || isOwnerMode) && (
              <div className="space-y-4">
                <NeonButton 
                  onClick={() => {
                    setPackageSelected(paymentReceived >= 100 ? 100 : 50);
                    setAppState("setup");
                  }}
                  className="w-full py-6 text-xl"
                >
                  START SESSION
                </NeonButton>
              </div>
            )}
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
                      <button 
                        key={bp.id} 
                        onClick={() => setSelectedBlueprint(bp)} 
                        className={cn(
                          "aspect-square flex items-center justify-center text-[10px] font-black border-2 transition-all italic", 
                          selectedBlueprint?.id === bp.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40"
                        )}
                      >
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
                      <button 
                        key={f.id} 
                        onClick={() => setSelectedFilter(f)} 
                        className={cn(
                          "aspect-square flex items-center justify-center text-[8px] font-black border-2 transition-all italic p-1", 
                          selectedFilter.id === f.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40"
                        )}
                      >
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

        {(appState === "decorating" || appState === "test-stickers") && (
          <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start animate-in fade-in duration-500">
             <div className="relative flex-1 w-full max-h-[70vh] flex items-center justify-center">
                <div className="relative w-full h-full max-w-[450px]">
                  {selectedBlueprint && (
                    <BlueprintFrame 
                      blueprint={selectedBlueprint} 
                      photos={capturedPhotos.length ? capturedPhotos : Array(6).fill("https://picsum.photos/seed/test/1200/1600")} 
                      filterClass={selectedFilter.class}
                      isPreview
                      quoteText={selectedQuote.text}
                      stickers={placedStickers}
                      selectedStickerId={selectedStickerId}
                      onUpdateSticker={updateSticker}
                      onRemoveSticker={removeSticker}
                      onSelectSticker={setSelectedStickerId}
                      onBringToFront={bringStickerToFront}
                    />
                  )}
                </div>
             </div>

             <div className="w-full lg:w-96 space-y-6 lg:max-h-[75vh] overflow-y-auto pr-4 scrollbar-hide">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline font-black text-3xl italic uppercase text-primary">Sticker Studio</h2>
                  <button onClick={() => { setPlacedStickers([]); setSelectedStickerId(null); }} className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-3 py-1.5 border border-red-500/20">
                    <Trash2 className="w-3 h-3 inline mr-2" /> Clear All
                  </button>
                </div>

                <div className="space-y-8">
                  <Tabs defaultValue="HEARTS" onValueChange={setActiveStickerCategory} className="w-full">
                    <TabsList className="w-full grid grid-cols-5 bg-white/5 border border-white/10 mb-4 h-12">
                      {["HEARTS", "CUTE", "PHOTO", "AESTHETIC", "TEXT"].map((cat) => (
                        <TabsTrigger 
                          key={cat} 
                          value={cat} 
                          className="text-[8px] font-black tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                          {cat}
                        </TabsTrigger>
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
                    <div className="grid grid-cols-2 gap-2">
                      {QUOTES.map((q) => (
                        <button key={q.id} onClick={() => setSelectedQuote(q)} className={cn("py-3 px-4 text-[10px] font-black uppercase border-2 transition-all italic", selectedQuote.id === q.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40")}>
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                    GESTURE EDITING: DRAG TO MOVE. USE HANDLES TO SCALE & ROTATE LIVE.
                  </p>
                </div>

                <NeonButton 
                  onClick={() => appState === "test-stickers" ? setAppState("welcome") : setAppState("consent")} 
                  className="w-full !py-8 mt-6"
                >
                  {appState === "test-stickers" ? "FINISH TEST" : "DONE"}
                </NeonButton>
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
          <div className="w-full max-lg animate-in fade-in duration-500 text-center">
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
      </div>
    </KioskLayout>
  );
}
