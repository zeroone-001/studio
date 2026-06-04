
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { AdminAuthDialog } from "@/components/kiosk/admin-auth-dialog";
import { AdminControls } from "@/components/kiosk/admin-controls";
import { 
  Camera, Zap, Wallet, ArrowRight, Loader2, ShieldAlert, Facebook, 
  Sparkles, Frame, Usb, Printer, Smile, Quote, Share2, Heart, Star, Flame,
  AlertTriangle, HardDrive, CheckCircle2, Crown, Cat, Moon, Sun, Cloud, 
  Coffee, Pizza, Flower2, Ghost, Rocket, Trash2, XCircle, RefreshCw, Maximize2
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BLUEPRINTS, FrameBlueprint } from "@/components/kiosk/frame-blueprint";
import { BlueprintFrame } from "@/components/kiosk/blueprint-frame";
import { Slider } from "@/components/ui/slider";

type SessionState = "welcome" | "payment" | "setup" | "capturing" | "review" | "decorating" | "consent" | "printing";

const FILTERS = [
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
  { id: "heart", icon: Heart, color: "text-red-500" },
  { id: "star", icon: Star, color: "text-yellow-400" },
  { id: "sparkle", icon: Sparkles, color: "text-white" },
  { id: "fire", icon: Flame, color: "text-orange-500" },
  { id: "crown", icon: Crown, color: "text-yellow-300" },
  { id: "cloud", icon: Cloud, color: "text-blue-200" },
  { id: "sun", icon: Sun, color: "text-orange-300" },
  { id: "moon", icon: Moon, color: "text-indigo-200" },
  { id: "flower", icon: Flower2, color: "text-pink-400" },
  { id: "ghost", icon: Ghost, color: "text-zinc-300" },
  { id: "rocket", icon: Rocket, color: "text-cyan-400" },
  { id: "cat", icon: Cat, color: "text-orange-200" },
  { id: "pizza", icon: Pizza, color: "text-yellow-600" },
  { id: "coffee", icon: Coffee, color: "text-amber-900" },
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
  
  // Dragging logic
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Admin & Storage States
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [usbHandle, setUsbHandle] = useState<any>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isDevMode, setIsDevMode] = useState(true);

  const availableBlueprints = useMemo(() => {
    if (!packageSelected) return [];
    return BLUEPRINTS.filter(bp => bp.package === packageSelected);
  }, [packageSelected]);

  const availableFilters = useMemo(() => {
    return FILTERS.slice(0, packageSelected === 100 ? 10 : 5);
  }, [packageSelected]);

  const selectedSticker = useMemo(() => {
    return placedStickers.find(s => s.id === selectedStickerId);
  }, [placedStickers, selectedStickerId]);

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
      setCameraError("Unable to access device camera. Please check permissions.");
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

  const setupUsbStorage = async () => {
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setUsbHandle(handle);
      setStorageError(null);
    } catch (e: any) {
      setStorageError("USB Access Denied or Cancelled.");
    }
  };

  const saveToUsb = async (dataUri: string, folder: 'Originals' | 'Edited' | 'FinalOutput' | 'QRCopies') => {
    if (!usbHandle) {
      if (isDevMode) {
        console.log(`[DevMode] Simulated save to ${folder}`);
        return true;
      }
      return false;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const sessionId = `Session_${new Date().getTime()}`;
      const rootDir = await usbHandle.getDirectoryHandle('Photobooth', { create: true });
      const dateDir = await rootDir.getDirectoryHandle(today, { create: true });
      const sessionDir = await dateDir.getDirectoryHandle(sessionId, { create: true });
      const targetDir = await sessionDir.getDirectoryHandle(folder, { create: true });
      const fileName = `${folder.toUpperCase()}_${new Date().getTime()}.jpg`;
      const fileHandle = await targetDir.getFileHandle(fileName, { create: true });
      const response = await fetch(dataUri);
      const blob = await response.blob();
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (e) {
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
    if (appState === "setup" || appState === "capturing") {
      startCamera();
    } else if (appState === "review" || appState === "welcome") {
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
        await saveToUsb(shot, 'Originals');
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

  const handleFinalize = async () => {
    setAppState("printing");
    if (capturedPhotos.length > 0) {
      await saveToUsb(capturedPhotos[0], 'FinalOutput');
    }
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
      size: 15, // Default 15% width
    };
    setPlacedStickers(prev => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const removeSticker = (id: string) => {
    setPlacedStickers(prev => prev.filter(s => s.id !== id));
    if (selectedStickerId === id) setSelectedStickerId(null);
  };

  const updateStickerSize = (id: string, newSize: number) => {
    setPlacedStickers(prev => prev.map(s => 
      s.id === id ? { ...s, size: newSize } : s
    ));
  };

  const handleDrag = (e: React.PointerEvent, id: string) => {
    if (!draggingId) return;
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPlacedStickers(prev => prev.map(s => 
      s.id === id ? { ...s, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) } : s
    ));
  };

  const isStorageBlocked = !usbHandle && !isDevMode;

  return (
    <KioskLayout>
      <canvas ref={canvasRef} className="hidden" />
      
      <div 
        className="absolute top-12 left-0 right-0 z-[60] text-center cursor-default select-none active:opacity-80 transition-opacity"
        onClick={handleLogoClick}
      >
        <h1 className="font-headline font-black text-5xl sm:text-7xl tracking-tighter text-white neon-glow">
          JNL <span className="text-primary">STUDIO</span>
        </h1>
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
          onSimulateCash={(amount) => setPaymentReceived(prev => prev + amount)}
          onBypassPayment={() => {
            setPaymentReceived(100);
          }}
          usbStatus={usbHandle ? "connected" : "disconnected"}
          onSetupUsb={setupUsbStorage}
          isDevMode={isDevMode}
          onToggleDevMode={() => setIsDevMode(!isDevMode)}
        />
      )}

      {isStorageBlocked && appState === "welcome" && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-8 border-2 border-red-500 animate-pulse">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-4xl font-black italic uppercase mb-4 text-white">Storage Required</h2>
          <p className="text-white/60 font-bold uppercase tracking-widest text-sm max-w-sm mb-12">
            Booth is temporarily offline. Please connect external storage.
          </p>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto pt-36 sm:pt-48 pb-20 sm:pb-24">
        
        {appState === "welcome" && (
          <div className="text-center animate-in fade-in zoom-in duration-700 w-full max-w-sm">
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 mb-10 sm:mb-16 mx-auto">
               <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-20 h-20 sm:w-28 sm:h-28 text-primary animate-neon-pulse" />
               </div>
            </div>
            <h2 className="font-headline font-black text-3xl sm:text-5xl mb-8 uppercase tracking-tighter italic">READY FOR YOUR SHOT?</h2>
            <NeonButton 
              onClick={() => setAppState("payment")} 
              className="w-full text-xl sm:text-2xl"
              disabled={isStorageBlocked}
            >
              TAP TO START
            </NeonButton>
          </div>
        )}

        {appState === "payment" && (
          <div className="w-full max-md animate-in slide-in-from-bottom-8 duration-500 text-center">
            <div className="mb-10 sm:mb-12">
               <div className="w-28 h-28 sm:w-32 sm:h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-dashed border-primary/30 animate-pulse">
                  <Wallet className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
               </div>
               <h2 className="font-headline font-black text-3xl sm:text-4xl mb-2 italic uppercase">INSERT CASH</h2>
               <p className="text-[10px] sm:text-sm opacity-60 uppercase font-bold tracking-widest">AWAITING 50 OR 100 PHP BILL</p>
            </div>

            <div className="bg-white/5 border-2 border-white/10 p-8 sm:p-10 mb-8 sm:mb-10">
               <div className="text-5xl sm:text-6xl font-black italic text-primary mb-2">{paymentReceived} <span className="text-2xl text-white">PHP</span></div>
               <div className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">Total Amount Detected</div>
            </div>

            {paymentReceived >= 50 && (
              <div className="space-y-4 animate-in zoom-in duration-300">
                {isOwnerMode ? (
                  <div className="grid grid-cols-2 gap-3">
                    <NeonButton 
                      onClick={() => { setPackageSelected(50); setAppState("setup"); }}
                      className="py-6 text-lg bg-zinc-800 border-white/20"
                    >
                      TEST 50 PHP
                    </NeonButton>
                    <NeonButton 
                      onClick={() => { setPackageSelected(100); setAppState("setup"); }}
                      className="py-6 text-lg"
                    >
                      TEST 100 PHP
                    </NeonButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentReceived === 50 && (
                      <div className="p-6 bg-primary text-white font-black italic uppercase border-2 border-primary animate-in slide-in-from-top-4">
                        <div className="text-xl sm:text-2xl mb-1">STARTER PACKAGE</div>
                        <div className="text-[10px] sm:text-xs opacity-80 tracking-widest uppercase">3 SHOTS • 5 FILTERS • 5 FRAMES</div>
                      </div>
                    )}
                    {paymentReceived >= 100 && (
                      <div className="p-6 bg-primary text-white font-black italic uppercase border-2 border-primary animate-in slide-in-from-top-4">
                        <div className="text-xl sm:text-2xl mb-1">PREMIUM PACKAGE</div>
                        <div className="text-[10px] sm:text-xs opacity-80 tracking-widest uppercase">6 SHOTS • 10 FILTERS • 10 FRAMES</div>
                      </div>
                    )}
                    <NeonButton 
                      onClick={() => {
                        setPackageSelected(paymentReceived >= 100 ? 100 : 50);
                        setAppState("setup");
                      }}
                      className="w-full py-6 sm:py-8 text-xl sm:text-2xl"
                    >
                      START SESSION
                    </NeonButton>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {appState === "setup" && (
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in duration-500">
             <div className="relative w-full aspect-[3/4] max-h-[60vh] mx-auto overflow-hidden bg-zinc-900 border-2 border-white/20">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={cn("w-full h-full object-cover", selectedFilter.class)}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-white/10 w-[80%] h-[80%] rounded-2xl flex items-center justify-center">
                    <span className="text-white/20 font-black italic uppercase tracking-[0.5em] text-xs">Mirror Preview</span>
                  </div>
                </div>
                {cameraError && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-xs text-white/60 font-bold uppercase">{cameraError}</p>
                    <button onClick={startCamera} className="mt-4 flex items-center gap-2 text-primary text-[10px] font-black uppercase"><RefreshCw className="w-3 h-3" /> Retry Camera</button>
                  </div>
                )}
             </div>

             <div className="space-y-6 sm:max-h-[70vh] overflow-y-auto pr-4 scrollbar-hide">
              <h2 className="font-headline font-black text-3xl italic uppercase text-primary">Pre-Shot Styling</h2>
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                    <Frame className="w-4 h-4 text-primary" /> Layout Options
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {availableBlueprints.map((bp) => (
                      <button 
                        key={bp.id} 
                        onClick={() => setSelectedBlueprint(bp)} 
                        className={cn(
                          "aspect-square flex items-center justify-center text-[10px] font-black uppercase border-2 transition-all italic", 
                          selectedBlueprint?.id === bp.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40 hover:border-white/30"
                        )}
                      >
                        {bp.label.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                    <Sparkles className="w-4 h-4 text-primary" /> Aesthetic Filter
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {availableFilters.map((f) => (
                      <button 
                        key={f.id} 
                        onClick={() => setSelectedFilter(f)} 
                        className={cn(
                          "aspect-square flex items-center justify-center text-[8px] font-black uppercase border-2 transition-all italic p-1 text-center", 
                          selectedFilter.id === f.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40 hover:border-white/30"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <NeonButton 
                onClick={() => setAppState("capturing")} 
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
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 muted 
                 className={cn("absolute inset-0 w-full h-full object-cover", selectedFilter.class)}
               />
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
          </div>
        )}

        {appState === "review" && (
          <div className="w-full max-lg animate-in fade-in duration-500 text-center">
            <h2 className="font-headline font-black text-3xl mb-6 italic uppercase">Looking Sharp!</h2>
            <div className="w-full max-w-[450px] mb-8 mx-auto">
               {selectedBlueprint && (
                 <BlueprintFrame 
                   blueprint={selectedBlueprint} 
                   photos={capturedPhotos} 
                   filterClass={selectedFilter.class}
                   isPreview
                   stickers={[]}
                 />
               )}
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
               <NeonButton onClick={() => setAppState("decorating")} className="w-full py-8 text-xl">DECORATE</NeonButton>
               <button onClick={() => setAppState("setup")} className="w-full border-2 border-white font-headline font-black text-xl py-8 italic hover:bg-white hover:text-black transition-colors uppercase">RETAKE</button>
            </div>
          </div>
        )}

        {appState === "decorating" && (
          <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start animate-in fade-in duration-500">
             <div className="relative flex-1 w-full max-h-[70vh] flex items-center justify-center">
                <div 
                  className="relative w-full h-full max-w-[450px]"
                  onPointerMove={(e) => {
                    if (draggingId) handleDrag(e, draggingId);
                  }}
                  onPointerUp={() => setDraggingId(null)}
                >
                  {selectedBlueprint && (
                    <BlueprintFrame 
                      blueprint={selectedBlueprint} 
                      photos={capturedPhotos} 
                      filterClass={selectedFilter.class}
                      isPreview
                      quoteText={selectedQuote.text}
                      stickers={placedStickers}
                      selectedStickerId={selectedStickerId}
                      onStickerPointerDown={(id) => {
                        setDraggingId(id);
                        setSelectedStickerId(id);
                      }}
                      onRemoveSticker={(id) => removeSticker(id)}
                    />
                  )}
                </div>
             </div>

             <div className="w-full lg:w-96 space-y-6 lg:max-h-[75vh] overflow-y-auto pr-4 scrollbar-hide">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline font-black text-3xl italic uppercase text-primary">Studio Decor</h2>
                  <button 
                    onClick={() => {
                      setPlacedStickers([]);
                      setSelectedStickerId(null);
                    }}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-3 py-1.5 border border-red-500/20"
                  >
                    <Trash2 className="w-3 h-3" /> Clear All
                  </button>
                </div>

                <div className="space-y-8">
                  {selectedSticker && (
                    <div className="bg-white/5 p-4 border border-white/10 space-y-4 animate-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-primary tracking-widest">
                         <div className="flex items-center gap-2">
                           <Maximize2 className="w-3 h-3" /> Adjustment
                         </div>
                         <span>{Math.round(selectedSticker.size)}%</span>
                      </div>
                      <Slider 
                        value={[selectedSticker.size]}
                        min={5}
                        max={40}
                        step={1}
                        onValueChange={([val]) => updateStickerSize(selectedStickerId!, val)}
                        className="py-2"
                      />
                      <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest italic text-center">
                        Selected: {STICKER_DEFS.find(d => d.id === selectedSticker.type)?.id}
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                      <Smile className="w-4 h-4 text-primary" /> Trendy Sticker Pack
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {STICKER_DEFS.map((s) => (
                        <button 
                          key={s.id} 
                          onClick={() => addSticker(s.id)} 
                          className="aspect-square flex items-center justify-center bg-white/5 border-2 border-white/10 rounded-xl hover:border-primary transition-all active:scale-90"
                        >
                          <s.icon className={cn("w-8 h-8", s.color)} />
                        </button>
                      ))}
                    </div>
                    <p className="mt-4 text-[10px] text-white/40 font-bold uppercase tracking-widest text-center italic">
                      TIP: DRAG TO MOVE • USE SLIDER TO RESIZE
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                      <Quote className="w-4 h-4 text-primary" /> Motivational Label
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {QUOTES.map((q) => (
                        <button 
                          key={q.id} 
                          onClick={() => setSelectedQuote(q)} 
                          className={cn(
                            "py-3 px-4 text-[10px] font-black uppercase border-2 transition-all italic", 
                            selectedQuote.id === q.id ? "bg-primary border-primary text-white" : "border-white/10 text-white/40"
                          )}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <NeonButton onClick={() => setAppState("consent")} className="w-full !py-8 mt-6">FINALIZE & SAVE</NeonButton>
             </div>
          </div>
        )}

        {appState === "consent" && (
          <div className="w-full max-md text-center animate-in slide-in-from-bottom-12 duration-700">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-primary">
              <Share2 className="w-12 h-12 text-primary" />
            </div>
            <h2 className="font-headline font-black text-4xl mb-6 italic uppercase tracking-tighter">BE FEATURED!</h2>
            <p className="text-sm opacity-80 mb-12 uppercase tracking-widest font-bold leading-relaxed px-6">MAY WE FEATURE YOUR PORTRAIT ON OUR FACEBOOK PAGE?</p>
            <div className="flex flex-col gap-4 px-6">
              <NeonButton onClick={handleFinalize} className="w-full py-8">YES, SHARE IT!</NeonButton>
              <button onClick={handleFinalize} className="w-full border-2 border-white/20 py-6 font-headline font-black text-xl italic uppercase tracking-widest">NO, KEEP IT PRIVATE</button>
            </div>
          </div>
        )}

        {appState === "printing" && (
          <div className="text-center animate-in zoom-in duration-500 w-full max-w-md px-6">
            <div className="space-y-10">
              <div className="bg-white/5 p-8 border-2 border-white/10">
                <div className="w-40 h-40 mx-auto mb-8 bg-white p-3 flex items-center justify-center"><ArrowRight className="w-12 h-12 text-black" /></div>
                <h3 className="font-headline font-black text-2xl mb-2 italic uppercase">SCAN SOFT COPY</h3>
                <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest italic">
                  {usbHandle ? "Saved to JNL Drive" : "[Test Mode] Simulated Save"}
                </p>
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
               <NeonButton onClick={resetSession} className="w-full py-8">NEW SESSION</NeonButton>
            </div>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
