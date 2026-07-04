
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { AdminAuthDialog } from "@/components/kiosk/admin-auth-dialog";
import { AdminControls } from "@/components/kiosk/admin-controls";
import { HealthMonitor } from "@/components/kiosk/health-monitor";
import { JnlLogo } from "@/components/kiosk/jnl-logo";
import { 
  Target, CheckCircle2, AlertCircle, Loader2, Camera, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BLUEPRINTS, FrameBlueprint } from "@/components/kiosk/frame-blueprint";
import { BlueprintFrame } from "@/components/kiosk/blueprint-frame";
import { Progress } from "@/components/ui/progress";
import { SessionStore } from "@/lib/kiosk/persistence";
import { KioskLogger } from "@/lib/kiosk/logger";
import { initializeFirebase } from "@/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { 
  SessionState, 
  FILTERS, 
  QUOTES, 
  STICKER_DEFS, 
  PlacedSticker 
} from "@/lib/kiosk/constants";

export default function KioskPage() {
  const [appState, setAppState] = useState<SessionState>("welcome");
  const [packageSelected, setPackageSelected] = useState<50 | 100 | null>(null);
  const [paymentReceived, setPaymentReceived] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [printProgress, setPrintProgress] = useState(0);
  const [selectedRetakeIndex, setSelectedRetakeIndex] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<FrameBlueprint | null>(null);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedQuote, setSelectedQuote] = useState(QUOTES[0]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [softCopyQrUrl, setSoftCopyQrUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "complete" | "error">("idle");
  const [promoConsent, setPromoConsent] = useState<boolean | null>(null);
  
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [isCapturingReady, setIsCapturingReady] = useState(false);
  
  const [originUrl, setOriginUrl] = useState("https://jnl-studio-booth.web.app");

  // PRINT PRE-SPOOLING SYSTEM
  const [preparedBlob, setPreparedBlob] = useState<Blob | null>(null);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  const [runtimeStatus, setRuntimeStatus] = useState({
    photoGenerated: 'PENDING',
    blobCreated: 'PENDING',
    photoSaved: 'PENDING',
    intentTriggered: 'PENDING',
    intentAcknowledged: 'PENDING',
    cloudSync: 'PENDING',
    sessionCreated: 'PENDING',
    fileCreated: 'PENDING',
    navigatorShareStarted: 'PENDING',
    navigatorShareResolved: 'PENDING',
    navigatorShareRejected: 'PENDING',
    nokoprintOpened: 'PENDING',
    secureContext: 'CHECKING',
    topLevelContext: 'CHECKING',
    userAgent: '',
    lastErrorMessage: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRuntimeStatus(prev => ({
        ...prev,
        secureContext: window.isSecureContext ? 'YES' : 'NO',
        topLevelContext: window.self === window.top ? 'YES' : 'NO',
        userAgent: navigator.userAgent
      }));
      setOriginUrl(window.location.origin);
    }
  }, []);

  // AUTOMATIC TRANSITION AFTER PAYMENT
  useEffect(() => {
    if (appState === "payment") {
      if (paymentReceived >= 50) {
        setAppState("package-selection");
      }
    }
  }, [paymentReceived, appState]);

  useEffect(() => {
    if (appState === "printing") {
      const interval = setInterval(() => {
        setPrintProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [appState]);

  /**
   * INITIATE PRINT (SYNCHRONOUS INTENT DISPATCH)
   */
  const initiatePrint = useCallback(async (blob: Blob) => {
    KioskLogger.log('info', 'PRINT', 'User Gesture Activated. Requesting Intent...', 'PENDING');
    setRuntimeStatus(prev => ({ ...prev, intentTriggered: 'SUCCESS', navigatorShareStarted: 'SUCCESS' }));
    
    try {
      const fileName = `JNL_Studio_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      setRuntimeStatus(prev => ({ ...prev, fileCreated: 'SUCCESS' }));

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'JNL Studio Portrait',
          text: 'Open with NokoPrint'
        });
        setRuntimeStatus(prev => ({ ...prev, intentAcknowledged: 'SUCCESS', navigatorShareResolved: 'SUCCESS', nokoprintOpened: 'SUCCESS' }));
      } else {
        setRuntimeStatus(prev => ({ ...prev, intentTriggered: 'FAILED', navigatorShareRejected: 'FAILED' }));
      }
    } catch (e: any) {
      setRuntimeStatus(prev => ({ ...prev, intentAcknowledged: 'FAILED', navigatorShareRejected: 'FAILED', lastErrorMessage: e.message }));
    }
  }, []);

  const preSpoolPrintFile = useCallback(async () => {
    if (!selectedBlueprint || capturedPhotos.length === 0) return;
    
    setIsPreparingPrint(true);
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1600;
    exportCanvas.height = 2400;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1600, 2400);

    const isStrip = selectedBlueprint.package === 50;
    const STRIP_W = isStrip ? 800 : 1600;

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

        if (selectedFilter.filter) { ctx.filter = selectedFilter.filter; }
        ctx.drawImage(img, sX + offsetX, slot.y, sW, slot.h);
        ctx.filter = 'none';
      }
      
      const sortedStickers = [...placedStickers].sort((a, b) => a.zIndex - b.zIndex);
      for (const s of sortedStickers) {
        const def = STICKER_DEFS.find(d => d.id === s.type);
        if (!def) continue;
        const stickerImg = new Image();
        const svgElement = document.querySelector(`[data-sticker-id="${s.id}"] svg`);
        if (!svgElement) continue;

        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        stickerImg.src = url;
        await new Promise(resolve => stickerImg.onload = resolve);

        const targetW = (s.size / 100) * STRIP_W;
        const targetX = (s.x / 100) * STRIP_W + offsetX;
        const targetY = (s.y / 100) * 2400;

        ctx.save();
        ctx.translate(targetX, targetY);
        ctx.rotate((s.rotation * Math.PI) / 180);
        ctx.scale(s.flipX ? -1 : 1, s.flipY ? -1 : 1);
        ctx.drawImage(stickerImg, -targetW / 2, -targetW / 2, targetW, targetW);
        ctx.restore();
        URL.revokeObjectURL(url);
      }
      
      const footerY = 2200;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(offsetX, footerY, STRIP_W, 200);

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.fillText(`"${selectedQuote.text}"`, offsetX + (STRIP_W / 2), footerY + 90);
      
      ctx.textAlign = 'left';
      ctx.font = '900 24px Inter, sans-serif';
      ctx.fillText('JNL STUDIO', offsetX + 60, footerY + 180);
    };

    if (isStrip) { await drawContent(0); await drawContent(800); } else { await drawContent(0); }

    setRuntimeStatus(prev => ({ ...prev, photoGenerated: 'SUCCESS' }));
    exportCanvas.toBlob((blob) => {
      if (blob) {
        setPreparedBlob(blob);
        setRuntimeStatus(prev => ({ ...prev, blobCreated: 'SUCCESS' }));
      }
      setIsPreparingPrint(false);
    }, 'image/jpeg', 0.95);
  }, [selectedBlueprint, capturedPhotos, selectedQuote, selectedFilter, placedStickers]);

  /**
   * HIGH-SPEED CLOUD SYNC
   * Generates QR instantly locally and uploads in the background.
   */
  const handleCloudSync = useCallback(async (blob: Blob) => {
    const sessionId = `jnl_${Math.random().toString(36).substring(2, 12)}`;
    setCurrentSessionId(sessionId);
    
    // INSTANT QR GENERATION (Pre-network)
    const retrievalUrl = `${originUrl}/retrieve/${sessionId}`;
    setSoftCopyQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(retrievalUrl)}`);

    const { storage, db } = initializeFirebase();
    
    // BACKGROUND SYNC (Non-blocking)
    SessionStore.savePhotoLocally(sessionId, blob);
    setUploadStatus("uploading");

    const docRef = doc(db, "photos", sessionId);
    const sessionData = {
      id: sessionId,
      storagePath: `photos/${sessionId}.jpg`,
      timestamp: serverTimestamp(),
      isDownloaded: false,
      promoConsent: null,
      status: 'uploading'
    };

    // Parallel execution
    setDoc(docRef, sessionData).then(() => {
      setRuntimeStatus(prev => ({ ...prev, sessionCreated: 'SUCCESS' }));
      const photoRef = ref(storage, `photos/${sessionId}.jpg`);
      uploadBytes(photoRef, blob).then(async () => {
        await updateDoc(docRef, { status: 'complete' });
        setUploadStatus("complete");
        setRuntimeStatus(prev => ({ ...prev, cloudSync: 'SUCCESS' }));
      });
    }).catch(async (error) => {
      setUploadStatus("error");
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: sessionData
      }));
    });
  }, [originUrl]);

  const addSticker = (type: string) => {
    const newSticker: PlacedSticker = {
      id: Math.random().toString(36).substring(7),
      type, x: 50, y: 50, size: 20, rotation: 0, zIndex: placedStickers.length + 100
    };
    setPlacedStickers([...placedStickers, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

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
    setSelectedRetakeIndex(null);
    setPromoConsent(null);
    setCurrentShotIndex(0);
    setPreparedBlob(null);
  }, []);

  const startShotSequence = async () => {
    const totalShots = packageSelected === 50 ? 3 : 6;
    const photos: string[] = capturedPhotos.length > 0 ? [...capturedPhotos] : [];
    
    setAppState("capturing");
    setIsCapturingReady(false);
    await new Promise(r => setTimeout(r, 1000));
    setIsCapturingReady(true);

    for (let i = (selectedRetakeIndex !== null ? selectedRetakeIndex : 0); 
         i < (selectedRetakeIndex !== null ? selectedRetakeIndex + 1 : totalShots); i++) {
      setCurrentShotIndex(i);
      setCountdown(null);
      await new Promise(r => setTimeout(r, 1000));
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(null);
      setIsProcessing(true);
      const shot = takePhoto();
      if (shot) {
        if (selectedRetakeIndex !== null) { photos[i] = shot; } else { photos.push(shot); }
        setCapturedPhotos([...photos]);
      }
      await new Promise(r => setTimeout(r, 500)); 
      setIsProcessing(false);
    }
    setSelectedRetakeIndex(null);
    setAppState("review");
  };

  const takePhoto = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      return canvasRef.current.toDataURL('image/jpeg', 0.95);
    }
    return null;
  };

  useEffect(() => {
    if (appState === "setup" || appState === "capturing") {
      const start = async () => {
        if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 1920 }, height: { ideal: 1080 } }, 
            audio: false 
          });
          setCameraStream(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) {}
      };
      start();
    }
    if (appState === "final-preview") { preSpoolPrintFile(); }
  }, [appState, preSpoolPrintFile]);

  return (
    <KioskLayout>
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex-1 w-full h-full flex flex-col items-center overflow-hidden kiosk-container safe-area-spacing landscape-container">
        
        <AdminAuthDialog isOpen={isAdminDialogOpen} onClose={() => setIsAdminDialogOpen(false)} onAuthSuccess={() => setIsOwnerMode(true)} />
        {isOwnerMode && (
          <AdminControls 
            currentStatus={appState}
            onJumpTo={setAppState}
            onReset={resetSession}
            onExitOwnerMode={() => setIsOwnerMode(false)}
            onSimulateCash={(amount) => setPaymentReceived(prev => prev + amount)}
            runtimeStatus={runtimeStatus}
          />
        )}
        <HealthMonitor />
        
        {appState === "welcome" && (
          <div className="flex flex-col items-center w-full h-full animate-in fade-in duration-1000">
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div onClick={() => { setLogoTapCount(p => p + 1); if (logoTapCount >= 4) { setIsAdminDialogOpen(true); setLogoTapCount(0); } }}>
                <JnlLogo variant="hero" color="light" />
              </div>
            </div>
            <div className="w-full flex flex-col items-center pb-20">
              <NeonButton onClick={() => setAppState("payment")} className="w-[40%] text-3xl py-12">TOUCH TO START</NeonButton>
            </div>
          </div>
        )}

        {appState === "payment" && (
          <div className="w-full max-w-2xl text-center flex flex-col items-center justify-center h-full px-6">
            <h2 className="font-headline font-black text-4xl mb-2 italic uppercase">WAITING ON INSERT OF MONEY</h2>
            <div className="bg-white/5 border-2 border-white/10 p-10 mb-8 w-full flex flex-col items-center justify-center">
               <div className="text-sm font-black uppercase text-white/40 mb-4 tracking-widest">
                 {paymentReceived === 0 ? "INSERT BILL NOW" : "CASH DETECTED"}
               </div>
               <div className="text-6xl font-black italic text-primary">{paymentReceived} PHP</div>
            </div>
          </div>
        )}

        {appState === "package-selection" && (
          <div className="w-full h-full flex flex-col items-center justify-center px-10 gap-12">
            <h2 className="text-5xl font-headline font-black italic uppercase text-primary">SELECT PACKAGE</h2>
            <div className="grid grid-cols-2 gap-10 w-full max-w-5xl">
              <button 
                onClick={() => { setPackageSelected(50); setAppState("setup"); }}
                className="group relative bg-white/5 border-4 border-white/10 p-12 flex flex-col items-center transition-all hover:border-primary hover:bg-primary/5 active:scale-95"
              >
                <span className="text-7xl font-black italic text-white mb-4">₱50</span>
                <span className="text-xl font-bold uppercase text-white/40 group-hover:text-primary">CLASSIC STRIP</span>
                <div className="mt-6 space-y-2 text-center text-sm font-bold uppercase text-white/60">
                  <p>3 PHOTO SHOTS</p>
                  <p>2x6 PHOTO STRIP</p>
                  <p>5 BEAUTY FILTERS</p>
                </div>
              </button>
              <button 
                disabled={paymentReceived < 100}
                onClick={() => { setPackageSelected(100); setAppState("setup"); }}
                className={cn(
                  "group relative bg-white/5 border-4 p-12 flex flex-col items-center transition-all",
                  paymentReceived >= 100 
                    ? "border-white/10 hover:border-primary hover:bg-primary/5 active:scale-95" 
                    : "border-white/5 opacity-40 cursor-not-allowed"
                )}
              >
                <span className="text-7xl font-black italic text-white mb-4">₱100</span>
                <span className="text-xl font-bold uppercase text-white/40 group-hover:text-primary">PREMIUM PORTRAIT</span>
                <div className="mt-6 space-y-2 text-center text-sm font-bold uppercase text-white/60">
                  <p>6 PHOTO SHOTS</p>
                  <p>4x6 SINGLE PORTRAIT</p>
                  <p>FULL FILTER LIBRARY</p>
                </div>
                {paymentReceived < 100 && (
                  <p className="mt-4 text-xs font-black text-red-500 italic uppercase">NEED ₱50 MORE</p>
                )}
              </button>
            </div>
          </div>
        )}

        {appState === "setup" && (
          <div className="w-full h-full max-7xl flex flex-row gap-8 items-start py-6 px-8 overflow-hidden">
             <div className="flex-[0.4] space-y-4 overflow-y-auto pr-4 scrollbar-hide h-full pb-20">
                <div className="space-y-4">
                  <h2 className="font-headline font-black text-2xl italic uppercase text-primary">Layout Selection</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {BLUEPRINTS.filter(b => b.package === packageSelected).map(bp => (
                      <button key={bp.id} onClick={() => setSelectedBlueprint(bp)} className={cn("p-4 border-2 flex flex-col items-center bg-white/5 transition-all min-h-[200px]", selectedBlueprint?.id === bp.id ? "border-primary bg-primary/10" : "border-white/10")}>
                        <div className="flex-1 w-full relative mb-2">
                          <BlueprintFrame blueprint={bp} photos={[]} isPreview className="!h-full !w-auto" />
                        </div>
                        <span className="text-[8px] font-black uppercase italic">{bp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="font-headline font-black text-2xl italic uppercase text-primary">Beauty Filters</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {FILTERS.slice(0, packageSelected === 50 ? 5 : FILTERS.length).map(f => (
                      <button key={f.id} onClick={() => setSelectedFilter(f)} className={cn("p-4 border-2 flex flex-col bg-white/5 transition-all", selectedFilter.id === f.id ? "border-primary bg-primary/10" : "border-white/10")}>
                        <span className="text-[10px] font-black uppercase italic">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
             </div>
             <div className="flex-1 flex flex-col gap-6 h-full">
                <div className="relative flex-1 bg-zinc-900 border-4 border-white overflow-hidden shadow-2xl">
                   <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" style={{ filter: selectedFilter.filter }} />
                </div>
                <NeonButton disabled={!selectedBlueprint} onClick={() => startShotSequence()} className="w-full py-10 text-3xl">START SESSION</NeonButton>
             </div>
          </div>
        )}

        {appState === "capturing" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
             <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" style={{ filter: selectedFilter.filter }} />
             {isCapturingReady && (
               <div className="absolute top-10 left-10 z-[120] bg-black/60 px-6 py-3 border border-primary backdrop-blur-md">
                  <span className="text-2xl font-black italic uppercase text-primary">SHOT {currentShotIndex + 1} OF {packageSelected === 50 ? 3 : 6}</span>
               </div>
             )}
             {countdown !== null && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-[110]">
                 <span className="text-[25rem] font-black italic text-white animate-bounce drop-shadow-[0_0_50px_rgba(255,51,153,0.8)]">{countdown}</span>
               </div>
             )}
             {isProcessing && <div className="absolute inset-0 bg-white animate-pulse z-[130]" />}
          </div>
        )}

        {appState === "review" && (
          <div className="w-full h-full flex flex-row items-center justify-center gap-12 py-6 px-8">
            <div className="flex-1 flex flex-col items-center">
              <div className="h-[70vh] aspect-[1600/2400] shadow-2xl relative border-4 border-white bg-white overflow-hidden">
                 {selectedBlueprint && (
                    <BlueprintFrame 
                      blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.filter} isPreview 
                      onSelectSlot={(idx) => setSelectedRetakeIndex(idx)} selectedSlotIndex={selectedRetakeIndex}
                    />
                 )}
              </div>
            </div>
            <div className="w-96 space-y-4">
               <NeonButton onClick={() => setAppState("decorating")} className="w-full py-8 text-xl">DECORATE</NeonButton>
               <button onClick={() => selectedRetakeIndex !== null && startShotSequence()} disabled={selectedRetakeIndex === null} className={cn("w-full py-8 font-black uppercase italic border-2 flex items-center justify-center gap-3", selectedRetakeIndex !== null ? "bg-white text-black" : "bg-white/5 text-white/20")}>
                 <Target className="w-5 h-5" /> Retake Selection
               </button>
               <button onClick={() => { setCapturedPhotos([]); setAppState("setup"); }} className="w-full py-4 text-[10px] font-black uppercase italic border border-white/10 text-white/40">Retake All</button>
            </div>
          </div>
        )}

        {appState === "decorating" && (
          <div className="w-full flex flex-row gap-12 items-start py-10 px-8">
             <div className="flex-1 h-[70vh] flex items-center justify-center">
                <div className="h-full aspect-[1600/2400] relative border-4 border-white bg-white shadow-2xl overflow-hidden">
                  {selectedBlueprint && (
                    <BlueprintFrame 
                      blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.filter} 
                      quoteText={selectedQuote.text} stickers={placedStickers} selectedStickerId={selectedStickerId}
                      onUpdateSticker={(id, updates) => setPlacedStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))}
                      onRemoveSticker={(id) => { setPlacedStickers(prev => prev.filter(s => s.id !== id)); setSelectedStickerId(null); }}
                      onSelectSticker={setSelectedStickerId} isPreview 
                    />
                  )}
                </div>
             </div>
             <div className="w-[450px] space-y-8 h-[70vh] flex flex-col">
                <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase text-white/40 italic">Premium Stickers</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {STICKER_DEFS.map(s => (
                          <button key={s.id} onClick={() => addSticker(s.id)} className="aspect-square bg-white/5 border-2 border-white/10 p-2 flex items-center justify-center hover:border-primary transition-colors">
                            <s.icon className={cn("w-full h-full", s.color)} />
                          </button>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase text-white/40 italic">Quotes</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {QUOTES.map(q => (
                          <button key={q.id} onClick={() => setSelectedQuote(q)} className={cn("p-4 border-2 text-left transition-all", selectedQuote.id === q.id ? "border-primary bg-primary/10" : "border-white/10 bg-white/5")}><p className="text-xs font-bold italic">"{q.text}"</p></button>
                        ))}
                      </div>
                   </div>
                </div>
                <NeonButton onClick={() => setAppState("final-preview")} className="w-full py-10 text-2xl">DONE</NeonButton>
             </div>
          </div>
        )}

        {appState === "final-preview" && (
          <div className="w-full h-full flex flex-col items-center justify-center py-6 px-8 space-y-8">
            <div className="flex-1 flex items-center justify-center">
              <div className="h-[60vh] relative border-[12px] border-white bg-white shadow-2xl overflow-hidden" style={{ aspectRatio: packageSelected === 50 ? '800/2400' : '1600/2400' }}>
                {selectedBlueprint && (
                  <BlueprintFrame blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.filter} quoteText={selectedQuote.text} stickers={placedStickers} isPreview={true} />
                )}
                {isPreparingPrint && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 z-[80]">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <span className="text-xs font-black uppercase italic text-primary">Pre-spooling...</span>
                  </div>
                )}
              </div>
            </div>
            <NeonButton 
              disabled={isPreparingPrint || !preparedBlob}
              onClick={() => { if (preparedBlob) { initiatePrint(preparedBlob); handleCloudSync(preparedBlob); } setAppState("printing"); }} 
              className="w-full max-w-lg py-8 text-2xl"
            >
              PROCEED TO PRINT
            </NeonButton>
          </div>
        )}

        {appState === "printing" && (
          <div className="w-full flex flex-col items-center justify-center gap-12 px-10 h-full relative">
             <div className="w-full max-w-4xl space-y-10 text-center flex flex-col items-center">
                <h2 className="font-headline font-black text-6xl italic uppercase text-primary">Printing...</h2>
                <Progress value={printProgress} className="h-6 bg-white/10 w-full" />
                {softCopyQrUrl && promoConsent !== null && (
                  <div className="mt-12 animate-in fade-in zoom-in duration-500">
                    <div className="bg-white/5 border-2 border-white/10 p-10 flex flex-col items-center space-y-6 rounded-[4rem] w-[450px] mx-auto shadow-2xl">
                      <h3 className="text-3xl font-black italic uppercase text-primary">HD SOFT COPY</h3>
                      <div className="aspect-square w-full bg-white p-8 rounded-[2.5rem] flex items-center justify-center">
                        <img src={softCopyQrUrl} alt="Scan to save" className="w-full h-full" />
                      </div>
                      <button onClick={() => setAppState("thankyou")} className="w-full bg-primary py-8 text-2xl font-black uppercase italic rounded-3xl active:scale-95">COMPLETE</button>
                    </div>
                  </div>
                )}
             </div>

             {promoConsent === null && (
               <div className="absolute inset-0 bg-black/90 border-4 border-primary p-16 flex flex-col items-center space-y-12 rounded-[5rem] w-full max-w-4xl shadow-2xl z-[150] self-center">
                 <div className="space-y-8 text-center">
                   <h3 className="text-5xl font-black italic uppercase text-primary">Share Your Photo?</h3>
                   <p className="text-white text-xl font-bold uppercase">May we post your photo on our Facebook page for promotion?</p>
                 </div>
                 <div className="grid grid-cols-2 gap-8 w-full">
                    <button onClick={() => setPromoConsent(true)} className="py-10 border-4 border-green-500 bg-green-500/20 text-green-500 text-3xl font-black italic uppercase rounded-3xl">YES</button>
                    <button onClick={() => setPromoConsent(false)} className="py-10 border-4 border-red-500 bg-red-500/20 text-red-500 text-3xl font-black italic uppercase rounded-3xl">NO</button>
                 </div>
               </div>
             )}
          </div>
        )}

        {appState === "thankyou" && (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000 p-10">
             <div className="flex flex-row gap-20 items-center justify-center">
                <div className="flex flex-col items-center space-y-6">
                   <h2 className="font-headline font-black text-4xl italic uppercase text-primary">HD SOFT COPY</h2>
                   <div className="w-64 h-64 bg-white p-4 rounded-3xl flex items-center justify-center">
                      <img src={softCopyQrUrl} alt="HD Retrieval" className="w-full h-full" />
                   </div>
                </div>
                <div className="flex flex-col items-center space-y-6">
                   <h2 className="font-headline font-black text-4xl italic uppercase text-primary flex items-center gap-3">
                     FOLLOW US <span className="text-5xl animate-bounce">👇</span>
                   </h2>
                   <div className="w-64 h-64 bg-white p-4 rounded-3xl flex items-center justify-center border-4 border-primary/20">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent("https://www.facebook.com/share/18vnB4a7gB/")}`} alt="Facebook QR" className="w-full h-full" />
                   </div>
                </div>
             </div>
             <NeonButton onClick={resetSession} className="px-20 py-8 text-2xl mt-16">BACK TO START</NeonButton>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
