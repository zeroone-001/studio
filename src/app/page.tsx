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
  CheckCircle2, RotateCcw, Cookie as CookieIcon, Banknote, Loader2, Target
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
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";

// COMMERCIAL PRODUCTION ROUTING
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
  { id: "sunset", label: "SUNSET", sub: "GOLDEN HOUR", class: "sepia-[0.4] saturate-[1.7] brightness-[1.1] contrast!-[1.1] hue-rotate-[-15deg]" },
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
  { id: "q11", label: "WILD", text: "Stay wild and free like the ocean." },
  { id: "q12", label: "ICONIC", text: "You were born to be absolutely iconic." },
  { id: "q13", label: "STRONG", text: "You are much stronger than you think." },
  { id: "q14", label: "BLOOM", text: "Keep blooming even when it feels hard." },
  { id: "q15", label: "ENERGY", text: "Protect your energy and stay positive." },
  { id: "q16", label: "TODAY", text: "Make today the best day of your life." },
  { id: "q17", label: "BELIEVE", text: "Believe in yourself and you will soar." },
  { id: "q18", label: "UNIQUE", text: "Your uniqueness is your greatest strength." },
  { id: "q19", label: "GRATEFUL", text: "Stay grateful for all the small things." },
  { id: "q20", label: "RADIANT", text: "Be radiant from the inside out today." },
  { id: "q21", label: "JOURNEY", text: "The journey is just as beautiful as the goal." },
  { id: "q22", label: "POWER", text: "The power to change is within you." },
  { id: "q23", label: "INSPIRED", text: "Stay inspired by the world around you." },
  { id: "q24", label: "BOLD", text: "Be bold enough to live on your terms." },
  { id: "q25", label: "SWEET", text: "Life is sweet when you find balance." },
  { id: "q26", label: "ENOUGH", text: "Remember that you are more than enough." },
  { id: "q27", label: "HEART", text: "Follow your heart and find your truth." },
  { id: "q28", label: "SMILE", text: "A simple smile can change the whole day." },
  { id: "q29", label: "LIGHT", text: "Be the light that others want to follow." },
  { id: "q30", label: "FEARLESS", text: "Live fearlessly and embrace every challenge." },
  { id: "q31", label: "SOUL", text: "Feed your soul with love and laughter." },
  { id: "q32", label: "MOMENT", text: "Every moment is a fresh new beginning." },
  { id: "q33", label: "VIBRANT", text: "Stay vibrant and full of creative life." },
  { id: "q34", label: "AUTHENTIC", text: "Authenticity is the most attractive trait." },
  { id: "q35", label: "HAPPY", text: "Happiness starts with a grateful heart." },
  { id: "q36", label: "BRIGHT", text: "The future is bright because you're in it." },
  { id: "q37", label: "TRUST", text: "Trust the timing of your amazing life." },
  { id: "q38", label: "CURIOUS", text: "Stay curious and keep exploring the world." },
  { id: "q39", label: "GLOW", text: "Your inner glow is your secret weapon." },
  { id: "q40", label: "UNSTOP", text: "You are completely unstoppable right now." },
  { id: "q41", label: "PRESENT", text: "Be present and enjoy the here and now." },
  { id: "q42", label: "PEACE", text: "Find peace in the quiet little moments." },
  { id: "q43", label: "CHANCE", text: "Take every single chance that comes your way." },
  { id: "q44", label: "INSIDE", text: "Beauty starts deep from within the soul." },
  { id: "q45", label: "GOLD", text: "You have a heart made of gold." },
  { id: "q46", label: "BORN", text: "You were born to stand out today." },
  { id: "q47", label: "WONDER", text: "Never lose your sense of wonder." },
  { id: "q48", label: "VIBE", text: "High vibes attract a high quality of life." },
  { id: "q49", label: "BEYOND", text: "Go beyond what you thought was possible." },
  { id: "q50", label: "DONE", text: "Small steps lead to big results." }
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

  const [currentSessionId, setCurrentSessionId] = useState("");
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

  // AUTO-PURGE MONITOR: Deletes local copy for "NO" sessions after download verification
  useEffect(() => {
    if (appState === "printing" && currentSessionId && promoConsent === false) {
      const { db } = initializeFirebase();
      const unsub = onSnapshot(doc(db, "photos", currentSessionId), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.isDownloaded === true) {
            KioskLogger.log('info', 'Privacy', `Auto-Purging NO session local copy: ${currentSessionId}`);
            SessionStore.cleanupSession(currentSessionId);
            unsub();
          }
        }
      });
      return () => unsub();
    }
  }, [appState, currentSessionId, promoConsent]);

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
    
    // 1. SECURE SESSION ID (HIGH ENTROPY)
    const sessionId = `jnl_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`;
    setCurrentSessionId(sessionId);

    // 2. IMMEDIATE QR GENERATION (PRODUCTION ROUTING)
    const retrievalUrl = `${PUBLIC_KIOSK_URL}/retrieve/${sessionId}`;
    setSoftCopyQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(retrievalUrl)}`);
    KioskLogger.log('info', 'Export', `Secure ID Linked: ${sessionId}`);

    // 3. CANVAS RENDERING
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
      // Photo Slots
      for (let i = 0; i < selectedBlueprint.slots.length; i++) {
        const slot = selectedBlueprint.slots[i];
        const photo = capturedPhotos[i];
        if (!photo) continue;
        
        const img = new Image();
        img.src = photo;
        await new Promise(resolve => img.onload = resolve);
        
        ctx.save();
        if (filterClass.includes('brightness')) ctx.filter += ' brightness(1.1)';
        if (filterClass.includes('contrast')) ctx.filter += ' contrast(1.1)';
        if (filterClass.includes('sepia')) ctx.filter += ' sepia(0.2)';
        if (filterClass.includes('grayscale')) ctx.filter += ' grayscale(1)';
        if (filterClass.includes('saturate')) ctx.filter += ' saturate(1.3)';
        
        ctx.drawImage(img, slot.x + offsetX, slot.y, slot.w, slot.h);
        ctx.restore();
      }

      // Branding Footer (Zero Gap)
      const footerY = 2304;
      const footerH = 96;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(offsetX, footerY, 1600, footerH);

      // Quote Center
      ctx.fillStyle = '#000000';
      ctx.font = 'italic 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(selectedQuote.text, offsetX + 800, footerY + 40);

      // JNL STUDIO Left
      ctx.fillStyle = '#000000';
      ctx.font = '900 italic 24px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('JNL', offsetX + 60, footerY + 80);
      ctx.fillStyle = '#FF3399';
      ctx.fillText('STUDIO', offsetX + 115, footerY + 80);
    };

    if (isStrip) {
      const originalSlots = selectedBlueprint.slots;
      const stripSlots = selectedBlueprint.slots.map(s => ({ ...s, x: s.x / 2, w: s.w / 2 }));
      // @ts-ignore
      selectedBlueprint.slots = stripSlots;
      await drawContent(0);
      await drawContent(800);
      // @ts-ignore
      selectedBlueprint.slots = originalSlots;
    } else {
      await drawContent(0);
    }

    // 4. SAVE & PARALLEL SYNC
    exportCanvas.toBlob(async (blob) => {
      if (!blob) return;

      // Local Persistence (Honor Pad Gallery simulation via IndexedDB)
      await SessionStore.savePhotoLocally(sessionId, blob);
      
      // DEFERRED USB BACKUP (Consent: YES)
      if (promoConsent === true && usbDirectoryHandle) {
        setTimeout(async () => {
          await SessionStore.saveToUsb(usbDirectoryHandle, sessionId, blob);
          KioskLogger.log('info', 'Hardware', `USB Backup (YES): ${sessionId} saved to Lexar.`);
        }, 2 * 60 * 1000); // 2 minutes delay
      }

      // Parallel Print Start
      initiatePrint(blob); 

      // Background Cloud Sync
      setUploadStatus("uploading");
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
        } catch (e) {
          setUploadStatus("error");
          KioskLogger.log('error', 'Cloud', 'Sync deferred.');
        }
      })();
    }, 'image/jpeg', 0.88);

  }, [selectedBlueprint, capturedPhotos, selectedFilter, selectedQuote, promoConsent, usbDirectoryHandle]);

  useEffect(() => {
    if (appState === "printing" && !exportTriggeredRef.current) {
      exportTriggeredRef.current = true;
      handleFinalExport();
    }
    if (appState === "welcome") {
      exportTriggeredRef.current = false;
      setUploadStatus("idle");
      setSoftCopyQrUrl("");
      setCurrentSessionId("");
    }
  }, [appState, handleFinalExport]);

  useEffect(() => {
    if (appState === "printing" && printProgress < 100) {
      const timer = setInterval(() => {
        setPrintProgress(prev => Math.min(prev + 1, 100));
      }, 120); 
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
    setSelectedRetakeIndex(null);
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

  const startSingleShotSequence = async (index: number) => {
    setAppState("capturing");
    setCountdown(null);
    setIsProcessing(false);
    
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
        return newPhotos;
      });
    }
    await new Promise(r => setTimeout(r, 600)); 
    setIsProcessing(false);
    setAppState("review");
    setSelectedRetakeIndex(null);
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
            <div className="relative w-full lg:flex-1 h-full flex flex-col items-center justify-center overflow-hidden">
              <div className="h-[60vh] lg:h-[70vh] w-auto max-w-full shadow-[0_0_60px_rgba(0,0,0,0.8)] relative border-4 border-white mb-6">
                 {selectedBlueprint && capturedPhotos.length > 0 && <BlueprintFrame blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.class} isPreview />}
              </div>
              
              {/* Photo Selector for Selective Retake */}
              <div className="w-full max-w-2xl bg-white/5 border border-white/10 p-4 rounded-3xl">
                <p className="text-[10px] font-black uppercase text-primary mb-3 text-center tracking-widest">Select a photo to retake</p>
                <div className="grid grid-cols-6 gap-2">
                  {capturedPhotos.map((photo, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedRetakeIndex(idx)}
                      className={cn(
                        "aspect-[3/4] border-2 transition-all relative overflow-hidden rounded-lg",
                        selectedRetakeIndex === idx ? "border-primary shadow-[0_0_15px_#FF3399] scale-105 z-10" : "border-white/10 hover:border-white/30"
                      )}
                    >
                      <img src={photo} alt={`Captured ${idx}`} className={cn("w-full h-full object-cover", selectedFilter.class)} />
                      {selectedRetakeIndex === idx && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white drop-shadow-lg" />
                        </div>
                      )}
                      <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 text-[8px] font-black rounded-sm">{idx + 1}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-96 space-y-6 flex flex-col items-center lg:items-start shrink-0">
               <h2 className="font-headline font-black text-5xl italic uppercase text-primary leading-none">PREVIEW</h2>
               <div className="grid grid-cols-1 gap-4 w-full">
                  <NeonButton onClick={() => setAppState("decorating")} className="w-full !py-10 text-2xl flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-8 h-8" /> USE PHOTO
                  </NeonButton>
                  
                  <div className="bg-white/5 border border-white/10 p-4 space-y-3 rounded-2xl">
                    <button 
                      onClick={() => {
                        if (selectedRetakeIndex !== null) startSingleShotSequence(selectedRetakeIndex);
                      }} 
                      disabled={selectedRetakeIndex === null}
                      className={cn(
                        "w-full py-6 font-headline font-black text-lg italic uppercase flex items-center justify-center gap-3 transition-all rounded-xl",
                        selectedRetakeIndex !== null 
                          ? "bg-primary text-white shadow-[0_0_15px_rgba(255,51,153,0.5)] active:scale-95" 
                          : "bg-white/5 text-white/20 cursor-not-allowed"
                      )}
                    >
                      <Target className="w-6 h-6" /> Retake Selected
                    </button>
                    
                    <button 
                      onClick={() => { setCapturedPhotos([]); setAppState("setup"); }} 
                      className="w-full border-2 border-white/20 font-headline font-black text-xs py-4 italic uppercase text-white/40 hover:text-white hover:border-white flex items-center justify-center gap-3 transition-colors rounded-xl"
                    >
                      <RotateCcw className="w-4 h-4" /> Retake All
                    </button>
                  </div>
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
                            <span className="text-[8px] font-black uppercase text-zinc-400">Preparing HD...</span>
                          </div>
                        )}
                     </div>

                     <div className="flex flex-col items-center gap-1">
                       <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest text-center">Instant HD Download</p>
                       {uploadStatus === "uploading" && <div className="text-[7px] text-primary/60 font-black uppercase animate-pulse">Syncing Cloud...</div>}
                       {uploadStatus === "complete" && <div className="text-[7px] text-green-500 font-black uppercase">HD Ready</div>}
                     </div>

                     {/* Instant Photo Verification Thumbnail */}
                     {capturedPhotos.length > 0 && (
                       <div className="w-full pt-4 border-t border-white/5 flex flex-col items-center gap-2">
                         <div className="w-24 aspect-[3/4] border-2 border-white/20 rounded-lg overflow-hidden relative shadow-lg">
                           <img src={capturedPhotos[0]} alt="Verification" className={cn("w-full h-full object-cover", selectedFilter.class)} />
                         </div>
                         <span className="text-[7px] font-black uppercase text-zinc-500">Soft Copy Preview</span>
                       </div>
                     )}
                   </div>
                   
                   {printProgress >= 90 && (
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