
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { AdminAuthDialog } from "@/components/kiosk/admin-auth-dialog";
import { AdminControls } from "@/components/kiosk/admin-controls";
import { HealthMonitor } from "@/components/kiosk/health-monitor";
import { JnlLogo } from "@/components/kiosk/jnl-logo";
import { 
  Printer, Loader2, Target, RotateCcw, Activity, Camera, Heart, Shield, Play, Download, CheckCircle2, AlertCircle
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
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "complete" | "error">("idle");
  const [promoConsent, setPromoConsent] = useState<boolean | null>(null);
  const [usbHandle, setUsbHandle] = useState<FileSystemDirectoryHandle | null>(null);
  
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [isCapturingReady, setIsCapturingReady] = useState(false);
  
  const exportTriggeredRef = useRef(false);
  const [originUrl, setOriginUrl] = useState("https://jnl-studio-booth.web.app");

  // Status indicators for Owner Mode
  const [runtimeStatus, setRuntimeStatus] = useState({
    photoSaved: 'PENDING',
    sessionCreated: 'PENDING',
    qrGenerated: 'PENDING',
    cloudSync: 'PENDING'
  });

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
    KioskLogger.log('info', 'PRINT', 'Spooler Handshake Initiated.', 'PENDING');
    
    if (!printIframeRef.current) {
      KioskLogger.log('error', 'PRINT', 'Handover Failed: Iframe element not found in DOM.', 'FAILED');
      return;
    }
    
    const iframe = printIframeRef.current;
    const docObj = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!docObj) {
      KioskLogger.log('error', 'PRINT', 'Handover Failed: Secure document handshake rejected.', 'FAILED');
      return;
    }

    const dataUrl = URL.createObjectURL(blob);
    docObj.open();
    docObj.write(`
      <html>
        <head>
          <style>
            @page { size: 4in 6in; margin: 0; } 
            body { margin: 0; display: flex; align-items: center; justify-content: center; background: white; width: 100vw; height: 100vh; overflow: hidden; } 
            img { width: 100%; height: 100%; object-fit: contain; image-rendering: high-quality; }
          </style>
        </head>
        <body><img src="${dataUrl}" /></body>
      </html>
    `);
    docObj.close();
    
    // ANDROID-SPECIFIC FOCUS LOCK
    KioskLogger.log('info', 'PRINT', 'Document Loaded. Dispatching Spooler Intent...', 'PENDING');

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        // Trigger print from the window object to ensure NokoPrint/System intercept
        iframe.contentWindow?.print();
        KioskLogger.log('info', 'PRINT', 'Spooler Intent Dispatched successfully.', 'SUCCESS');
        URL.revokeObjectURL(dataUrl);
      } catch (e: any) {
        KioskLogger.log('error', 'PRINT', 'Android Spooler Rejection: Check Chrome permissions.', 'FAILED', e.message);
      }
    }, 1500); // 1.5s delay to ensure full DOM layout before NokoPrint scan
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

        if (selectedFilter.filter) {
          ctx.filter = selectedFilter.filter;
        }
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

      // TYPOGRAPHY SCALED TO FIT LAYOUT
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.fillText(`"${selectedQuote.text}"`, offsetX + (STRIP_W / 2), footerY + 90);
      
      ctx.textAlign = 'left';
      ctx.font = '900 24px Inter, sans-serif';
      ctx.fillText('JNL STUDIO', offsetX + 60, footerY + 180);
      
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText(new Date().toLocaleDateString(), offsetX + STRIP_W - 60, footerY + 180);
    };

    if (isStrip) { await drawContent(0); await drawContent(800); } else { await drawContent(0); }

    exportCanvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const saveOk = await SessionStore.savePhotoLocally(sessionId, blob);
      setRuntimeStatus(prev => ({ ...prev, photoSaved: saveOk ? 'SUCCESS' : 'FAILED' }));

      // HIGH PRIORITY: Start Printing immediately after local save
      initiatePrint(blob);
      setAppState("printing");

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

      setDoc(docRef, sessionData)
        .then(() => {
          setRuntimeStatus(prev => ({ ...prev, sessionCreated: 'SUCCESS' }));
          const retrievalUrl = `${originUrl}/retrieve/${sessionId}`;
          setSoftCopyQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(retrievalUrl)}`);
          setRuntimeStatus(prev => ({ ...prev, qrGenerated: 'SUCCESS' }));

          // BACKGROUND SYNC: Cloud upload happens while user interacts with screen
          const photoRef = ref(storage, `photos/${sessionId}.jpg`);
          uploadBytes(photoRef, blob).then(async () => {
            await updateDoc(docRef, { status: 'complete' });
            setUploadStatus("complete");
            setRuntimeStatus(prev => ({ ...prev, cloudSync: 'SUCCESS' }));
          }).catch(e => {
            setUploadStatus("error");
            setRuntimeStatus(prev => ({ ...prev, cloudSync: 'FAILED' }));
          });
        })
        .catch(async (e) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'create',
            requestResourceData: sessionData
          });
          errorEmitter.emit('permission-error', permissionError);
          setRuntimeStatus(prev => ({ ...prev, sessionCreated: 'FAILED' }));
        });
      
    }, 'image/jpeg', 0.95);
  }, [selectedBlueprint, capturedPhotos, selectedQuote, originUrl, initiatePrint, selectedFilter, placedStickers]);

  const addSticker = (type: string) => {
    const newSticker: PlacedSticker = {
      id: Math.random().toString(36).substring(7),
      type,
      x: 50,
      y: 50,
      size: 20,
      rotation: 0,
      zIndex: placedStickers.length + 100,
      flipX: false,
      flipY: false
    };
    setPlacedStickers([...placedStickers, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleDuplicateSticker = (sticker: PlacedSticker) => {
    const newSticker: PlacedSticker = {
      ...sticker,
      id: Math.random().toString(36).substring(7),
      x: sticker.x + 5,
      y: sticker.y + 5,
      zIndex: Math.max(...placedStickers.map(s => s.zIndex)) + 1
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
    setRuntimeStatus({
      photoSaved: 'PENDING',
      sessionCreated: 'PENDING',
      qrGenerated: 'PENDING',
      cloudSync: 'PENDING'
    });
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
      
      // POSE PERIOD: Give customer time to see themselves before countdown starts
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
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.95);
    }
    return null;
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

  const handleMountUsb = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setUsbHandle(handle);
      KioskLogger.log('info', 'HARDWARE', 'Lexar USB Mount Successful.', 'SUCCESS');
    } catch (e: any) {
      KioskLogger.log('error', 'HARDWARE', 'Lexar USB Mount Canceled or Failed.', 'FAILED', e.message);
    }
  };

  return (
    <KioskLayout>
      <canvas ref={canvasRef} className="hidden" />
      {/* 
        PRINT HANDSHAKE BRIDGE:
        The iframe must be part of the active DOM for window.print() to work on Android Chrome.
        We use opacity and absolute positioning instead of display:none to keep it "visible" to the engine.
      */}
      <iframe 
        ref={printIframeRef} 
        className="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none z-[-1]" 
        title="print-frame" 
      />
      
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
              onSetupUsb={handleMountUsb}
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
                <div className="absolute top-[120%] bg-black/80 p-6 border border-primary/20 backdrop-blur-md rounded-2xl animate-in slide-in-from-bottom-4 w-[320px]">
                  <h3 className="text-primary font-black uppercase italic text-xs mb-4 text-center">Actual Runtime Verification</h3>
                  <div className="grid grid-cols-1 gap-y-3">
                    {Object.entries(runtimeStatus).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className={cn("text-[10px] font-black italic", val === 'SUCCESS' ? "text-green-500" : val === 'FAILED' ? "text-red-500" : "text-white/20")}>{val}</span>
                      </div>
                    ))}
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
          </div>
        )}

        {appState === "setup" && (
          <div className="w-full h-full max-w-7xl flex flex-row gap-8 items-start py-6 px-8 overflow-hidden">
             <div className="flex-[0.4] space-y-4 overflow-y-auto pr-4 scrollbar-hide h-full pb-20">
                <div className="space-y-4">
                  <h2 className="font-headline font-black text-2xl italic uppercase text-primary">Layout Selection</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {BLUEPRINTS.filter(b => b.package === packageSelected).map(bp => (
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
                    {FILTERS.map(f => (
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
                <NeonButton disabled={!selectedBlueprint} onClick={() => startShotSequence()} className="w-full py-10 text-3xl">START PHOTO SESSION</NeonButton>
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
               <NeonButton onClick={() => setAppState("decorating")} className="w-full py-8 text-xl border-4 border-primary">DECORATE PORTRAIT</NeonButton>
               <button 
                onClick={() => selectedRetakeIndex !== null && startShotSequence()} 
                disabled={selectedRetakeIndex === null} 
                className={cn("w-full py-8 font-black uppercase italic transition-all border-2 flex items-center justify-center gap-3", selectedRetakeIndex !== null ? "bg-white text-black border-white" : "bg-white/5 text-white/20 border-white/10")}
               >
                 <Target className="w-5 h-5" /> Retake Selection
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
                      onSendToBack={(id) => setPlacedStickers(prev => { const item = prev.find(s => s.id === id); return item ? [item, ...prev.filter(s => s.id !== id)] : prev; })}
                      onDuplicateSticker={handleDuplicateSticker}
                      isPreview 
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
            <NeonButton onClick={() => setAppState("printing")} className="w-full max-lg py-8 text-2xl">PROCEED TO PRINT</NeonButton>
          </div>
        )}

        {appState === "printing" && (
          <div className="w-full flex flex-col items-center justify-center gap-12 px-10 h-full relative">
             <div className="w-full max-w-4xl space-y-10 text-center">
                <h2 className="font-headline font-black text-6xl italic uppercase text-primary">Printing...</h2>
                <Progress value={printProgress} className="h-6 bg-white/10" />
             </div>

             {/* ENHANCED FACEBOOK CONSENT DIALOG */}
             {promoConsent === null && (
               <div className="bg-black/90 border-4 border-primary p-16 flex flex-col items-center space-y-12 rounded-[5rem] w-full max-w-4xl shadow-[0_0_80px_rgba(255,51,153,0.5)] animate-in zoom-in-95 z-[150]">
                 <div className="space-y-8 text-center">
                   <div className="space-y-4">
                     <h3 className="text-5xl font-black italic uppercase text-primary tracking-tight">Share Your Photo?</h3>
                     <p className="text-white text-xl font-bold uppercase tracking-wide">May we post your photo on our Facebook page and portfolio?</p>
                   </div>
                   <div className="pt-8 border-t-2 border-white/10 space-y-4">
                     <p className="text-white/60 text-lg font-black italic uppercase tracking-wider">Maaari ba naming i-post ang iyong larawan sa aming Facebook page at portfolio?</p>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-8 w-full">
                    <button onClick={() => setPromoConsent(true)} className="py-10 border-4 border-green-500 bg-green-500/20 text-green-500 text-3xl font-black italic uppercase rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-95">
                      <CheckCircle2 className="w-10 h-10" /> YES / OO
                    </button>
                    <button onClick={() => setPromoConsent(false)} className="py-10 border-4 border-red-500 bg-red-500/20 text-red-500 text-3xl font-black italic uppercase rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-95">
                      <AlertCircle className="w-10 h-10" /> NO / HINDI
                    </button>
                 </div>
               </div>
             )}

             {promoConsent !== null && softCopyQrUrl && (
               <div className="bg-white/5 border-2 border-white/10 p-10 flex flex-col items-center space-y-8 rounded-[4rem] w-[450px]">
                 <h3 className="text-3xl font-black italic uppercase text-primary">HD SOFT COPY</h3>
                 <div className="aspect-square w-full bg-white p-8 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                   <img src={softCopyQrUrl} alt="Scan to save" className="w-full h-full" />
                 </div>
                 <button onClick={() => setAppState("thankyou")} className="w-full bg-primary py-8 text-2xl font-black uppercase italic rounded-3xl">COMPLETE</button>
               </div>
             )}
          </div>
        )}

        {appState === "thankyou" && (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000">
             <h2 className="font-headline font-black text-7xl italic uppercase">THANK <span className="text-primary">YOU!</span></h2>
             <NeonButton onClick={resetSession} className="px-20 py-8 text-2xl mt-16">BACK TO START</NeonButton>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
