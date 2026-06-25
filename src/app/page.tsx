"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  CheckCircle2, RotateCcw, Cookie as CookieIcon, Banknote, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BLUEPRINTS, FrameBlueprint } from "@/components/kiosk/frame-blueprint";
import { BlueprintFrame } from "@/components/kiosk/blueprint-frame";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import * as Kawaii from "@/components/kiosk/kawaii-stickers";
import { SessionStore } from "@/lib/kiosk/persistence";
import { KioskLogger } from "@/lib/kiosk/logger";
import { initializeFirebase } from "@/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// COMMERCIAL PRODUCTION ROUTING - FIXED DOMAIN
const PUBLIC_KIOSK_URL = "https://jnl-studio-booth.web.app";

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

export const QUOTES = Array.from({ length: 50 }, (_, i) => ({
  id: `q-${i}`,
  label: [
    "POSITIVE", "MAGIC", "ICONIC", "BEST DAY", "GOLD", "SHINE", "HUMBLE", "LOVE", 
    "KIND", "DREAM", "LOUD", "JOY", "LIGHT", "GOT THIS", "BRAVE", "VIBES", "TRUE", 
    "FEARLESS", "MAKE", "BLISS", "SOUL", "AUTHENTIC", "LIMIT", "CURIOUS", "OWN VIBE",
    "BRIGHT", "HEART", "GOING", "SMILE", "TODAY", "INSIDE", "WILD", "BORN", "HEART",
    "DREAMER", "STRONG", "ENERGY", "LOVE LIFE", "UNSTOP", "INSPIRED", "BLOOM", "RADIANT",
    "BOLD", "FULLY", "SWEET", "ENOUGH", "COUNT", "GRATEFUL", "HAPPY", "BEYOND"
  ][i] || `QUOTE ${i}`,
  text: [
    "STAY POSITIVE", "JNL MAGIC", "PURE ICONIC", "BEST DAY EVER", "YOU ARE GOLD", 
    "KEEP SHINING", "STAY HUMBLE", "RADIATE LOVE", "BE KIND", "DREAM BIG", "LIVE LOUD",
    "CHOOSE JOY", "BE THE LIGHT", "YOU GOT THIS", "BOLD & BRAVE", "GOOD VIBES", "STAY TRUE",
    "FEARLESS", "MAKE MAGIC", "PURE BLISS", "ICONIC SOUL", "BE AUTHENTIC", "LIMITLESS",
    "STAY CURIOUS", "OWN YOUR VIBE", "SHINE BRIGHT", "HEART OF GOLD", "KEEP GOING",
    "JUST SMILE", "TODAY IS GOOD", "MAGIC INSIDE", "STAY WILD", "BORN TO SHINE",
    "BRAVE HEART", "DREAMER", "STAY STRONG", "PURE ENERGY", "LOVE LIFE", "BE UNSTOPPABLE",
    "STAY INSPIRED", "KEEP BLOOMING", "RADIANT VIBE", "BE BOLD", "LIVE FULLY",
    "STAY SWEET", "YOU ARE ENOUGH", "MAKE IT COUNT", "STAY GRATEFUL", "PURE HAPPINESS", "BEYOND LIMITS"
  ][i] || `INSPIRATION ${i}`
}));

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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");

  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<FrameBlueprint | null>(null);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedQuote, setSelectedQuote] = useState(QUOTES[0]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [activeStickerCategory, setActiveStickerCategory] = useState("HEARTS");

  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [usbDirectoryHandle, setUsbDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isDevMode, setIsDevMode] = useState<boolean>(true);

  const [logoTapCount, setLogoTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [softCopyQrUrl, setSoftCopyQrUrl] = useState("");
  const [facebookQrUrl, setFacebookQrUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "complete" | "error">("idle");
  const exportTriggeredRef = useRef(false);

  const serialPortRef = useRef<any>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isOwnerMode) {
        document.body.classList.add('admin-mode');
      } else {
        document.body.classList.remove('admin-mode');
      }
    }
  }, [isOwnerMode]);

  useEffect(() => {
    if (appState === "welcome") {
      setIsOwnerMode(false);
    }
  }, [appState]);

  const initBillAcceptor = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('serial' in navigator)) return;
    try {
      const ports = await (navigator as any).serial.getPorts();
      if (ports.length > 0) {
        const port = ports[0];
        await port.open({ baudRate: 9600 });
        serialPortRef.current = port;
        const reader = port.readable.getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value && value.length > 0) {
            const byte = value[0];
            let detectedAmount = 0;
            if (byte === 0x41) detectedAmount = 20;
            else if (byte === 0x42) detectedAmount = 50;
            else if (byte === 0x43) detectedAmount = 100;
            else detectedAmount = 1;

            if (detectedAmount > 0) {
              setPaymentReceived(prev => prev + detectedAmount);
              KioskLogger.log('info', 'Payment', `Cash Inserted: PHP ${detectedAmount}`);
            }
          }
        }
      }
    } catch (e) {
      KioskLogger.log('warn', 'Hardware', 'Bill Acceptor handshake pending.');
    }
  }, []);

  useEffect(() => {
    initBillAcceptor();
    return () => {
      if (serialPortRef.current) {
        serialPortRef.current.close().catch(() => {});
      }
    };
  }, [initBillAcceptor]);

  useEffect(() => {
    if (typeof window !== 'undefined' && appState === "printing") {
      const fbLink = "https://www.facebook.com/share/18vTg5nLF3/";
      setFacebookQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(fbLink)}`);
    }
  }, [appState]);

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

  useEffect(() => {
    if (typeof window !== 'undefined' && appState !== "welcome" && appState !== "printing" && appState !== "test-camera") {
      SessionStore.save({
        state: appState,
        packageSelected,
        paymentReceived,
        capturedPhotos,
        promoConsent
      });
    }
  }, [appState, packageSelected, paymentReceived, capturedPhotos, promoConsent]);

  useEffect(() => {
    const detectHardware = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setAvailableCameras(videoDevices);
          if (videoDevices.length > 0 && !selectedCameraId) {
            setSelectedCameraId(videoDevices[0].deviceId);
          }
        }
      } catch (err) {}
    };
    detectHardware();
  }, [selectedCameraId]);

  const availableBlueprints = useMemo(() => {
    if (appState === "test-camera") return BLUEPRINTS;
    if (!packageSelected) return [];
    return BLUEPRINTS.filter(bp => bp.package === packageSelected);
  }, [packageSelected, appState]);

  const availableFilters = useMemo(() => {
    if (appState === "test-camera" || packageSelected === 100) return FILTERS;
    return FILTERS.slice(0, 5); 
  }, [packageSelected, appState]);

  useEffect(() => {
    if (packageSelected || appState === "test-camera") {
      if (!selectedBlueprint || selectedBlueprint.package !== packageSelected) {
        const first = availableBlueprints[0];
        if (first) setSelectedBlueprint(first);
      }
    }
  }, [packageSelected, appState, availableBlueprints, selectedBlueprint]);

  const initiatePrint = (blob: Blob) => {
    if (!printIframeRef.current) return;
    const iframe = printIframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const dataUrl = URL.createObjectURL(blob);
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
          <img src="${dataUrl}" onload="window.print();" />
        </body>
      </html>
    `);
    doc.close();
    setTimeout(() => URL.revokeObjectURL(dataUrl), 5000);
  };

  const handleFinalExport = useCallback(async () => {
    if (!selectedBlueprint || capturedPhotos.length === 0) return;
    
    // COMMERCIAL SECURITY: Unique random unguessable Session ID
    const sessionId = `jnl_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    const startTime = performance.now();
    KioskLogger.log('info', 'Export', `Secure Session Start: ${sessionId}`);

    // Step 1: Photo Generation
    const genStart = performance.now();
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1600;
    exportCanvas.height = 2400;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1600, 2400);

    const filterClass = selectedFilter.class;
    const isStrip = selectedBlueprint.package === 50;
    
    const drawContent = async (offsetX: number) => {
      for (let i = 0; i < selectedBlueprint.slots.length; i++) {
        const slot = selectedBlueprint.slots[i];
        const photo = capturedPhotos[i];
        if (!photo) continue;
        
        const img = new Image();
        img.src = photo;
        await new Promise(resolve => img.onload = resolve);
        
        const sX = isStrip ? slot.x / 2 : slot.x;
        const sW = isStrip ? slot.w / 2 : slot.w;
        
        ctx.save();
        if (filterClass.includes('brightness')) ctx.filter += ' brightness(1.1)';
        if (filterClass.includes('contrast')) ctx.filter += ' contrast(1.1)';
        if (filterClass.includes('sepia')) ctx.filter += ' sepia(0.2)';
        if (filterClass.includes('grayscale')) ctx.filter += ' grayscale(1)';
        if (filterClass.includes('saturate')) ctx.filter += ' saturate(1.3)';
        
        ctx.drawImage(img, sX + offsetX, slot.y, sW, slot.h);
        ctx.restore();
      }
    };

    if (isStrip) {
      await drawContent(0);
      await drawContent(800);
    } else {
      await drawContent(0);
    }
    const genEnd = performance.now();
    const genTime = (genEnd - genStart).toFixed(2);
    console.log(`[AUDIT] Photo Generation: ${genTime}ms`);

    exportCanvas.toBlob(async (blob) => {
      if (!blob) return;

      // Step 2: Instant QR Display (STRICT PRODUCTION ROUTING)
      const qrReadyStart = performance.now();
      const retrievalUrl = `${PUBLIC_KIOSK_URL}/retrieve/${sessionId}`;
      console.log(`[AUDIT] FINAL QR URL: ${retrievalUrl}`);
      setSoftCopyQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(retrievalUrl)}`);
      const qrReadyEnd = performance.now();
      const qrTime = (qrReadyEnd - qrReadyStart).toFixed(2);
      console.log(`[AUDIT] QR Display Ready: ${qrTime}ms`);

      // Step 3: Parallel Tasks (Local Save + Print)
      const localSaveStart = performance.now();
      SessionStore.savePhotoLocally(sessionId, blob);
      const localSaveEnd = performance.now();
      console.log(`[AUDIT] Local Save: ${(localSaveEnd - localSaveStart).toFixed(2)}ms`);

      initiatePrint(blob); 
      console.log(`[AUDIT] Print Handshake Parallelized`);

      // Step 4: Background Cloud Sync (STRICT PRIVACY)
      setUploadStatus("uploading");
      const cloudSyncStart = performance.now();
      (async () => {
        try {
          const { storage, db } = initializeFirebase();
          const photoRef = ref(storage, `photos/${sessionId}.jpg`);
          await uploadBytes(photoRef, blob);
          await setDoc(doc(db, "photos", sessionId), {
            id: sessionId,
            storagePath: photoRef.fullPath,
            timestamp: serverTimestamp(),
            isDownloaded: false
          });
          setUploadStatus("complete");
          KioskLogger.log('info', 'Sync', `Secure Cloud Ready: ${sessionId} in ${(performance.now() - cloudSyncStart).toFixed(2)}ms`);
        } catch (e) {
          setUploadStatus("error");
          KioskLogger.log('error', 'Sync', `Cloud Fail: ${e}`);
        }
      })();

      // Step 5: Parallel USB Backup
      if (usbDirectoryHandle) {
        (async () => {
          try {
            const filename = `JNL_SECURE_${sessionId}.jpg`;
            const fileHandle = await (usbDirectoryHandle as any).getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
          } catch (e) {}
        })();
      }

    }, 'image/jpeg', 0.85);

  }, [usbDirectoryHandle, selectedBlueprint, capturedPhotos, selectedFilter]);

  useEffect(() => {
    if (appState === "printing" && !exportTriggeredRef.current) {
      exportTriggeredRef.current = true;
      handleFinalExport();
    }
    if (appState === "welcome") {
      exportTriggeredRef.current = false;
      setUploadStatus("idle");
      setSoftCopyQrUrl("");
    }
  }, [appState, handleFinalExport]);

  useEffect(() => {
    if (appState === "printing" && printProgress < 100) {
      const timer = setInterval(() => {
        setPrintProgress(prev => Math.min(prev + 1, 100));
      }, 150); 
      return () => clearInterval(timer);
    }
  }, [appState, printProgress]);

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
    setIsOwnerMode(false); 
  }, []);

  const startCamera = async (deviceId?: string) => {
    if (cameraStream && videoRef.current && videoRef.current.srcObject === cameraStream) return true;
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    
    const tryStream = async (constraints: MediaStreamConstraints) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        return true;
      } catch (e) { return false; }
    };
    
    return await tryStream({ video: { deviceId: deviceId ? { exact: deviceId } : undefined, facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1706 } }, audio: false });
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

  useEffect(() => {
    if (appState === "setup" || appState === "capturing" || appState === "test-camera") {
      startCamera(selectedCameraId);
    } else {
      if (!isOwnerMode) stopCamera();
    }
  }, [appState, isOwnerMode, selectedCameraId]);

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
            onSetupBillAcceptor={async () => { try { if ('serial' in navigator) { await (navigator as any).serial.requestPort(); initBillAcceptor(); } } catch (e) {} }}
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
              <div className="flex flex-col items-center cursor-pointer" onClick={handleHiddenTrigger}>
                <JnlLogo variant="hero" color="light" className="mb-0" />
              </div>
            </div>

            <div className="w-full flex flex-col items-center pb-20 space-y-12">
              <h2 className="font-headline font-black text-2xl sm:text-3xl tracking-[0.2em] uppercase italic text-white/90">TOUCH TO START</h2>
              <NeonButton onClick={() => setAppState("payment")} className="w-[75%] sm:w-[60%] lg:w-[40%] text-3xl py-12">READY?</NeonButton>
            </div>
          </div>
        )}

        {appState === "payment" && (
          <div className="w-full max-w-2xl animate-in slide-in-from-bottom-8 duration-500 text-center flex flex-col items-center justify-center h-full px-6">
            <div className="mb-10">
               <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-primary/30">
                  <Banknote className="w-10 h-10 text-primary" />
               </div>
               <h2 className="font-headline font-black text-4xl mb-2 italic uppercase">INSERT CASH</h2>
               <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">AWAITING BILL ACCEPTOR</p>
            </div>
            <div className="bg-white/5 border-2 border-white/10 p-10 mb-8 w-full max-md">
               <div className="text-6xl font-black italic text-primary mb-2">{paymentReceived} <span className="text-2xl text-white">PHP</span></div>
            </div>
            <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
              {paymentReceived >= 50 && (
                <NeonButton onClick={() => { setPackageSelected(paymentReceived >= 100 ? 100 : 50); setAppState("setup"); }} className="w-full py-6 text-xl">START SESSION</NeonButton>
              )}
            </div>
          </div>
        )}

        {(appState === "setup" || appState === "test-camera") && (
          <div className="w-full h-full max-w-7xl flex flex-col lg:flex-row gap-8 items-center lg:items-start animate-in fade-in duration-500 py-10 px-8">
             <div className="relative w-full lg:flex-1 aspect-[3/4] max-h-[70vh] bg-zinc-900 border-4 border-white shadow-[0_0_30px_rgba(255,51,153,0.3)] overflow-hidden flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className={cn("absolute inset-0 w-full h-full object-cover", selectedFilter.class)} />
             </div>
             <div className="w-full lg:w-[450px] space-y-8 max-h-[75vh] overflow-y-auto scrollbar-hide">
              <h2 className="font-headline font-black text-4xl italic uppercase text-primary">Styling</h2>
              <div className="space-y-10">
                <div>
                  <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                    <Frame className="w-4 h-4 text-primary" /> Select Layout
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {availableBlueprints.map((bp) => (
                      <button key={bp.id} onClick={() => setSelectedBlueprint(bp)} className={cn("aspect-[3/4] relative border-2 transition-all p-1", selectedBlueprint?.id === bp.id ? "bg-primary/20 border-primary shadow-[0_0_15px_#FF3399]" : "bg-white/5 border-white/10")}>
                        <div className="relative w-full h-full bg-zinc-800/50">
                          {bp.slots.map((slot, i) => (
                            <div key={i} className="absolute bg-white/20 border border-white/5" style={{ left: `${((bp.package === 50 ? slot.x / 2 : slot.x) / (bp.package === 50 ? 800 : 1600)) * 100}%`, top: `${(slot.y / 2400) * 100}%`, width: `${((bp.package === 50 ? slot.w / 2 : slot.w) / (bp.package === 50 ? 800 : 1600)) * 100}%`, height: `${(slot.h / 2400) * 100}%` }} />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                    <Sparkles className="w-4 h-4 text-primary" /> Premium Filters
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {availableFilters.map((f) => (
                      <button key={f.id} onClick={() => setSelectedFilter(f)} className={cn("aspect-square relative transition-all border-2 overflow-hidden", selectedFilter.id === f.id ? "border-primary shadow-[0_0_10px_#FF3399]" : "border-white/10")}>
                        <div className={cn("absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900", f.class)} />
                        <span className={cn("relative z-10 text-[8px] font-black italic p-1", selectedFilter.id === f.id ? "text-white" : "text-white/60")}>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <NeonButton onClick={() => startShotSequence()} className="w-full !py-10 text-2xl" disabled={!!cameraError}>SHOOT</NeonButton>
            </div>
          </div>
        )}

        {appState === "capturing" && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black animate-in fade-in duration-500 w-full h-full">
             <div className="relative w-full h-full overflow-hidden">
               <video ref={videoRef} autoPlay playsInline muted className={cn("absolute inset-0 w-full h-full object-cover z-0", selectedFilter.class)} />
               {isProcessing && <div className="absolute inset-0 bg-white z-30 animate-in fade-in out-fade-out duration-300" />}
               {countdown !== null && (
                 <div className="absolute inset-0 flex items-center justify-center bg-transparent z-40 pointer-events-none">
                    <span className="text-[25rem] font-headline font-black italic text-white animate-bounce drop-shadow-[0_0_60px_rgba(255,51,153,0.9)]">{countdown}</span>
                 </div>
               )}
             </div>
          </div>
        )}

        {appState === "review" && (
          <div className="w-full h-full max-7xl flex flex-col lg:flex-row items-center justify-center gap-12 animate-in fade-in duration-500 py-6 px-8">
            <div className="relative w-full lg:flex-1 h-full flex items-center justify-center overflow-hidden">
              <div className="h-full w-auto max-w-full shadow-[0_0_60px_rgba(0,0,0,0.8)] relative border-4 border-white">
                 {selectedBlueprint && capturedPhotos.length > 0 && <BlueprintFrame blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.class} isPreview />}
              </div>
            </div>
            <div className="w-full lg:w-96 space-y-6 flex flex-col items-center lg:items-start shrink-0">
               <h2 className="font-headline font-black text-5xl italic uppercase text-primary leading-none">PREVIEW</h2>
               <div className="grid grid-cols-1 gap-4 w-full">
                  <NeonButton onClick={() => setAppState("decorating")} className="w-full !py-10 text-2xl flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-8 h-8" /> USE PHOTO
                  </NeonButton>
                  <button onClick={() => { setCapturedPhotos([]); setAppState("setup"); }} className="w-full border-4 border-white font-headline font-black text-xl py-8 italic uppercase hover:bg-white hover:text-black flex items-center justify-center gap-3 transition-colors">
                    <RotateCcw className="w-8 h-8" /> RETAKE
                  </button>
               </div>
            </div>
          </div>
        )}

        {appState === "decorating" && (
          <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-12 items-center lg:items-start animate-in fade-in duration-500 py-10 px-8">
             <div className="relative flex-1 w-full h-[70vh] flex items-center justify-center">
                <div className="relative h-full w-auto max-w-[450px] shadow-[0_0_40px_rgba(255,51,153,0.2)]">
                  {selectedBlueprint && capturedPhotos.length > 0 && (
                    <BlueprintFrame 
                      blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.class} isPreview
                      quoteText={selectedQuote.text} stickers={placedStickers} selectedStickerId={selectedStickerId}
                      onUpdateSticker={handleUpdateSticker} onRemoveSticker={handleRemoveSticker} onSelectSticker={setSelectedStickerId} onBringToFront={handleBringToFront}
                    />
                  )}
                </div>
             </div>
             <div className="w-full lg:w-[450px] space-y-8 lg:max-h-[80vh] overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="font-headline font-black text-4xl italic uppercase text-primary">Decor</h2>
                  <button onClick={() => setPlacedStickers([])} className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4 inline mr-2" /> Clear All</button>
                </div>
                <div className="space-y-10">
                  <Tabs defaultValue="HEARTS" onValueChange={setActiveStickerCategory} className="w-full">
                    <TabsList className="w-full grid grid-cols-5 bg-white/10 border border-white/20 mb-6 h-14 rounded-2xl p-1">
                      {["HEARTS", "CUTE", "PHOTO", "AESTHETIC", "TEXT"].map((cat) => (
                        <TabsTrigger key={cat} value={cat} className="text-[10px] font-black tracking-tighter">{cat}</TabsTrigger>
                      ))}
                    </TabsList>
                    <div className="grid grid-cols-4 gap-4 max-h-[30vh] overflow-y-auto scrollbar-hide pr-2">
                      {STICKER_DEFS.filter(s => s.category === activeStickerCategory).map((s) => (
                        <button key={s.id} onClick={() => addSticker(s.id)} className="aspect-square flex items-center justify-center bg-white/5 border-2 border-white/10 rounded-2xl hover:border-primary/50 transition-all hover:scale-105 active:scale-95">
                          <s.icon className={cn("w-10 h-10", s.color)} />
                        </button>
                      ))}
                    </div>
                  </Tabs>
                  <div>
                    <div className="flex items-center gap-3 mb-4 text-white uppercase font-black text-xs tracking-widest border-b border-white/10 pb-2">
                      <Quote className="w-4 h-4 text-primary" /> Inspiration
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto scrollbar-hide pr-2">
                      {QUOTES.map((q) => (
                        <button key={q.id} onClick={() => setSelectedQuote(q)} className={cn("py-4 px-4 text-[11px] font-black uppercase border-2 italic text-left rounded-xl transition-all", selectedQuote.id === q.id ? "bg-primary border-primary text-white shadow-[0_0_10px_#FF3399]" : "bg-white/5 border-white/10 text-white/40 hover:border-white/30")}>{q.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <NeonButton onClick={() => setAppState("consent")} className="w-full !py-10 text-2xl mt-6">FINISH SESSION</NeonButton>
             </div>
          </div>
        )}

        {appState === "consent" && (
          <div className="w-full max-w-3xl animate-in slide-in-from-bottom-8 duration-500 text-center flex flex-col items-center justify-center h-full px-12">
             <h2 className="font-headline font-black text-5xl mb-6 italic uppercase leading-tight">Help Us Share <br /><span className="text-primary">Happy Memories ✨</span></h2>
             <div className="space-y-6 mb-12">
               <p className="text-xl font-bold text-white/90">May we use your moments from this photo booth for promotional posts on JNL STUDIO Facebook page?</p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
               <NeonButton onClick={() => { setPromoConsent(true); setAppState("printing"); }} className="w-full !py-10 text-xl">YES, WE ALLOW IT</NeonButton>
               <button onClick={() => { setPromoConsent(false); setAppState("printing"); }} className="w-full border-4 border-white/20 font-headline font-black text-xl py-10 italic uppercase text-white/40 hover:text-white hover:border-white transition-all">NO, THANK YOU</button>
            </div>
          </div>
        )}

        {appState === "printing" && (
          <div className="w-full max-w-7xl animate-in fade-in duration-500 text-center flex flex-col items-center justify-center h-full px-10">
             <div className="flex flex-col lg:flex-row items-center gap-16 w-full max-w-5xl">
                <div className="flex-1 space-y-10">
                   <div className="relative w-32 h-32 mx-auto">
                     <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                     <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Printer className="w-12 h-12 text-primary animate-pulse" />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <h2 className="font-headline font-black text-3xl italic uppercase">Printing Portrait...</h2>
                     <p className="text-[10px] uppercase font-black tracking-[0.5em] text-white/40">COLLECT YOUR COPIES SOON</p>
                   </div>
                   <div className="w-full">
                     <Progress value={printProgress} className="h-3 bg-white/5" />
                   </div>
                </div>

                <div className="bg-white/5 border-2 border-white/10 p-8 flex flex-col items-center space-y-4 rounded-3xl shadow-2xl w-full lg:w-80 transition-all min-h-[400px]">
                   <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center space-y-6 w-full">
                     <div className="flex items-center gap-2">
                       <QrCode className="w-6 h-6 text-primary" />
                       <h3 className="font-headline font-black text-xl uppercase italic">SCAN TO SAVE</h3>
                     </div>
                     
                     <div className="aspect-square w-full bg-white p-4 rounded-2xl shadow-[0_0_30px_rgba(255,51,153,0.3)] relative overflow-hidden flex items-center justify-center">
                        {softCopyQrUrl ? (
                          <img src={softCopyQrUrl} alt="Soft Copy QR" className="w-full h-full object-contain animate-in fade-in duration-300" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-primary">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-[8px] font-black uppercase text-zinc-400">Verifying HD...</span>
                          </div>
                        )}
                     </div>

                     <div className="flex flex-col items-center gap-1">
                       <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest text-center">Instant HD Download</p>
                       {uploadStatus === "uploading" && <div className="text-[7px] text-primary/60 font-black uppercase animate-pulse">Handshaking Cloud...</div>}
                       {uploadStatus === "complete" && <div className="text-[7px] text-green-500 font-black uppercase">HD Ready</div>}
                     </div>
                   </div>
                   
                   {printProgress === 100 && (
                     <button onClick={() => setAppState("thankyou")} className="w-full mt-4 bg-primary py-4 font-headline font-black italic uppercase rounded-xl shadow-lg active:scale-95 transition-transform animate-in slide-in-from-bottom-2">FINISH SESSION</button>
                   )}
                </div>
             </div>
          </div>
        )}

        {appState === "thankyou" && (
          <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-500 text-center flex flex-col items-center justify-center px-10">
             <div className="flex flex-col items-center space-y-10 animate-in slide-in-from-bottom-8 w-full max-w-3xl">
                <h2 className="font-headline font-black text-6xl italic uppercase leading-none">THANK <span className="text-primary">YOU!</span></h2>
                <div className="bg-white/5 border-2 border-white/10 p-10 flex flex-col items-center space-y-6 rounded-3xl shadow-2xl w-full">
                   <Facebook className="w-16 h-16 text-blue-500" />
                   <h3 className="font-headline font-black text-2xl uppercase italic text-center">FOLLOW US 👇</h3>
                   <div className="aspect-square w-full max-w-[240px] bg-white p-6 rounded-3xl">
                      {facebookQrUrl && <img src={facebookQrUrl} alt="Facebook QR" className="w-full h-full object-contain" />}
                   </div>
                   <p className="text-xs text-white/60 font-medium italic">Share your best moments with #JNLSTUDIO</p>
                </div>
                <NeonButton onClick={resetSession} className="px-20 !py-8 text-2xl">DONE</NeonButton>
             </div>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}