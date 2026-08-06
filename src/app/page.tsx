"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { AdminAuthDialog } from "@/components/kiosk/admin-auth-dialog";
import { AdminControls } from "@/components/kiosk/admin-controls";
import { HealthMonitor } from "@/components/kiosk/health-monitor";
import { JnlLogo } from "@/components/kiosk/jnl-logo";
import { 
  Target, CheckCircle2, AlertCircle, Loader2, Camera, WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BLUEPRINTS, FrameBlueprint } from "@/components/kiosk/frame-blueprint";
import { BlueprintFrame } from "@/components/kiosk/blueprint-frame";
import { Progress } from "@/components/ui/progress";
import { SessionStore } from "@/lib/kiosk/persistence";
import { KioskLogger } from "@/lib/kiosk/logger";
import { initializeFirebase } from "@/firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc 
} from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
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
  const spoolingRef = useRef(false);
  const printFrameRef = useRef<HTMLIFrameElement>(null);

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
  
  const [usbHandle, setUsbHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [galleryHandle, setGalleryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [preparedBlob, setPreparedBlob] = useState<Blob | null>(null);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { auth } = initializeFirebase();
      signInAnonymously(auth).catch(e => {
        KioskLogger.log('error', 'SESSION', 'Auth Failed', 'FAILED', `Code: ${e.code}, Msg: ${e.message}`);
      });
    }
  }, []);

  useEffect(() => {
    if (appState === "setup" || appState === "capturing") {
      const startCamera = async () => {
        if (cameraStream && cameraStream.active) {
          if (videoRef.current && videoRef.current.srcObject !== cameraStream) {
             videoRef.current.srcObject = cameraStream;
          }
          return;
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 1920 }, 
              height: { ideal: 1080 },
              facingMode: "user"
            }, 
            audio: false 
          });
          setCameraStream(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e: any) {
          KioskLogger.log('error', 'HARDWARE', 'Camera Failed', 'FAILED', e.message);
        }
      };
      startCamera();
    }
  }, [appState, cameraStream]);

  useEffect(() => {
    if (appState === "payment") {
      if (paymentReceived >= (packageSelected || 50)) {
        setAppState("package-selection");
      }
    }
  }, [paymentReceived, appState, packageSelected]);

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
      }, 150);
      return () => clearInterval(interval);
    }
  }, [appState]);

  const dispatchToPrintSpooler = (blob: Blob) => {
    KioskLogger.log('info', 'PRINT', 'Sending to Spooler', 'PENDING');
    if (printFrameRef.current) {
      const frame = printFrameRef.current;
      const frameDoc = frame.contentDocument || frame.contentWindow?.document;
      if (frameDoc) {
        const url = URL.createObjectURL(blob);
        frameDoc.body.innerHTML = `
          <style>@page { size: 4in 6in; margin: 0; } body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: white; } img { width: 100%; height: 100%; object-fit: contain; }</style>
          <img src="${url}">
        `;
        
        setTimeout(() => {
          frame.contentWindow?.focus();
          frame.contentWindow?.print();
          KioskLogger.log('info', 'PRINT', 'System Print Triggered', 'SUCCESS');
        }, 500);
      }
    } else {
      KioskLogger.log('error', 'PRINT', 'Bridge Missing', 'FAILED');
    }
  };

  const initiateBackgroundSaves = async (blob: Blob, sessionId: string) => {
    KioskLogger.log('info', 'SESSION', 'Starting Background Saves', 'PENDING');
    
    // 1. IndexedDB (Failsafe)
    await SessionStore.savePhotoLocally(sessionId, blob);

    // 2. Mounted Handles
    if (galleryHandle) {
      await SessionStore.saveToHandle(galleryHandle, 'JNL_GALLERY', sessionId, blob);
    } else {
      KioskLogger.log('warn', 'HARDWARE', 'Gallery skipped: Not mounted', 'FAILED');
    }
    
    if (usbHandle) {
      await SessionStore.saveToHandle(usbHandle, 'JNL_LEXAR', sessionId, blob);
    } else {
      KioskLogger.log('warn', 'HARDWARE', 'USB skipped: Not mounted', 'FAILED');
    }
  };

  const handleCloudSync = useCallback(async (blob: Blob, sessionId: string) => {
    const { storage, db, auth } = initializeFirebase();
    setUploadStatus("uploading");

    try {
      if (!auth.currentUser) await signInAnonymously(auth);

      const docRef = doc(db, "photos", sessionId);
      await setDoc(docRef, {
        id: sessionId,
        storagePath: `photos/${sessionId}.jpg`,
        timestamp: serverTimestamp(),
        isDownloaded: false,
        status: 'uploading'
      });

      const photoRef = ref(storage, `photos/${sessionId}.jpg`);
      const uploadTask = uploadBytesResumable(photoRef, blob, { contentType: 'image/jpeg' });

      uploadTask.on('state_changed', null, 
        (error: any) => { setUploadStatus("error"); },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          await updateDoc(docRef, { status: 'complete', downloadUrl: downloadUrl });
          const retrievalUrl = `${window.location.origin}/retrieve/${sessionId}`;
          setSoftCopyQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(retrievalUrl)}`);
          setUploadStatus("complete");
        }
      );
    } catch (error: any) {
      setUploadStatus("error");
    }
  }, []);

  const preSpoolPrintFile = useCallback(async () => {
    if (!selectedBlueprint || capturedPhotos.length === 0 || spoolingRef.current) return;
    
    setIsPreparingPrint(true);
    spoolingRef.current = true;

    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 1600;
      exportCanvas.height = 2400;
      const ctx = exportCanvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('Context Failed');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1600, 2400);

      const isStrip = selectedBlueprint.package === 50;
      const STRIP_W = isStrip ? 800 : 1600;

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Load Error'));
          img.src = src;
        });
      };

      const drawContent = async (offsetX: number) => {
        for (let i = 0; i < selectedBlueprint.slots.length; i++) {
          const slot = selectedBlueprint.slots[i];
          const photo = capturedPhotos[i];
          if (!photo) continue;
          const img = await loadImage(photo);
          if (selectedFilter.filter) ctx.filter = selectedFilter.filter;
          ctx.drawImage(img, (isStrip ? slot.x / 2 : slot.x) + offsetX, slot.y, isStrip ? slot.w / 2 : slot.w, slot.h);
          ctx.filter = 'none';
        }
        
        for (const s of [...placedStickers].sort((a, b) => a.zIndex - b.zIndex)) {
          const svgContainer = document.querySelector(`[data-sticker-id="${s.id}"]`);
          if (!svgContainer) continue;
          const svgElement = svgContainer.querySelector('svg');
          if (!svgElement) continue;
          const svgString = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
          const url = URL.createObjectURL(svgBlob);
          try {
            const stickerImg = await loadImage(url);
            const targetW = (s.size / 100) * STRIP_W;
            ctx.save();
            ctx.translate((s.x / 100) * STRIP_W + offsetX, (s.y / 100) * 2400);
            ctx.rotate((s.rotation * Math.PI) / 180);
            ctx.scale(s.flipX ? -1 : 1, s.flipY ? -1 : 1);
            ctx.drawImage(stickerImg, -targetW / 2, -targetW / 2, targetW, targetW);
            ctx.restore();
          } finally { URL.revokeObjectURL(url); }
        }

        const footerY = 2200;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(offsetX, footerY, STRIP_W, 200);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000000';
        ctx.font = `bold italic ${isStrip ? 28 : 40}px Inter, sans-serif`;
        ctx.fillText(`"${selectedQuote.text}"`, offsetX + (STRIP_W / 2), footerY + 80);
        ctx.textAlign = 'left';
        ctx.font = '900 24px Inter, sans-serif';
        ctx.fillText('JNL STUDIO', offsetX + 60, footerY + 180);
      };

      if (isStrip) { await drawContent(0); await drawContent(800); }
      else { await drawContent(0); }

      exportCanvas.toBlob((blob) => {
        if (blob) setPreparedBlob(blob);
        setIsPreparingPrint(false);
        spoolingRef.current = false;
      }, 'image/jpeg', 0.95);
    } catch (e: any) {
      KioskLogger.log('error', 'SESSION', 'Render Failed', 'FAILED', e.message);
      setIsPreparingPrint(false);
      spoolingRef.current = false;
    }
  }, [selectedBlueprint, capturedPhotos, selectedQuote, selectedFilter, placedStickers]);

  const addSticker = (type: string) => {
    const newSticker: PlacedSticker = { id: Math.random().toString(36).substring(7), type, x: 50, y: 50, size: 20, rotation: 0, zIndex: placedStickers.length + 100 };
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
    setPreparedBlob(null);
    setUploadStatus("idle");
    setSoftCopyQrUrl("");
    spoolingRef.current = false;
  }, []);

  const startShotSequence = async () => {
    const totalShots = packageSelected === 50 ? 3 : 6;
    const photos: string[] = capturedPhotos.length > 0 ? [...capturedPhotos] : [];
    setAppState("capturing");
    setIsCapturingReady(true);

    for (let i = (selectedRetakeIndex !== null ? selectedRetakeIndex : 0); i < (selectedRetakeIndex !== null ? selectedRetakeIndex + 1 : totalShots); i++) {
      setCurrentShotIndex(i);
      setCountdown(null);
      await new Promise(r => setTimeout(r, 200));
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(null);
      setIsProcessing(true);
      const shot = takePhoto();
      if (shot) {
        if (selectedRetakeIndex !== null) photos[i] = shot;
        else photos.push(shot);
        setCapturedPhotos([...photos]);
      }
      await new Promise(r => setTimeout(r, 300)); 
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
      return canvasRef.current.toDataURL('image/jpeg', 0.92);
    }
    return null;
  };

  useEffect(() => {
    if (appState === "final-preview" && !preparedBlob && !isPreparingPrint) {
      preSpoolPrintFile();
    }
  }, [appState, preSpoolPrintFile, preparedBlob, isPreparingPrint]);

  return (
    <KioskLayout>
      <iframe ref={printFrameRef} className="hidden" title="print-frame" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex-1 w-full h-full flex flex-col items-center overflow-hidden kiosk-container safe-area-spacing">
        
        <AdminAuthDialog isOpen={isAdminDialogOpen} onClose={() => setIsAdminDialogOpen(false)} onAuthSuccess={() => setIsOwnerMode(true)} />
        {isOwnerMode && (
          <AdminControls 
            currentStatus={appState}
            onJumpTo={setAppState}
            onReset={resetSession}
            onExitOwnerMode={() => setIsOwnerMode(false)}
            onSimulateCash={(amount) => setPaymentReceived(prev => prev + amount)}
            onMountUsb={setUsbHandle}
            onMountGallery={setGalleryHandle}
            usbHandle={usbHandle}
            galleryHandle={galleryHandle}
            runtimeStatus={{ printerReady: printFrameRef.current ? 'TRUE' : 'FALSE' }}
          />
        )}
        {isOwnerMode && <HealthMonitor usbMounted={!!usbHandle} galleryMounted={!!galleryHandle} />}
        
        {appState === "welcome" && (
          <div className="flex flex-col items-center w-full h-full animate-in fade-in duration-1000">
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div onClick={() => {
                setLogoTapCount(p => p + 1);
                if (logoTapCount >= 4) { setIsAdminDialogOpen(true); setLogoTapCount(0); }
              }}>
                <JnlLogo variant="hero" color="light" />
              </div>
            </div>
            <div className="w-full flex flex-col items-center pb-8">
              <div className="text-sm font-black uppercase text-white/60 mb-6 tracking-[0.3em] animate-pulse">INSERT ₱50 OR ₱100 BILL</div>
              <NeonButton onClick={() => { SessionStore.initDB().catch(()=>{}); setAppState("payment"); }} className="w-[35%] text-2xl py-10">TOUCH TO START</NeonButton>
            </div>
          </div>
        )}

        {appState === "payment" && (
          <div className="w-full max-w-2xl text-center flex flex-col items-center justify-center h-full px-6">
            <h2 className="font-headline font-black text-4xl mb-2 italic uppercase">WAITING ON INSERT OF MONEY</h2>
            <div className="bg-white/5 border-2 border-white/10 p-10 mb-8 w-full flex flex-col items-center justify-center">
               <div className="text-sm font-black uppercase text-white/40 mb-4 tracking-widest">{paymentReceived === 0 ? "INSERT BILL NOW" : "CASH DETECTED"}</div>
               <div className="text-6xl font-black italic text-primary">{paymentReceived} PHP</div>
            </div>
          </div>
        )}

        {appState === "package-selection" && (
          <div className="w-full h-full flex flex-col items-center justify-center px-6 gap-8">
            <h2 className="text-4xl font-headline font-black italic uppercase text-primary">CONFIRM PACKAGE</h2>
            <div className="flex justify-center w-full max-w-5xl">
              {paymentReceived >= 100 ? (
                <button onClick={() => { setPackageSelected(100); setAppState("setup"); }} className="group relative bg-white/5 border-4 border-primary p-10 flex flex-col items-center transition-all hover:bg-primary/5 active:scale-95 w-[420px]">
                  <span className="text-6xl font-black italic text-white mb-2">₱100</span>
                  <span className="text-lg font-bold uppercase text-primary">PREMIUM PORTRAIT</span>
                  <div className="mt-4 space-y-1 text-center text-xs font-bold uppercase text-white/60"><p>6 PHOTO SHOTS</p><p>4x6 SINGLE PORTRAIT</p><p>FULL FILTER LIBRARY</p></div>
                </button>
              ) : (
                <button onClick={() => { setPackageSelected(50); setAppState("setup"); }} className="group relative bg-white/5 border-4 border-primary p-10 flex flex-col items-center transition-all hover:bg-primary/5 active:scale-95 w-[420px]">
                  <span className="text-6xl font-black italic text-white mb-2">₱50</span>
                  <span className="text-lg font-bold uppercase text-primary">CLASSIC STRIP</span>
                  <div className="mt-4 space-y-1 text-center text-xs font-bold uppercase text-white/60"><p>3 PHOTO SHOTS</p><p>2x6 PHOTO STRIP</p><p>5 BEAUTY FILTERS</p></div>
                </button>
              )}
            </div>
          </div>
        )}

        {appState === "setup" && (
          <div className="w-full h-full max-w-[98%] flex flex-row gap-4 items-start py-2 px-2 overflow-hidden">
             <div className="flex-[0.4] space-y-3 pr-2 scrollbar-hide h-full pb-6">
                <div className="space-y-2">
                  <h2 className="font-headline font-black text-lg italic uppercase text-primary">Layout</h2>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BLUEPRINTS.filter(b => b.package === packageSelected).map(bp => (
                      <button key={bp.id} onClick={() => setSelectedBlueprint(bp)} className={cn("p-1.5 border-2 flex flex-col items-center bg-white/5 transition-all min-h-[110px]", selectedBlueprint?.id === bp.id ? "border-primary bg-primary/10" : "border-white/10")}>
                        <div className="flex-1 w-full relative mb-1"><BlueprintFrame blueprint={bp} photos={[]} isPreview className="!h-full !w-auto" /></div>
                        <span className="text-[6px] font-black uppercase italic text-center">{bp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="font-headline font-black text-lg italic uppercase text-primary">Filters</h2>
                  <div className="grid grid-cols-5 gap-1.5">
                    {FILTERS.slice(0, packageSelected === 50 ? 5 : FILTERS.length).map(f => (
                      <button key={f.id} onClick={() => setSelectedFilter(f)} className={cn("p-2 border-2 flex flex-col items-center justify-center bg-white/5 transition-all min-h-[50px]", selectedFilter.id === f.id ? "border-primary bg-primary/10" : "border-white/10")}>
                        <span className="text-[7px] font-black uppercase italic text-center leading-tight">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
             </div>
             <div className="flex-1 flex flex-col gap-3 h-full pb-4">
                <div className="relative flex-1 bg-zinc-900 border-4 border-white overflow-hidden shadow-2xl">
                   <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" style={{ filter: selectedFilter.filter }} />
                </div>
                <NeonButton disabled={!selectedBlueprint} onClick={() => startShotSequence()} className="w-full py-6 text-xl">START SESSION</NeonButton>
             </div>
          </div>
        )}

        {appState === "capturing" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
             <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" style={{ filter: selectedFilter.filter }} />
             {isCapturingReady && (
               <div className="absolute top-6 left-6 z-[120] bg-black/60 px-5 py-2 border border-primary backdrop-blur-md">
                  <span className="text-xl font-black italic uppercase text-primary">SHOT {currentShotIndex + 1} OF {packageSelected === 50 ? 3 : 6}</span>
               </div>
             )}
             {countdown !== null && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-[110]">
                 <span className="text-[20rem] font-black italic text-white animate-bounce drop-shadow-[0_0_50px_rgba(255,51,153,0.8)]">{countdown}</span>
               </div>
             )}
             {isProcessing && <div className="absolute inset-0 bg-white animate-pulse z-[130]" />}
          </div>
        )}

        {appState === "review" && (
          <div className="w-full h-full flex flex-row items-center justify-center gap-8 py-4 px-6">
            <div className="flex-1 h-[82vh] flex items-center justify-center">
              <div className="h-full aspect-[1600/2400] shadow-2xl relative border-4 border-white bg-white overflow-hidden">
                 {selectedBlueprint && <BlueprintFrame blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.filter} isPreview onSelectSlot={(idx) => setSelectedRetakeIndex(idx)} selectedSlotIndex={selectedRetakeIndex} />}
              </div>
            </div>
            <div className="w-80 space-y-3">
               <NeonButton onClick={() => setAppState("decorating")} className="w-full py-6 text-xl">DECORATE</NeonButton>
               <button onClick={() => selectedRetakeIndex !== null && startShotSequence()} disabled={selectedRetakeIndex === null} className={cn("w-full py-6 font-black uppercase italic border-2 flex items-center justify-center gap-3", selectedRetakeIndex !== null ? "bg-white text-black" : "bg-white/5 text-white/20")}><Target className="w-5 h-5" /> Retake Selection</button>
               <button onClick={() => { setCapturedPhotos([]); setAppState("setup"); }} className="w-full py-3 text-[9px] font-black uppercase italic border border-white/10 text-white/40">Retake All</button>
            </div>
          </div>
        )}

        {appState === "decorating" && (
          <div className="w-full flex flex-row gap-8 items-start py-6 px-6 h-full">
             <div className="flex-1 h-[82vh] flex items-center justify-center">
                <div className="h-full aspect-[1600/2400] relative border-4 border-white bg-white shadow-2xl overflow-hidden">
                  {selectedBlueprint && (
                    <BlueprintFrame 
                      blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.filter} quoteText={selectedQuote.text} stickers={placedStickers} selectedStickerId={selectedStickerId}
                      onUpdateSticker={(id, updates) => setPlacedStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))}
                      onRemoveSticker={(id) => { setPlacedStickers(prev => prev.filter(s => s.id !== id)); setSelectedStickerId(null); }}
                      onSelectSticker={setSelectedStickerId} isPreview 
                    />
                  )}
                </div>
             </div>
             <div className="w-[400px] space-y-6 h-[82vh] flex flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                   <div className="space-y-3">
                      <h3 className="text-[9px] font-black uppercase text-white/40 italic">Premium Stickers</h3>
                      <div className="grid grid-cols-5 gap-1.5">
                        {STICKER_DEFS.map(s => (
                          <button key={s.id} onClick={() => addSticker(s.id)} className="aspect-square bg-white/5 border border-white/10 p-1 flex items-center justify-center hover:border-primary transition-colors"><s.icon className={cn("w-full h-full", s.color)} /></button>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-[9px] font-black uppercase text-white/40 italic">Quotes</h3>
                      <div className="grid grid-cols-1 gap-1.5">
                        {QUOTES.map(q => (
                          <button key={q.id} onClick={() => setSelectedQuote(q)} className={cn("p-3 border-2 text-left transition-all", selectedQuote.id === q.id ? "border-primary bg-primary/10" : "border-white/10 bg-white/5")}><p className="text-[10px] font-bold italic">"{q.text}"</p></button>
                        ))}
                      </div>
                   </div>
                </div>
                <NeonButton onClick={() => setAppState("final-preview")} className="w-full py-8 text-xl">DONE</NeonButton>
             </div>
          </div>
        )}

        {appState === "final-preview" && (
          <div className="w-full h-full flex flex-col items-center justify-center py-4 px-6 space-y-4">
            <div className="flex-1 h-[82vh] flex items-center justify-center">
              <div className="h-full relative border-[10px] border-white bg-white shadow-2xl overflow-hidden" style={{ aspectRatio: packageSelected === 50 ? '800/2400' : '1600/2400' }}>
                {selectedBlueprint && <BlueprintFrame blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.filter} quoteText={selectedQuote.text} stickers={placedStickers} isPreview={true} />}
                {isPreparingPrint && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-[80]">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <span className="text-[9px] font-black uppercase italic text-primary">Finalizing...</span>
                  </div>
                )}
              </div>
            </div>
            <NeonButton 
              disabled={isPreparingPrint || !preparedBlob}
              onClick={() => {
                if (preparedBlob) {
                  const sessionId = `jnl_${Math.random().toString(36).substring(2, 12)}`;
                  setCurrentSessionId(sessionId);
                  dispatchToPrintSpooler(preparedBlob);
                  initiateBackgroundSaves(preparedBlob, sessionId);
                  handleCloudSync(preparedBlob, sessionId);
                }
                setAppState("printing");
              }} 
              className="w-full max-w-md py-6 text-xl"
            >
              PROCEED TO PRINT
            </NeonButton>
          </div>
        )}

        {appState === "printing" && (
          <div className="w-full h-full flex flex-row overflow-hidden relative">
             <div className="flex-1 flex flex-col items-center justify-center p-12 border-r border-white/10">
                <div className="text-center mb-8">
                   <h2 className="font-headline font-black text-6xl italic uppercase text-primary mb-4">Printing...</h2>
                   <div className="flex flex-col items-center justify-center gap-3">
                     <div className="flex items-center gap-2">
                        {uploadStatus === 'uploading' && <Loader2 className="w-4 h-4 text-white/40 animate-spin" />}
                        <p className={cn("font-bold uppercase tracking-[0.3em] text-sm italic", uploadStatus === 'error' ? "text-red-500" : "text-white/40")}>
                          {uploadStatus === 'idle' && "Initializing..."}
                          {uploadStatus === 'uploading' && "Syncing Soft Copy..."}
                          {uploadStatus === 'complete' && "Cloud Sync Complete"}
                          {uploadStatus === 'error' && "Offline Mode Active"}
                        </p>
                     </div>
                   </div>
                </div>
                <div className="w-full max-w-2xl"><Progress value={printProgress} className="h-8 bg-white/10 w-full" /></div>
             </div>

             <div className="w-[480px] bg-white/5 flex flex-col items-center justify-center p-10">
                {softCopyQrUrl ? (
                  <div className="animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center space-y-8">
                     <div className="text-center space-y-2">
                       <h3 className="text-3xl font-black italic uppercase text-primary">HD SOFT COPY</h3>
                       <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Expires in 10 minutes</p>
                     </div>
                     <div className="bg-white p-6 rounded-[3rem] shadow-2xl"><img src={softCopyQrUrl} alt="Scan" className="w-64 h-64" /></div>
                     <p className="text-xs font-bold uppercase text-white/40 text-center">Scan to save your high-res portrait</p>
                     {printProgress >= 100 && <button onClick={() => setAppState("thankyou")} className="w-full bg-primary py-8 text-2xl font-black uppercase italic rounded-3xl text-white">DONE</button>}
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-6 opacity-20"><Loader2 className="w-16 h-16 text-white animate-spin" /><span className="text-sm font-black uppercase italic tracking-widest">Preparing QR...</span></div>
                )}
             </div>

             {promoConsent === null && (
               <div className="absolute inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 backdrop-blur-md">
                 <div className="bg-zinc-950 border-4 border-primary p-12 flex flex-col items-center space-y-8 rounded-[4rem] w-full max-w-4xl shadow-2xl">
                   <div className="text-center space-y-4">
                     <h3 className="text-3xl font-black italic uppercase text-primary">📸 Moment Sharing</h3>
                     <p className="text-white text-lg font-bold">May JNL Studio share your moments on Facebook for promotion?</p>
                   </div>
                   <div className="grid grid-cols-2 gap-6 w-full pt-4">
                      <button onClick={() => setPromoConsent(true)} className="py-8 border-4 border-green-500 bg-green-500/10 text-green-500 text-2xl font-black italic uppercase rounded-3xl transition-all">✅ YES, I AGREE</button>
                      <button onClick={() => setPromoConsent(false)} className="py-8 border-4 border-red-500 bg-red-500/10 text-red-500 text-2xl font-black italic uppercase rounded-3xl transition-all">❌ NO, THANK YOU</button>
                   </div>
                 </div>
               </div>
             )}
          </div>
        )}

        {appState === "thankyou" && (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000 p-8 z-[500]">
             <div className="flex-1 flex flex-col items-center justify-center space-y-10 w-full max-w-4xl">
               <div className="text-center space-y-4">
                  <h2 className="font-headline font-black text-6xl italic uppercase text-primary leading-tight">THANK YOU</h2>
                  <p className="text-white/60 font-bold uppercase tracking-[0.4em] text-2xl">PLEASE COME AGAIN</p>
               </div>
               <div className="bg-white/5 border-2 border-white/10 p-10 rounded-[3rem] flex flex-col items-center space-y-6">
                  <div className="flex items-center gap-6"><h3 className="text-3xl font-black italic uppercase text-primary">FOLLOW US</h3></div>
                  <div className="bg-white p-6 rounded-[2rem]"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent("https://www.facebook.com/share/18vnB4a7gB/")}`} alt="FB" className="w-36 h-36" /></div>
                  <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Scan to follow JNL Studio on Facebook</p>
               </div>
               <NeonButton onClick={resetSession} className="px-20 !py-8 text-2xl rounded-2xl">BACK TO START</NeonButton>
             </div>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
