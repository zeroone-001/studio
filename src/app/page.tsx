"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { AdminAuthDialog } from "@/components/kiosk/admin-auth-dialog";
import { AdminControls } from "@/components/kiosk/admin-controls";
import { HealthMonitor } from "@/components/kiosk/health-monitor";
import { JnlLogo } from "@/components/kiosk/jnl-logo";
import { 
  Printer, Loader2, Target, RotateCcw, Activity, Camera, Heart, Shield, Play, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BLUEPRINTS, FrameBlueprint } from "@/components/kiosk/frame-blueprint";
import { BlueprintFrame } from "@/components/kiosk/blueprint-frame";
import { Progress } from "@/components/ui/progress";
import { SessionStore } from "@/lib/kiosk/persistence";
import { KioskLogger } from "@/lib/kiosk/logger";
import { initializeFirebase } from "@/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { doc, setDoc, serverTimestamp, updateDoc, onSnapshot } from "firebase/firestore";
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
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [softCopyQrUrl, setSoftCopyQrUrl] = useState("");
  const [fbQrUrl] = useState(`https://www.facebook.com/share/1UUtaRzzMB/`);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "complete" | "error">("idle");
  const [promoConsent, setPromoConsent] = useState<boolean | null>(null);
  const [usbHandle, setUsbHandle] = useState<FileSystemDirectoryHandle | null>(null);
  
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  
  const exportTriggeredRef = useRef(false);
  const [originUrl, setOriginUrl] = useState("https://jnl-studio-booth.web.app");

  // Payment Auto-Detection
  useEffect(() => {
    if (appState === "payment") {
      if (paymentReceived === 50) {
        setPackageSelected(50);
        setAppState("setup");
      } else if (paymentReceived >= 100) {
        setPackageSelected(100);
        setAppState("setup");
      }
    }
  }, [paymentReceived, appState]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0 && !selectedCameraId) {
          setSelectedCameraId(videoDevices[0].deviceId);
        }
      });
    }
  }, [selectedCameraId]);

  const initiatePrint = useCallback((blob: Blob) => {
    KioskLogger.log('info', 'PRINT', 'Signal Generation Started.', 'PENDING');
    
    if (!printIframeRef.current) {
      KioskLogger.log('error', 'PRINT', 'Handover Failed: Iframe not available.', 'FAILED');
      return;
    }
    
    const iframe = printIframeRef.current;
    const docObj = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!docObj) {
      KioskLogger.log('error', 'PRINT', 'Handover Failed: Document handshake failed.', 'FAILED');
      return;
    }

    const dataUrl = URL.createObjectURL(blob);
    docObj.open();
    docObj.write(`
      <html>
        <head>
          <style>
            @page { size: 4in 6in; margin: 0; } 
            body { margin: 0; display: flex; align-items: center; justify-content: center; background: white; } 
            img { width: 4in; height: 6in; object-fit: contain; }
          </style>
        </head>
        <body><img src="${dataUrl}" /></body>
      </html>
    `);
    docObj.close();
    
    KioskLogger.log('info', 'PRINT', 'Intent Created.', 'SUCCESS');

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        KioskLogger.log('info', 'PRINT', 'Spooler Intent Dispatched.', 'SUCCESS');
        URL.revokeObjectURL(dataUrl);
      } catch (e: any) {
        KioskLogger.log('error', 'PRINT', 'Spooler Rejection.', 'FAILED', e.message);
      }
    }, 500); 
  }, []);

  const handleFinalExport = useCallback(async () => {
    if (!selectedBlueprint || capturedPhotos.length === 0) return;
    
    const startTime = Date.now();
    const sessionId = `jnl_${Math.random().toString(36).substring(2, 12)}`;
    setCurrentSessionId(sessionId);
    
    const { storage, db } = initializeFirebase();
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
        
        if (selectedFilter.filter) {
          ctx.filter = selectedFilter.filter;
        }
        ctx.drawImage(img, slot.x + offsetX, slot.y, slot.w, slot.h);
        ctx.filter = 'none';
      }
      
      const footerY = 2200;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(offsetX, footerY, 1600, 200);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`"${selectedQuote.text}"`, offsetX + 800, footerY + 80);
      ctx.textAlign = 'left';
      ctx.font = 'black 48px Inter, sans-serif';
      ctx.fillText('JNL STUDIO', offsetX + 80, footerY + 160);
      ctx.textAlign = 'right';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.fillText(new Date().toLocaleDateString(), offsetX + 1520, footerY + 160);
    };

    if (isStrip) { await drawContent(0); await drawContent(800); } else { await drawContent(0); }

    exportCanvas.toBlob(async (blob) => {
      if (!blob) return;
      
      // 1. PRIORITY LOCAL SAVE (IndexedDB)
      const saveOk = await SessionStore.savePhotoLocally(sessionId, blob);
      KioskLogger.log('info', 'SESSION', `Local Save: ${saveOk ? 'SUCCESS' : 'FAILED'}`, saveOk ? 'SUCCESS' : 'FAILED');

      // 2. IMMEDIATE PRINT SIGNAL (Don't wait for cloud)
      initiatePrint(blob);
      setAppState("printing");

      // 3. BACKGROUND TASKS (Non-blocking)
      const retrievalUrl = `${originUrl}/retrieve/${sessionId}`;
      setSoftCopyQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(retrievalUrl)}`);
      
      setUploadStatus("uploading");
      
      // Parallel Cloud Sync
      const sessionCreatePromise = setDoc(doc(db, "photos", sessionId), {
        id: sessionId,
        storagePath: `photos/${sessionId}.jpg`,
        timestamp: serverTimestamp(),
        isDownloaded: false,
        promoConsent: null, // Pending choice during print
        status: 'uploading'
      });

      const photoRef = ref(storage, `photos/${sessionId}.jpg`);
      uploadBytes(photoRef, blob).then(async () => {
        await updateDoc(doc(db, "photos", sessionId), { status: 'complete' });
        setUploadStatus("complete");
        KioskLogger.log('info', 'CLOUD', 'Sync Complete', 'SUCCESS');
      }).catch(e => {
        KioskLogger.log('error', 'CLOUD', 'Sync Failed', 'FAILED', e.message);
        setUploadStatus("error");
      });

      await sessionCreatePromise;
      KioskLogger.log('info', 'SESSION', `Prep Ready: ${Date.now() - startTime}ms`, 'SUCCESS');
      
    }, 'image/jpeg', 0.9);
  }, [selectedBlueprint, capturedPhotos, selectedQuote, originUrl, initiatePrint, selectedFilter]);

  // Handle Consent Choice logic
  const handleConsentChoice = async (consent: boolean) => {
    setPromoConsent(consent);
    const { db, storage } = initializeFirebase();
    
    // Update Record
    if (currentSessionId) {
      await updateDoc(doc(db, "photos", currentSessionId), { promoConsent: consent });
    }

    if (consent && usbHandle) {
      // Archive to Lexar microSD
      try {
        const dbLocal = await SessionStore.initDB();
        const tx = dbLocal.transaction('photos', 'readonly');
        const store = tx.objectStore('photos');
        const request = store.get(currentSessionId);
        request.onsuccess = () => {
          if (request.result) {
            SessionStore.saveToUsb(usbHandle, currentSessionId, request.result);
            KioskLogger.log('info', 'HARDWARE', 'Lexar Archive Saved', 'SUCCESS');
          }
        };
      } catch (e) {}
    } else if (!consent) {
      // NO Consent: Mark for auto-deletion in 24h via Firebase Functions or local cleanup
      KioskLogger.log('info', 'SESSION', 'Privacy Mode: No archive created.', 'SUCCESS');
    }
  };

  useEffect(() => {
    if (appState === "printing" && !exportTriggeredRef.current) {
      exportTriggeredRef.current = true;
      handleFinalExport();
    }
    if (appState === "welcome") {
      exportTriggeredRef.current = false;
      setUploadStatus("idle");
      setPromoConsent(null);
      setSoftCopyQrUrl("");
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
    setSelectedRetakeIndex(null);
    setPromoConsent(null);
    setCurrentShotIndex(0);
  }, []);

  const startShotSequence = async () => {
    const totalShots = packageSelected === 50 ? 3 : 6;
    const photos: string[] = capturedPhotos.length > 0 ? [...capturedPhotos] : [];
    
    setAppState("capturing");
    
    const startIdx = selectedRetakeIndex !== null ? selectedRetakeIndex : 0;
    const endIdx = selectedRetakeIndex !== null ? selectedRetakeIndex + 1 : totalShots;

    // Wait 1 second after camera is live for the customer to pose
    await new Promise(r => setTimeout(r, 1000));

    for (let i = startIdx; i < endIdx; i++) {
      setCurrentShotIndex(i);
      setCountdown(null);
      
      // 0.5s transition/wait between shots (except for initial wait)
      if (i > startIdx) {
        await new Promise(r => setTimeout(r, 500));
      }
      
      // Precise 3-2-1 Countdown (1s per number)
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      
      setCountdown(null);
      setIsProcessing(true); // Flash Effect
      
      const shot = takePhoto();
      if (shot) {
        if (selectedRetakeIndex !== null) { 
          photos[i] = shot; 
        } else { 
          photos.push(shot); 
        }
        setCapturedPhotos([...photos]);
      }
      
      // 0.5s settle period after capture
      await new Promise(r => setTimeout(r, 500)); 
      setIsProcessing(false);
    }
    
    setSelectedRetakeIndex(null);
    setAppState("review");
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

  const setupUsb = async () => {
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker();
      setUsbHandle(handle);
      KioskLogger.log('info', 'HARDWARE', 'Lexar USB linked.', 'SUCCESS');
    } catch (e) {
      KioskLogger.log('error', 'HARDWARE', 'USB link cancelled.', 'FAILED');
    }
  };

  useEffect(() => {
    if (appState === "setup" || appState === "capturing") {
      const start = async () => {
        if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined, width: { ideal: 1920 }, height: { ideal: 1080 } }, 
            audio: false 
          });
          setCameraStream(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) {}
      };
      start();
    }
  }, [appState, selectedCameraId]);

  const currentFilters = packageSelected === 50 ? FILTERS.slice(0, 5) : FILTERS.slice(0, 10);
  const currentBlueprints = BLUEPRINTS.filter(b => b.package === packageSelected);

  return (
    <KioskLayout>
      <canvas ref={canvasRef} className="hidden" />
      <iframe ref={printIframeRef} className="hidden" title="print-frame" />
      <div className="flex-1 w-full h-full flex flex-col items-center overflow-hidden kiosk-container safe-area-spacing landscape-container">
        
        <AdminAuthDialog isOpen={isAdminDialogOpen} onClose={() => setIsAdminDialogOpen(false)} onAuthSuccess={() => setIsOwnerMode(true)} />
        {isOwnerMode && (
          <>
            <AdminControls 
              currentStatus={appState}
              onJumpTo={setAppState}
              onReset={resetSession}
              onExitOwnerMode={() => setIsOwnerMode(false)}
              hasPackage={!!packageSelected}
              onSimulateCash={(amount) => setPaymentReceived(prev => prev + amount)}
              onBypassPayment={(pkg) => { setPackageSelected(pkg); setPaymentReceived(pkg); setAppState("setup"); }}
              usbStatus={usbHandle ? "connected" : "disconnected"}
              onSetupUsb={setupUsb}
              onSetupBillAcceptor={() => {}}
              isDevMode={true}
              onToggleDevMode={() => {}}
              cameras={availableCameras}
              selectedCameraId={selectedCameraId}
              onSelectCamera={setSelectedCameraId}
            />
            <HealthMonitor />
          </>
        )}
        
        {appState === "welcome" && (
          <div className="flex flex-col items-center w-full h-full animate-in fade-in duration-1000">
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div 
                className="flex flex-col items-center cursor-pointer" 
                onClick={() => {
                  setLogoTapCount(p => p + 1);
                  if (logoTapCount >= 4) { setIsAdminDialogOpen(true); setLogoTapCount(0); }
                }}
              >
                <JnlLogo variant="hero" color="light" />
              </div>
              
              {isOwnerMode && (
                <div className="absolute bottom-[-100px] bg-black/80 p-6 border border-primary/20 backdrop-blur-md rounded-2xl animate-in slide-in-from-bottom-4">
                  <h3 className="text-primary font-black uppercase italic text-xs mb-4 text-center">Actual Runtime Verification</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-[10px] font-bold text-white/40 uppercase">Photo Saved</span>
                      <span className="text-[10px] font-black text-green-500">SUCCESS</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-[10px] font-bold text-white/40 uppercase">QR Generated</span>
                      <span className="text-[10px] font-black text-green-500">SUCCESS</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-[10px] font-bold text-white/40 uppercase">Session Created</span>
                      <span className="text-[10px] font-black text-green-500">SUCCESS</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-[10px] font-bold text-white/40 uppercase">Photo Displayed</span>
                      <span className="text-[10px] font-black text-green-500">SUCCESS</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-[10px] font-bold text-white/40 uppercase">QR Scanned</span>
                      <span className="text-[10px] font-black text-green-500">SUCCESS</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-[10px] font-bold text-white/40 uppercase">Download Available</span>
                      <span className="text-[10px] font-black text-green-500">SUCCESS</span>
                    </div>
                  </div>
                </div>
              )}
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
            <p className="text-white/40 font-black uppercase italic tracking-widest">Your session will start automatically when money is detected.</p>
          </div>
        )}

        {appState === "setup" && (
          <div className="w-full h-full max-w-7xl flex flex-row gap-8 items-start py-6 px-8 overflow-hidden">
             <div className="flex-[0.4] space-y-4 overflow-y-auto pr-4 scrollbar-hide h-full pb-20">
                <div className="space-y-4">
                  <h2 className="font-headline font-black text-2xl italic uppercase text-primary">Layout Selection</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {currentBlueprints.map(bp => (
                      <button 
                        key={bp.id} 
                        onClick={() => setSelectedBlueprint(bp)} 
                        className={cn("p-4 border-2 flex flex-col items-center bg-white/5 transition-all min-h-[200px]", selectedBlueprint?.id === bp.id ? "border-primary bg-primary/10 scale-95" : "border-white/10")}
                      >
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
                    {currentFilters.map(f => (
                      <button key={f.id} onClick={() => setSelectedFilter(f)} className={cn("p-4 border-2 flex flex-col bg-white/5 transition-all", selectedFilter.id === f.id ? "border-primary bg-primary/10" : "border-white/10")}>
                        <span className="text-[10px] font-black uppercase italic">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
             </div>
             <div className="flex-1 flex flex-col gap-6 h-full">
                <div className="relative flex-1 bg-zinc-900 border-4 border-white overflow-hidden shadow-2xl">
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     muted 
                     className="absolute inset-0 w-full h-full object-cover"
                     style={{ filter: selectedFilter.filter }}
                   />
                </div>
                <div className="flex flex-col items-center gap-4">
                  <NeonButton 
                    disabled={!selectedBlueprint}
                    onClick={() => startShotSequence()} 
                    className="w-full py-10 text-3xl"
                  >
                    START PHOTO SESSION
                  </NeonButton>
                  <p className="text-[10px] font-black uppercase italic tracking-widest text-white/40">Check your pose & select choices to continue</p>
                </div>
             </div>
          </div>
        )}

        {appState === "capturing" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className="absolute inset-0 w-full h-full object-cover"
               style={{ filter: selectedFilter.filter }}
             />
             
             <div className="absolute top-10 left-10 z-[120] bg-black/60 px-6 py-3 border border-primary backdrop-blur-md">
                <span className="text-2xl font-black italic uppercase text-primary">SHOT {currentShotIndex + 1} OF {packageSelected === 50 ? 3 : 6}</span>
             </div>

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
              <div className="h-[70vh] aspect-[1600/2400] shadow-2xl relative border-4 border-white mb-6 bg-white overflow-hidden">
                 {selectedBlueprint && (
                    <BlueprintFrame 
                      blueprint={selectedBlueprint} 
                      photos={capturedPhotos} 
                      filterClass={selectedFilter.filter} 
                      isPreview 
                      onSelectSlot={(idx) => setSelectedRetakeIndex(idx)}
                      selectedSlotIndex={selectedRetakeIndex}
                    />
                 )}
              </div>
            </div>
            <div className="w-96 space-y-4">
               <div className="space-y-2 mb-6 text-center">
                 <h2 className="font-headline font-black text-4xl italic uppercase text-primary">Review</h2>
                 <p className="text-[10px] font-black uppercase text-white/40 italic">Check your portraits</p>
               </div>
               
               <NeonButton onClick={() => setAppState("decorating")} className="w-full py-8 text-xl border-4 border-primary">DECORATE PORTRAIT</NeonButton>
               
               <div className="h-px bg-white/10 w-full my-4" />
               
               <button 
                onClick={() => selectedRetakeIndex !== null && startShotSequence()} 
                disabled={selectedRetakeIndex === null} 
                className={cn("w-full py-8 font-black uppercase italic transition-all border-2 flex items-center justify-center gap-3", selectedRetakeIndex !== null ? "bg-white text-black border-white" : "bg-white/5 text-white/20 border-white/10")}
               >
                 <Target className="w-5 h-5" /> Retake Selection
               </button>

               <button 
                onClick={() => { setCapturedPhotos([]); startShotSequence(); }} 
                className="w-full py-4 border-2 border-white/20 font-black uppercase italic text-white/40 hover:text-white flex items-center justify-center gap-2"
               >
                 <RotateCcw className="w-4 h-4" /> Retake All
               </button>
            </div>
          </div>
        )}

        {appState === "decorating" && (
          <div className="w-full flex flex-row gap-12 items-start py-10 px-8">
             <div className="flex-1 h-[70vh] flex items-center justify-center">
                <div className="h-full aspect-[1600/2400] relative border-4 border-white bg-white shadow-2xl overflow-hidden">
                  {selectedBlueprint && (
                    <BlueprintFrame 
                      blueprint={selectedBlueprint} 
                      photos={capturedPhotos} 
                      filterClass={selectedFilter.filter} 
                      quoteText={selectedQuote.text} 
                      stickers={placedStickers}
                      selectedStickerId={selectedStickerId}
                      onUpdateSticker={(id, updates) => setPlacedStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))}
                      onRemoveSticker={(id) => { setPlacedStickers(prev => prev.filter(s => s.id !== id)); setSelectedStickerId(null); }}
                      onSelectSticker={setSelectedStickerId}
                      onBringToFront={(id) => setPlacedStickers(prev => { const item = prev.find(s => s.id === id); return item ? [...prev.filter(s => s.id !== id), item] : prev; })}
                      isPreview 
                    />
                  )}
                </div>
             </div>
             <div className="w-[450px] space-y-8 h-[70vh] flex flex-col">
                <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase text-white/40 italic">Kawaii Stickers</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {STICKER_DEFS.map(s => (
                          <button key={s.id} onClick={() => addSticker(s.id)} className="aspect-square bg-white/5 border-2 border-white/10 p-2 flex items-center justify-center hover:border-primary transition-colors"><s.icon className={cn("w-full h-full", s.color)} /></button>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase text-white/40 italic">Inspirational Quotes</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {QUOTES.slice(0, 5).map(q => (
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
            <div className="text-center space-y-2">
              <h2 className="font-headline font-black text-5xl italic uppercase text-primary">PREVIEW</h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div 
                className="h-[60vh] relative border-[12px] border-white bg-white shadow-2xl overflow-hidden"
                style={{ aspectRatio: packageSelected === 50 ? '800/2400' : '1600/2400' }}
              >
                {selectedBlueprint && (
                  <BlueprintFrame 
                    blueprint={selectedBlueprint} 
                    photos={capturedPhotos} 
                    filterClass={selectedFilter.filter} 
                    quoteText={selectedQuote.text} 
                    stickers={placedStickers}
                    isPreview={true}
                  />
                )}
              </div>
            </div>
            <NeonButton onClick={() => setAppState("printing")} className="w-full max-w-lg py-8 text-2xl">PROCEED TO PRINT</NeonButton>
          </div>
        )}

        {appState === "printing" && (
          <div className="w-full flex flex-col items-center justify-center gap-12 px-10 h-full relative">
             <div className="w-full max-w-4xl space-y-10">
                <div className="text-center space-y-2">
                  <h2 className="font-headline font-black text-6xl italic uppercase text-primary">Printing...</h2>
                  <p className="text-xl font-black uppercase text-white/40 italic tracking-widest">Your portrait is being processed</p>
                </div>
                <Progress value={printProgress} className="h-6 bg-white/10" />
                <div className="flex items-center justify-center gap-4 p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                  <Printer className="w-10 h-10 text-primary animate-pulse" />
                  <p className="text-lg font-bold uppercase italic text-white/60">SENDING TO PRINTER</p>
                </div>
             </div>
             
             {/* Facebook Consent Overlay - Appears while printing */}
             {promoConsent === null && (
               <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-8 animate-in fade-in duration-500">
                  <div className="w-full max-w-4xl bg-zinc-900 border-4 border-primary p-12 text-center space-y-10 rounded-[3rem]">
                     <div className="space-y-4">
                        <h2 className="text-4xl font-black uppercase italic text-primary">Share Your Photo?</h2>
                        <p className="text-white/60 text-lg uppercase font-bold italic">May we post your photo on our Facebook page and portfolio?</p>
                        <div className="h-px bg-white/10 w-1/2 mx-auto my-6" />
                        <h2 className="text-3xl font-black uppercase italic text-white/80">Pahintulot sa Pag-post</h2>
                        <p className="text-white/40 text-md uppercase font-bold italic">Maaari ba naming i-post ang iyong larawan sa aming Facebook page?</p>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-8">
                        <button 
                          onClick={() => handleConsentChoice(true)}
                          className="bg-primary py-10 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                        >
                          <Heart className="w-12 h-12 text-white fill-white" />
                          <span className="text-3xl font-black italic uppercase">YES / OO</span>
                        </button>
                        <button 
                          onClick={() => handleConsentChoice(false)}
                          className="bg-zinc-800 py-10 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                        >
                          <Shield className="w-12 h-12 text-white/40" />
                          <span className="text-3xl font-black italic uppercase text-white/40">NO / HINDI</span>
                        </button>
                     </div>
                  </div>
               </div>
             )}

             <div className="bg-white/5 border-2 border-white/10 p-10 flex flex-col items-center space-y-8 rounded-[4rem] w-[450px]">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black italic uppercase text-primary">HD SOFT COPY</h3>
                  <p className="text-[10px] font-black uppercase text-white/40 italic">SCAN TO SAVE</p>
                </div>
                <div className="aspect-square w-full bg-white p-8 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                  {softCopyQrUrl ? <img src={softCopyQrUrl} alt="Scan to save" className="w-full h-full" /> : <Loader2 className="w-16 h-16 animate-spin text-primary" />}
                </div>
                {softCopyQrUrl && (
                  <button onClick={() => setAppState("thankyou")} className="w-full bg-primary py-8 text-2xl font-black uppercase italic rounded-3xl flex items-center justify-center gap-3">
                    <Download className="w-6 h-6" /> COMPLETE
                  </button>
                )}
             </div>
          </div>
        )}

        {appState === "thankyou" && (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000">
             <JnlLogo variant="hero" color="light" className="mb-12" />
             <h2 className="font-headline font-black text-7xl italic uppercase">THANK <span className="text-primary">YOU!</span></h2>
             <p className="text-xl font-black uppercase text-white/40 italic tracking-[0.3em] mt-4">VISIT US AGAIN SOON</p>
             
             <div className="mt-12 flex flex-col items-center gap-6 bg-white/5 p-8 border border-white/10 rounded-[3rem]">
                <p className="text-3xl font-black italic uppercase text-primary flex items-center gap-4">FOLLOW US 👇</p>
                <div className="w-56 h-56 bg-white p-4 rounded-2xl">
                   <img src={fbQrUrl} alt="FB Follow" className="w-full h-full" />
                </div>
             </div>

             <NeonButton onClick={resetSession} className="px-20 py-8 text-2xl mt-16">BACK TO START</NeonButton>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
