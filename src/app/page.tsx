"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { AdminAuthDialog } from "@/components/kiosk/admin-auth-dialog";
import { AdminControls } from "@/components/kiosk/admin-controls";
import { HealthMonitor } from "@/components/kiosk/health-monitor";
import { JnlLogo } from "@/components/kiosk/jnl-logo";
import { 
  Wallet, Sparkles, Frame, Quote, Trash2, Cat, Moon, Sun, 
  Coffee, Pizza, Flower2, Crown, Layers, CameraIcon, Flashlight, User, HeartIcon,
  QrCode, Facebook, Printer, Usb, AlertCircle, Star, Ghost, PartyPopper,
  CheckCircle2, RotateCcw, Cookie as CookieIcon, Banknote, Loader2, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BLUEPRINTS, FrameBlueprint } from "@/components/kiosk/frame-blueprint";
import { BlueprintFrame } from "@/components/kiosk/blueprint-frame";
import { Progress } from "@/components/ui/progress";
import * as Kawaii from "@/components/kiosk/kawaii-stickers";
import { SessionStore } from "@/lib/kiosk/persistence";
import { KioskLogger } from "@/lib/kiosk/logger";
import { initializeFirebase } from "@/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";

export type SessionState = "welcome" | "payment" | "setup" | "capturing" | "review" | "decorating" | "consent" | "printing" | "thankyou" | "test-camera";

export const FILTERS = [
  { id: "glowup", label: "GLOW UP", sub: "TIKTOK SKIN", class: "brightness-110 contrast-[1.05] saturate-[1.15] sepia-[0.05] drop-shadow-md" },
  { id: "retro", label: "RETRO", sub: "WARM VIBE", class: "sepia-[0.35] contrast-[1.1] brightness-[1.05] saturate-[1.3] hue-rotate-[-5deg]" },
  { id: "icey", label: "ICEY", sub: "COOL TONES", class: "hue-rotate-[10deg] saturate-[0.8] brightness-[1.1] contrast-[1.1] opacity-[0.95]" },
  { id: "indie", label: "INDIE", sub: "VIBRANT", class: "saturate-[1.6] contrast-[1.2] brightness-[1.05] sepia-[0.05]" },
  { id: "bwpro", label: "B&W PRO", sub: "CINEMATIC", class: "grayscale contrast-[1.6] brightness-[1.1]" },
  { id: "candy", label: "CANDY", sub: "POP VIBE", class: "saturate-[1.8] contrast-[1.25] brightness-[1.1] hue-rotate-[5deg]" },
  { id: "velvet", label: "VELVET", sub: "WARM PINK", class: "sepia-[0.1] saturate-[1.4] contrast-[1.1] hue-rotate-[-10deg] brightness-[1.05]" },
  { id: "sunset", label: "SUNSET", sub: "GOLDEN HOUR", class: "sepia-[0.4] saturate-[1.7] brightness-[1.1] contrast-[1.1] hue-rotate-[-15deg]" },
  { id: "dream", label: "DREAM", sub: "SOFT GLOW", class: "brightness-[1.2] contrast-[0.9] saturate-[1.1] blur-[0.5px]" },
  { id: "film", label: "FILM", sub: "VINTAGE", class: "grayscale-[0.2] sepia-[0.15] contrast-[1.3] brightness-[0.95] saturate-[1.2]" },
];

