
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

  // Payment Auto-Detection Logic
  useEffect(() => {
    if (appState === "payment") {
      if (paymentReceived === 50) {
        setPackageSelected(50);
        setAppState("setup");
        KioskLogger.log('info', 'SESSION', '₱50 Bill Detected. Auto-starting Package 1.', 'SUCCESS');
      } else if (paymentReceived >= 100) {
        setPackageSelected(100);
        setAppState("setup");
        KioskLogger.log('info', 'SESSION', '₱100 Bill Detected. Auto-starting Package 2.', 'SUCCESS');
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

  // Privacy Auto-Delete Listener
  useEffect(() => {
    if (currentSessionId && promoConsent === false && uploadStatus === 'complete') {
      const { db } = initializeFirebase();
      const unsub = onSnapshot(doc(db, "photos", currentSessionId), (docSnap) => {
        const data = docSnap.data();
        if (data?.isDownloaded === true) {
          KioskLogger.log('info', 'SESSION', `Privacy Purge Triggered for ${currentSessionId}.`, 'SUCCESS');
          SessionStore.cleanupSession(currentSessionId).then(() => {
            KioskLogger.log('info', 'SESSION', 'Private photo deleted from local storage.', 'SUCCESS');
          });
          unsub();
        }
      });
      return () => unsub();
    }
  }, [currentSessionId, promoConsent, uploadStatus]);

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
    
    KioskLogger.log('info', 'PRINT', 'Print Request Generated & Intent Created.', 'SUCCESS');

    // Android focus handshake pattern
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        KioskLogger.log('info', 'PRINT', 'Android Print Intent Sent (Handoff to NokoPrint).', 'SUCCESS');
        URL.revokeObjectURL(dataUrl);
      } catch (e: any) {
        KioskLogger.log('error', 'PRINT', 'Android Spooler Rejection.', 'FAILED', e.message);
      }
    }, 1000); 
  }, []);

  const handleFinalExport = useCallback(async () => {
    if (!selectedBlueprint || capturedPhotos.length === 0) return;
    
    // Performance Optimization: Start measurements
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
      
      // SPEED OPTIMIZATION: Parallelize Local Save, Session Create, and QR Generation
      const photoSavePromise = SessionStore.savePhotoLocally(sessionId, blob);
      
      const sessionCreatePromise = setDoc(doc(db, "photos", sessionId), {
        id: sessionId,
        storagePath: `photos/${sessionId}.jpg`,
        timestamp: serverTimestamp(),
        isDownloaded: false,
        promoConsent: promoConsent,
        status: 'uploading'
      });

      // INSTANT QR: No need to wait for upload completion
      const retrievalUrl = `${originUrl}/retrieve/${sessionId}`;
      setSoftCopyQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(retrievalUrl)}`);
      
      // Start printing signal immediately
      initiatePrint(blob);

      // Background Upload & Logging
      const photoRef = ref(storage, `photos/${sessionId}.jpg`);
      setUploadStatus("uploading");
      
      uploadBytes(photoRef, blob).then(async () => {
        await updateDoc(doc(db, "photos", sessionId), { status: 'complete' });
        setUploadStatus("complete");
        KioskLogger.log('info', 'CLOUD', 'HD Cloud Sync = SUCCESS', 'SUCCESS');
      }).catch(e => {
        KioskLogger.log('error', 'CLOUD', 'HD Cloud Sync = FAILED', 'FAILED', e.message);
        setUploadStatus("error");
      });

      // Wait for essential local tasks for diagnostic logging
      const [saveOk] = await Promise.all([photoSavePromise, sessionCreatePromise]);
      
      KioskLogger.log('info', 'SESSION', `Photo Saved = ${saveOk ? 'SUCCESS' : 'FAILED'} in ${Date.now() - startTime}ms`, saveOk ? 'SUCCESS' : 'FAILED');
      KioskLogger.log('info', 'SESSION', 'Session Created = SUCCESS', 'SUCCESS');
      KioskLogger.log('info', 'QR', 'QR Generated = SUCCESS', 'SUCCESS');

      if (promoConsent && usbHandle) {
        SessionStore.saveToUsb(usbHandle, sessionId, blob);
      }
      
    }, 'image/jpeg', 0.9);
  }, [selectedBlueprint, capturedPhotos, selectedQuote, originUrl, initiatePrint, promoConsent, usbHandle, selectedFilter]);

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

    for (let i = startIdx; i < endIdx; i++) {
      setCurrentShotIndex(i);
      
      // 1. POSE PERIOD (2 SECONDS) - No countdown visible yet
      setCountdown(null);
      await new Promise(r => setTimeout(r, 2000));
      
      // 2. COUNTDOWN (3 SECONDS)
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      
      setCountdown(null);
      setIsProcessing(true);
      
      const shot = takePhoto();
      if (shot) {
        if (selectedRetakeIndex !== null) {
          photos[i] = shot;
        } else {
          photos.push(shot);
        }
        setCapturedPhotos([...photos]);
      }
      
      await new Promise(r => setTimeout(r, 800)); 
      setIsProcessing(false);
      
      if (i < endIdx - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
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

  const addSticker = (type: string) => {
    const newSticker: PlacedSticker = {
      id: Math.random().toString(36).substring(7),
      type,
      x: 50,
      y: 40,
      size: 15,
      rotation: 0
    };
    setPlacedStickers([...placedStickers, newSticker]);
    setSelectedStickerId(newSticker.id);
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

  const getLogStatus = (module: string, messagePart: string) => {
    const logs = KioskLogger.getLogs();
    const entry = logs.find(l => l.module === module && l.message.includes(messagePart));
    return entry ? entry.status : "PENDING";
  };

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
                <div className="absolute top-4 left-4 bg-black/80 border border-primary p-6 rounded-[2rem] space-y-3 z-[100] animate-in slide-in-from-left-4 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-2 border-b border-white/20 pb-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Owner Diagnostics</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 text-[9px] font-bold uppercase italic tracking-tighter">
                    <div className="flex justify-between gap-6"><span>Photo Saved =</span> <span className={cn(getLogStatus('SESSION', 'Photo Saved') === 'SUCCESS' ? "text-green-500" : "text-white/40")}>{getLogStatus('SESSION', 'Photo Saved')}</span></div>
                    <div className="flex justify-between gap-6"><span>Session Created =</span> <span className={cn(getLogStatus('SESSION', 'Session Created') === 'SUCCESS' ? "text-green-500" : "text-white/40")}>{getLogStatus('SESSION', 'Session Created')}</span></div>
                    <div className="flex justify-between gap-6"><span>QR Generated =</span> <span className={cn(getLogStatus('QR', 'QR Generated') === 'SUCCESS' ? "text-green-500" : "text-white/40")}>{getLogStatus('QR', 'QR Generated')}</span></div>
                    <div className="flex justify-between gap-6"><span>QR Scanned =</span> <span className={cn(getLogStatus('QR', 'Retrieval page opened') === 'SUCCESS' ? "text-green-500" : "text-white/40")}>{getLogStatus('QR', 'Retrieval page opened')}</span></div>
                    <div className="flex justify-between gap-6"><span>Photo Displayed =</span> <span className={cn(getLogStatus('QR', 'Photo Displayed') === 'SUCCESS' ? "text-green-500" : "text-white/40")}>{getLogStatus('QR', 'Photo Displayed')}</span></div>
                    <div className="flex justify-between gap-6"><span>Download Available =</span> <span className={cn(getLogStatus('QR', 'Download Available') === 'SUCCESS' ? "text-green-500" : "text-white/40")}>{getLogStatus('QR', 'Download Available')}</span></div>
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
                    NEXT
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
              <p className="text-[10px] font-black uppercase text-white/40 italic tracking-widest">Tap a photo slot to select for partial retake</p>
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
                className={cn(
                  "w-full py-8 font-black uppercase italic transition-all border-2 flex items-center justify-center gap-3",
                  selectedRetakeIndex !== null 
                    ? "bg-white text-black border-white hover:scale-105" 
                    : "bg-white/5 text-white/20 border-white/10 opacity-50"
                )}
               >
                 <Target className="w-5 h-5" /> {selectedRetakeIndex !== null ? `Retake Selected Photo` : "Select Slot to Retake"}
               </button>

               <button 
                onClick={() => { setSelectedRetakeIndex(null); setCapturedPhotos([]); startShotSequence(); }} 
                className="w-full py-4 border-2 border-white/20 font-black uppercase italic text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2"
               >
                 <RotateCcw className="w-4 h-4" /> Retake All Photos
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
                          <button key={s.id} onClick={() => addSticker(s.id)} className="aspect-square bg-white/5 border-2 border-white/10 p-2 flex items-center justify-center hover:border-primary transition-colors active:scale-90"><s.icon className={cn("w-full h-full", s.color)} /></button>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase text-white/40 italic">Short Inspirational Quotes</h3>
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
            <div className="text-center space-y-2">
              <h2 className="font-headline font-black text-5xl italic uppercase text-primary">FINAL LAYOUT PREVIEW</h2>
              <p className="text-white/40 font-black uppercase italic tracking-widest">Ready to print your moment?</p>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <div 
                className="h-[60vh] relative border-[12px] border-white bg-white shadow-[0_0_80px_rgba(255,51,153,0.3)] overflow-hidden"
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

            <div className="flex gap-4 w-full max-w-2xl">
              <button 
                onClick={() => setAppState("decorating")} 
                className="flex-1 py-8 border-2 border-white/20 font-black uppercase italic text-white/60 hover:text-white transition-colors"
              >
                BACK TO EDITOR
              </button>
              <NeonButton onClick={() => setAppState("consent")} className="flex-[2] py-8 text-2xl">PROCEED TO PRINT</NeonButton>
            </div>
          </div>
        )}

        {appState === "consent" && (
          <div className="w-full max-w-4xl flex flex-col items-center justify-center h-full px-6 space-y-12 animate-in fade-in zoom-in duration-500">
             <div className="text-center space-y-6">
                <h2 className="font-headline font-black text-6xl italic uppercase leading-tight flex items-center justify-center gap-4">
                  <Camera className="w-12 h-12 text-primary" /> 📸 PHOTO CONSENT
                </h2>
                <div className="space-y-4">
                  <p className="text-white/90 font-black uppercase italic tracking-widest text-2xl">
                    May we feature your photo on JNL Studio's Facebook Page?
                  </p>
                  <p className="text-white/60 font-bold italic text-lg">
                    Maaari ba naming gamitin ang inyong larawan para sa pag-promote ng JNL Studio sa Facebook Page?
                  </p>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-8 w-full">
                <button 
                  onClick={() => { setPromoConsent(true); setAppState("printing"); }}
                  className="group relative flex flex-col items-center justify-center bg-primary border-4 border-primary/20 p-12 hover:bg-primary/90 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,51,153,0.4)]"
                >
                  <Heart className="w-20 h-20 text-white mb-4 group-hover:scale-110 transition-transform fill-white" />
                  <span className="text-5xl font-black italic uppercase text-white">🩷 YES, I AGREE</span>
                  <span className="text-[10px] font-black uppercase text-white/60 mt-2">SHARE MY MOMENT</span>
                </button>
                
                <button 
                  onClick={() => { setPromoConsent(false); setAppState("printing"); }}
                  className="group relative flex flex-col items-center justify-center bg-black border-4 border-white/10 p-12 hover:bg-zinc-900 transition-all active:scale-95"
                >
                  <Shield className="w-20 h-20 text-white/40 mb-4 group-hover:scale-110 transition-transform" />
                  <span className="text-5xl font-black italic uppercase text-white">⚫ NO, KEEP PRIVATE</span>
                  <span className="text-[10px] font-black uppercase text-white/40 mt-2">KEEP MY PHOTO PRIVATE</span>
                </button>
             </div>
          </div>
        )}

        {appState === "printing" && (
          <div className="w-full flex flex-col items-center justify-center gap-12 px-10 h-full">
             <div className="w-full max-w-4xl space-y-10">
                <div className="text-center space-y-2">
                  <h2 className="font-headline font-black text-6xl italic uppercase text-primary">Printing...</h2>
                  <p className="text-xl font-black uppercase text-white/40 italic tracking-widest">Your portrait is being processed</p>
                </div>
                <Progress value={printProgress} className="h-6 bg-white/10" />
                <div className="flex items-center justify-center gap-4 p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                  <Printer className="w-10 h-10 text-primary animate-pulse" />
                  <p className="text-lg font-bold uppercase italic text-white/60">SENDING DATA TO THERMAL PRINTER via NOKOPRINT</p>
                </div>
             </div>
             
             <div className="bg-white/5 border-2 border-white/10 p-10 flex flex-col items-center space-y-8 rounded-[4rem] w-[450px] shadow-[0_0_80px_rgba(255,51,153,0.2)]">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black italic uppercase text-primary">HD SOFT COPY</h3>
                  <p className="text-[10px] font-black uppercase text-white/40 italic">SCAN TO SAVE TO YOUR PHONE</p>
                </div>
                <div className="aspect-square w-full bg-white p-8 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                  {softCopyQrUrl ? <img src={softCopyQrUrl} alt="Scan to save" className="w-full h-full" /> : <Loader2 className="w-16 h-16 animate-spin text-primary" />}
                </div>
                
                {softCopyQrUrl && (
                  <button onClick={() => setAppState("thankyou")} className="w-full bg-primary py-8 text-2xl font-black uppercase italic rounded-3xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3">
                    <Download className="w-6 h-6" /> COMPLETE SESSION
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
                <p className="text-3xl font-black italic uppercase text-primary flex items-center gap-4">
                   FOLLOW US 👇
                </p>
                <div className="w-56 h-56 bg-white p-4 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.4)]">
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