export const STICKER_DEFS = [
  { id: "puffy-heart", icon: Kawaii.PuffyHeart, color: "", category: "HEARTS" },
  { id: "ribbon-heart", icon: Kawaii.RibbonHeart, color: "", category: "HEARTS" },
  { id: "sparkle-heart", icon: HeartIcon, color: "text-pink-300", category: "HEARTS" },
  { id: "bunny", icon: Kawaii.KawaiiBunny, color: "", category: "CUTE" },
  { id: "bear", icon: Kawaii.TeddyBear, color: "", category: "CUTE" },
  { id: "panda", icon: Kawaii.KawaiiPanda, color: "", category: "CUTE" },
  { id: "cat-face", icon: Cat, color: "text-orange-200", category: "CUTE" },
  { id: "pizza", icon: Pizza, color: "text-yellow-600", category: "CUTE" },
  { id: "cookie", icon: CookieIcon, color: "text-amber-700", category: "CUTE" },
  { id: "coffee", icon: Coffee, color: "text-amber-900", category: "CUTE" },
  { id: "ice-cream", icon: Kawaii.IceCreamSticker, color: "", category: "CUTE" },
  { id: "sushi", icon: Kawaii.SushiSticker, color: "", category: "CUTE" },
  { id: "mini-camera", icon: CameraIcon, color: "text-zinc-400", category: "PHOTO" },
  { id: "film", icon: Layers, color: "text-zinc-500", category: "PHOTO" },
  { id: "flash", icon: Flashlight, color: "text-yellow-400", category: "PHOTO" },
  { id: "selfie", icon: User, color: "text-blue-300", category: "PHOTO" },
  { id: "cloud", icon: Kawaii.KawaiiCloud, color: "", category: "AESTHETIC" },
  { id: "sparkle", icon: Kawaii.PastelSparkle, color: "", category: "AESTHETIC" },
  { id: "rainbow", icon: Kawaii.RainbowSticker, color: "", category: "AESTHETIC" },
  { id: "moon", icon: Moon, color: "text-indigo-200", category: "AESTHETIC" },
  { id: "sun", icon: Sun, color: "text-yellow-300", category: "AESTHETIC" },
  { id: "crown", icon: Crown, color: "text-yellow-400", category: "AESTHETIC" },
  { id: "flower", icon: Flower2, color: "text-pink-400", category: "AESTHETIC" },
  { id: "star", icon: Star, color: "text-yellow-400", category: "AESTHETIC" },
  { id: "ghost", icon: Ghost, color: "text-zinc-200", category: "AESTHETIC" },
  { id: "party", icon: PartyPopper, color: "text-orange-400", category: "AESTHETIC" },
  { id: "slay", icon: Kawaii.SlayText, color: "", category: "TEXT" },
  { id: "cutie", icon: Kawaii.CutieText, color: "", category: "TEXT" },
  { id: "besties", icon: Kawaii.BestiesText, color: "", category: "TEXT" },
];

export const QUOTES = [
  { id: "q1", label: "LIMITLESS", text: "Your potential is truly limitless." },
  { id: "q2", label: "STAR", text: "Shine bright like the star you are." },
  { id: "q3", label: "MAGIC", text: "Create magic in every single moment." },
  { id: "q4", label: "KINDNESS", text: "Kindness is the ultimate superpower." },
  { id: "q5", label: "DREAMER", text: "Dreaming big is the first step to success." },
  { id: "q6", label: "STAY TRUE", text: "Always stay true to your beautiful soul." },
  { id: "q7", label: "GOOD VIBES", text: "Radiate good vibes and attract the best." },
  { id: "q8", label: "BRAVE", text: "Be brave enough to start your journey." },
  { id: "q9", label: "JOY", text: "Choose joy every single day of your life." },
  { id: "q10", label: "SHINE", text: "Keep shining through every dark moment." },
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
  const [printProgress, setPrintProgress] = useState(0);
  const [promoConsent, setPromoConsent] = useState<boolean | null>(null);
  const [selectedRetakeIndex, setSelectedRetakeIndex] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");

  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<FrameBlueprint | null>(null);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedQuote, setSelectedQuote] = useState(QUOTES[0]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [usbDirectoryHandle, setUsbDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isDevMode, setIsDevMode] = useState<boolean>(true);

  const [logoTapCount, setLogoTapCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [softCopyQrUrl, setSoftCopyQrUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "complete" | "error">("idle");
  const exportTriggeredRef = useRef(false);

  const [originUrl, setOriginUrl] = useState("https://jnl-studio-booth.web.app");
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }
  }, []);

  const initiatePrint = useCallback((blob: Blob) => {
    KioskLogger.log('info', 'PRINT', 'Automatic print job initiated.', 'PENDING');
    
    if (!printIframeRef.current) {
      KioskLogger.log('error', 'PRINT', 'Print job creation aborted.', 'FAILED', 'Iframe reference missing');
      return;
    }
    
    const iframe = printIframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!doc) {
      KioskLogger.log('error', 'PRINT', 'Print job creation aborted.', 'FAILED', 'Iframe document inaccessible');
      return;
    }

    const dataUrl = URL.createObjectURL(blob);
    KioskLogger.log('info', 'PRINT', 'Photo generated.', 'SUCCESS');

    doc.open();
    doc.write(`
      <html>
        <head>
          <style>
            @page { size: 4in 6in; margin: 0; }
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: white; }
            img { width: 4in; height: 6in; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" />
        </body>
      </html>
    `);
    doc.close();
    KioskLogger.log('info', 'PRINT', 'Print intent created.', 'SUCCESS');
    
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        URL.revokeObjectURL(dataUrl);
        KioskLogger.log('info', 'PRINT', 'Android print service reached.', 'SUCCESS');
      } catch (e: any) {
        KioskLogger.log('error', 'PRINT', 'Handover to Android Print Service failed.', 'FAILED', e.message);
      }
    }, 1200);
  }, []);

  const handleFinalExport = useCallback(async () => {
    KioskLogger.log('info', 'SESSION', 'Starting final layout assembly...');

    if (!selectedBlueprint || capturedPhotos.length === 0) {
      KioskLogger.log('error', 'SESSION', 'Final layout aborted.', 'FAILED', 'Blueprint or photos missing');
      return;
    }
    
    // Feature 1: Unique Session ID with High Entropy
    const sessionId = `jnl_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`;
    setCurrentSessionId(sessionId);
    KioskLogger.log('info', 'QR', `Session ID created: ${sessionId}`, 'SUCCESS');

    // Feature 1: Immediate QR URL generation
    const retrievalUrl = `${originUrl}/retrieve/${sessionId}`;
    setSoftCopyQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(retrievalUrl)}`);
    KioskLogger.log('info', 'QR', 'QR URL generated.', 'SUCCESS');
    
    const { storage, db } = initializeFirebase();
    
    // Feature 1: Immediate Handshake to ensure public access is ready
    setDoc(doc(db, "photos", sessionId), {
      id: sessionId,
      storagePath: `photos/${sessionId}.jpg`,
      timestamp: serverTimestamp(),
      isDownloaded: false,
      status: 'uploading'
    }).then(() => {
      KioskLogger.log('info', 'QR', 'Retrieval record created in cloud.', 'SUCCESS');
    }).catch(e => {
      KioskLogger.log('error', 'QR', 'Cloud handshake failed.', 'FAILED', e.message);
    });

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1600;
    exportCanvas.height = 2400;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1600, 2400);

    const isStrip = selectedBlueprint.package === 50;
    
    const drawContent = async (offsetX: number) => {
      for (let i = 0; i < selectedBlueprint.slots.length; i++) {
        const slot = selectedBlueprint.slots[i];
        const photo = capturedPhotos[i];
        if (!photo) continue;
        
        const img = new Image();
        img.src = photo;
        await new Promise(resolve => img.onload = resolve);
        ctx.drawImage(img, slot.x + offsetX, slot.y, slot.w, slot.h);
      }
      
      // Branding Area Calibration
      const footerY = 2200;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(offsetX, footerY, 1600, 200);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(selectedQuote.text, offsetX + 800, footerY + 80);
      ctx.textAlign = 'left';
      ctx.font = 'black 48px Inter, sans-serif';
      ctx.fillText('JNL STUDIO', offsetX + 80, footerY + 160);
      ctx.textAlign = 'right';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.fillText(new Date().toLocaleDateString(), offsetX + 1520, footerY + 160);
    };

    if (isStrip) {
      await drawContent(0);
      await drawContent(800);
    } else {
      await drawContent(0);
    }

    exportCanvas.toBlob(async (blob) => {
      if (!blob) {
        KioskLogger.log('error', 'SESSION', 'Final photo assembly failed.', 'FAILED', 'Blob conversion failed');
        return;
      }
      KioskLogger.log('info', 'QR', 'Final image generated.', 'SUCCESS');

      await SessionStore.savePhotoLocally(sessionId, blob);
      KioskLogger.log('info', 'QR', 'Final image saved locally.', 'SUCCESS');
      
      initiatePrint(blob); 

      setUploadStatus("uploading");
      const photoRef = ref(storage, `photos/${sessionId}.jpg`);
      uploadBytes(photoRef, blob).then(() => {
        updateDoc(doc(db, "photos", sessionId), { status: 'complete' });
        setUploadStatus("complete");
        KioskLogger.log('info', 'QR', 'Final image uploaded to cloud.', 'SUCCESS');
      }).catch((e) => {
        setUploadStatus("error");
        KioskLogger.log('error', 'QR', 'Image upload failed.', 'FAILED', e.message);
      });
    }, 'image/jpeg', 0.9);

  }, [selectedBlueprint, capturedPhotos, selectedQuote, originUrl, initiatePrint]);

  useEffect(() => {
    if (appState === "printing" && !exportTriggeredRef.current) {
      exportTriggeredRef.current = true;
      handleFinalExport();
    }
    if (appState === "welcome") {
      exportTriggeredRef.current = false;
      setUploadStatus("idle");
    }
  }, [appState, handleFinalExport]);

  const resetSession = useCallback(() => {
    setAppState("welcome");
    setPaymentReceived(0);
    setPackageSelected(null);
    setCapturedPhotos([]);
    setCountdown(null);
    setIsProcessing(false);
    setSelectedBlueprint(null);
    setSelectedFilter(FILTERS[0]);
    setPlacedStickers([]);
    setSelectedQuote(QUOTES[0]);
    setSelectedStickerId(null);
    setPrintProgress(0);
    setPromoConsent(null);
    setSelectedRetakeIndex(null);
  }, []);

  const startShotSequence = async () => {
    const totalShots = packageSelected === 50 ? 3 : 6;
    const photos: string[] = [];
    setAppState("capturing");
    setCapturedPhotos([]); 
    await new Promise(r => setTimeout(r, 2000)); 
    for (let i = 0; i < totalShots; i++) {
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(null);
      setIsProcessing(true);
      const shot = takePhoto();
      if (shot) {
        photos.push(shot);
        setCapturedPhotos([...photos]); 
      }
      await new Promise(r => setTimeout(r, 600)); 
      setIsProcessing(false);
    }
    setAppState("review");
  };

  const startSingleShotSequence = async (index: number) => {
    setAppState("capturing");
    await new Promise(r => setTimeout(r, 1000)); 
    for (let c = 3; c > 0; c--) {
      setCountdown(c);
      await new Promise(r => setTimeout(r, 1000));
    }
    setCountdown(null);
    setIsProcessing(true);
    const shot = takePhoto();
    if (shot) {
      setCapturedPhotos(prev => {
        const newPhotos = [...prev];
        newPhotos[index] = shot;
        KioskLogger.log('info', 'SESSION', `Retake Selected replaced slot ${index + 1}.`, 'SUCCESS');
        return newPhotos;
      });
    }
    await new Promise(r => setTimeout(r, 600)); 
    setIsProcessing(false);
    setAppState("review");
    setSelectedRetakeIndex(null);
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

  useEffect(() => {
    if (appState === "setup" || appState === "capturing" || appState === "test-camera") {
      const start = async () => {
        if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined, 
              width: { ideal: 1280 }, 
              height: { ideal: 1706 } 
            }, 
            audio: false 
          });
          setCameraStream(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) {}
      };
      start();
    }
  }, [appState, selectedCameraId]);

  return (
    <KioskLayout>
      <canvas ref={canvasRef} className="hidden" />
      <iframe ref={printIframeRef} className="hidden" title="print-frame" />
      <div className="flex-1 w-full h-full flex flex-col items-center overflow-hidden kiosk-container safe-area-spacing landscape-container">
        <AdminAuthDialog isOpen={isAdminDialogOpen} onClose={() => setIsAdminDialogOpen(false)} onAuthSuccess={() => setIsOwnerMode(true)} />
        {isOwnerMode && (
          <AdminControls 
            currentStatus={appState}
            onJumpTo={setAppState}
            onReset={resetSession}
            onExitOwnerMode={() => setIsOwnerMode(false)}
            hasPackage={!!packageSelected}
            onSimulateCash={(amount) => setPaymentReceived(prev => prev + amount)}
            onBypassPayment={(pkg) => { setPackageSelected(pkg); setPaymentReceived(pkg); setAppState("setup"); }}
            usbStatus={usbDirectoryHandle ? "connected" : "disconnected"}
            onSetupUsb={async () => { try { const handle = await (window as any).showDirectoryPicker(); setUsbDirectoryHandle(handle); } catch (e) {} }}
            onSetupBillAcceptor={() => {}}
            isDevMode={isDevMode}
            onToggleDevMode={() => setIsDevMode(!isDevMode)}
            isCameraActive={!!cameraStream}
            onTestCamera={() => setAppState("test-camera")}
            cameras={availableCameras}
            selectedCameraId={selectedCameraId}
            onSelectCamera={setSelectedCameraId}
          />
        )}
        {isOwnerMode && <HealthMonitor />}

        {appState === "welcome" && (
          <div className="flex flex-col items-center w-full h-full animate-in fade-in duration-1000 safe-area-spacing">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center cursor-pointer" onClick={() => {
                setLogoTapCount(p => p + 1);
                if (logoTapCount >= 4) { setIsAdminDialogOpen(true); setLogoTapCount(0); }
              }}>
                <JnlLogo variant="hero" color="light" className="mb-0" />
              </div>
            </div>
            <div className="w-full flex flex-col items-center pb-20 space-y-12">
              <h2 className="font-headline font-black text-2xl tracking-[0.2em] uppercase italic text-white/90">TOUCH TO START</h2>
              <NeonButton onClick={() => setAppState("payment")} className="w-[40%] text-3xl py-12">READY?</NeonButton>
            </div>
          </div>
        )}

        {appState === "payment" && (
          <div className="w-full max-w-2xl text-center flex flex-col items-center justify-center h-full px-6">
            <h2 className="font-headline font-black text-4xl mb-2 italic uppercase">INSERT CASH</h2>
            <div className="bg-white/5 border-2 border-white/10 p-10 mb-8 w-full">
               <div className="text-6xl font-black italic text-primary">{paymentReceived} PHP</div>
            </div>
            <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
              {paymentReceived >= 50 && (
                <NeonButton onClick={() => { setPackageSelected(paymentReceived >= 100 ? 100 : 50); setAppState("setup"); }} className="w-full py-6 text-xl">START SESSION</NeonButton>
              )}
            </div>
          </div>
        )}

        {(appState === "setup" || appState === "test-camera") && (
          <div className="w-full h-full max-w-7xl flex flex-row gap-8 items-start py-10 px-8">
             <div className="relative flex-1 aspect-[3/4] bg-zinc-900 border-4 border-white overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className={cn("absolute inset-0 w-full h-full object-cover", selectedFilter.class)} />
             </div>
             <div className="w-[450px] space-y-8">
              <h2 className="font-headline font-black text-4xl italic uppercase text-primary">Styling</h2>
              <div className="space-y-4">
                 <button onClick={() => startShotSequence()} className="w-full py-10 text-2xl bg-primary font-black uppercase italic">SHOOT</button>
              </div>
            </div>
          </div>
        )}

        {appState === "capturing" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
             <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", selectedFilter.class)} />
             {countdown !== null && <span className="absolute text-[25rem] font-black italic text-white animate-bounce">{countdown}</span>}
          </div>
        )}

        {appState === "review" && (
          <div className="w-full h-full flex flex-row items-center justify-center gap-12 py-6 px-8">
            <div className="flex-1 flex flex-col items-center">
              <div className="h-[70vh] aspect-[1600/2400] shadow-2xl relative border-4 border-white mb-6">
                 {selectedBlueprint && (
                    <BlueprintFrame 
                      blueprint={selectedBlueprint} 
                      photos={capturedPhotos} 
                      filterClass={selectedFilter.class} 
                      isPreview 
                      onSelectSlot={(idx) => setSelectedRetakeIndex(idx)}
                      selectedSlotIndex={selectedRetakeIndex}
                    />
                 )}
              </div>
              <div className="w-full max-w-2xl bg-white/5 border p-4 grid grid-cols-6 gap-2">
                {capturedPhotos.map((photo, idx) => (
                  <button key={idx} onClick={() => setSelectedRetakeIndex(idx)} className={cn("aspect-[3/4] border-2 overflow-hidden transition-all", selectedRetakeIndex === idx ? "border-primary scale-110 shadow-[0_0_15px_rgba(255,51,153,0.5)] z-10" : "border-white/10 opacity-60")}>
                    <img src={photo} alt="" className={cn("w-full h-full object-cover", selectedFilter.class)} />
                  </button>
                ))}
              </div>
            </div>
            <div className="w-96 space-y-6">
               <NeonButton onClick={() => setAppState("decorating")} className="w-full py-10 text-2xl">USE PHOTO</NeonButton>
               <button 
                onClick={() => selectedRetakeIndex !== null && startSingleShotSequence(selectedRetakeIndex)} 
                disabled={selectedRetakeIndex === null} 
                className="w-full py-8 bg-primary font-black uppercase italic disabled:opacity-20 border-2 border-white/10"
               >
                 Retake Selected
               </button>
               <button onClick={() => setAppState("setup")} className="w-full py-4 border-2 border-white/20 font-black uppercase italic text-white/40">Retake All</button>
            </div>
          </div>
        )}

        {appState === "decorating" && (
          <div className="w-full flex flex-row gap-12 items-start py-10 px-8">
             <div className="flex-1 h-[70vh] flex items-center justify-center">
                {selectedBlueprint && <BlueprintFrame blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.class} quoteText={selectedQuote.text} isPreview />}
             </div>
             <div className="w-[450px] space-y-8">
                <NeonButton onClick={() => setAppState("consent")} className="w-full py-10 text-2xl">FINISH</NeonButton>
             </div>
          </div>
        )}

        {appState === "consent" && (
          <div className="w-full max-w-3xl text-center flex flex-col items-center justify-center h-full px-12">
             <h2 className="font-headline font-black text-5xl mb-6 italic uppercase">Help Us Share Happy Memories</h2>
             <div className="grid grid-cols-2 gap-6 w-full">
               <NeonButton onClick={() => { setPromoConsent(true); setAppState("printing"); }} className="w-full py-10 text-xl">YES</NeonButton>
               <button onClick={() => { setPromoConsent(false); setAppState("printing"); }} className="w-full border-4 border-white/20 font-black text-xl py-10 uppercase text-white/40">NO</button>
            </div>
          </div>
        )}

        {appState === "printing" && (
          <div className="w-full flex flex-row items-center gap-16 px-10">
             <div className="flex-1 space-y-10">
                <h2 className="font-headline font-black text-3xl italic uppercase">Printing Portrait...</h2>
                <Progress value={printProgress} className="h-3" />
             </div>
             <div className="bg-white/5 border-2 border-white/10 p-8 flex flex-col items-center space-y-4 rounded-3xl w-80">
                <div className="aspect-square w-full bg-white p-4 rounded-2xl flex items-center justify-center shadow-xl">
                  {softCopyQrUrl ? <img src={softCopyQrUrl} alt="Scan to save" className="w-full h-full" /> : <Loader2 className="w-8 h-8 animate-spin text-primary" />}
                </div>
                <div className="text-[10px] font-black uppercase text-white/40 tracking-widest">SCAN TO SAVE</div>
                {uploadStatus === "complete" && <button onClick={() => setAppState("thankyou")} className="w-full bg-primary py-4 font-black uppercase italic rounded-xl">FINISH</button>}
             </div>
          </div>
        )}

        {appState === "thankyou" && (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
             <h2 className="font-headline font-black text-6xl italic uppercase">THANK <span className="text-primary">YOU!</span></h2>
             <NeonButton onClick={resetSession} className="px-20 py-8 text-2xl mt-12">DONE</NeonButton>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
