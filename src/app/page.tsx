"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { AdminAuthDialog } from "@/components/kiosk/admin-auth-dialog";
import { AdminControls } from "@/components/kiosk/admin-controls";
import { HealthMonitor } from "@/components/kiosk/health-monitor";
import { JnlLogo } from "@/components/kiosk/jnl-logo";
import { 
  Printer, Loader2, Download, CheckCircle2, AlertCircle, 
  RotateCcw, Camera, Target, Trash2, Layers, Maximize2, RotateCw, X
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
  const exportTriggeredRef = useRef(false);

  const [originUrl, setOriginUrl] = useState("https://jnl-studio-booth.web.app");

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
    KioskLogger.log('info', 'PRINT', 'Handing over portrait to printer system.', 'PENDING');
    if (!printIframeRef.current) return;
    const iframe = printIframeRef.current;
    const docObj = iframe.contentDocument || iframe.contentWindow?.document;
    if (!docObj) return;

    const dataUrl = URL.createObjectURL(blob);
    docObj.open();
    docObj.write(`
      <html>
        <head>
          <style>@page { size: 4in 6in; margin: 0; } body { margin: 0; display: flex; align-items: center; justify-content: center; background: white; } img { width: 4in; height: 6in; object-fit: contain; }</style>
        </head>
        <body><img src="${dataUrl}" /></body>
      </html>
    `);
    docObj.close();
    
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        URL.revokeObjectURL(dataUrl);
        KioskLogger.log('info', 'PRINT', 'System print signal sent.', 'SUCCESS');
      } catch (e: any) {
        KioskLogger.log('error', 'PRINT', 'System print failed.', 'FAILED', e.message);
      }
    }, 1000);
  }, []);

  const handleFinalExport = useCallback(async () => {
    if (!selectedBlueprint || capturedPhotos.length === 0) return;
    const sessionId = `jnl_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`;
    setCurrentSessionId(sessionId);

    const retrievalUrl = `${originUrl}/retrieve/${sessionId}`;
    setSoftCopyQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(retrievalUrl)}`);
    
    const { storage, db } = initializeFirebase();
    setDoc(doc(db, "photos", sessionId), {
      id: sessionId,
      storagePath: `photos/${sessionId}.jpg`,
      timestamp: serverTimestamp(),
      isDownloaded: false,
      status: 'uploading'
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
      await SessionStore.savePhotoLocally(sessionId, blob);
      initiatePrint(blob); 
      setUploadStatus("uploading");
      const photoRef = ref(storage, `photos/${sessionId}.jpg`);
      uploadBytes(photoRef, blob).then(() => {
        updateDoc(doc(db, "photos", sessionId), { status: 'complete' });
        setUploadStatus("complete");
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
    setSelectedRetakeIndex(null);
  }, []);

  const startShotSequence = async () => {
    const totalShots = packageSelected === 50 ? 3 : 6;
    const photos: string[] = [];
    if (!selectedBlueprint) {
      const defaultBp = BLUEPRINTS.find(b => b.package === packageSelected);
      if (defaultBp) setSelectedBlueprint(defaultBp);
    }
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
      if (shot) { photos.push(shot); setCapturedPhotos([...photos]); }
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

  useEffect(() => {
    if (appState === "setup" || appState === "capturing" || appState === "test-camera") {
      const start = async () => {
        if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined, width: { ideal: 1280 }, height: { ideal: 720 } }, 
            audio: false 
          });
          setCameraStream(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) {}
      };
      start();
    }
  }, [appState, selectedCameraId]);

  const currentFilters = packageSelected === 50 ? FILTERS.slice(0, 5) : FILTERS;
  const currentBlueprints = BLUEPRINTS.filter(b => b.package === packageSelected);

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
            usbStatus={"disconnected"}
            onSetupUsb={() => {}}
            onSetupBillAcceptor={() => {}}
            isDevMode={true}
            onToggleDevMode={() => {}}
            cameras={availableCameras}
            selectedCameraId={selectedCameraId}
            onSelectCamera={setSelectedCameraId}
          />
        )}
        {isOwnerMode && <HealthMonitor />}

        {appState === "welcome" && (
          <div className="flex flex-col items-center w-full h-full animate-in fade-in duration-1000">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div 
                className="flex flex-col items-center cursor-pointer" 
                onClick={() => {
                  setLogoTapCount(p => p + 1);
                  if (logoTapCount >= 4) { setIsAdminDialogOpen(true); setLogoTapCount(0); }
                }}
              >
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
            <h2 className="font-headline font-black text-4xl mb-2 italic uppercase">INSERT CASH</h2>
            <div className="bg-white/5 border-2 border-white/10 p-10 mb-8 w-full flex flex-col items-center justify-center">
               <div className="text-sm font-black uppercase text-white/40 mb-4 tracking-widest">
                 {paymentReceived === 0 ? "WAITING FOR CASH..." : "CASH DETECTED"}
               </div>
               <div className="text-6xl font-black italic text-primary">{paymentReceived} PHP</div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              {paymentReceived >= 50 && (
                <NeonButton onClick={() => { setPackageSelected(50); setAppState("setup"); }} className="w-full py-10 text-xl border-4 border-primary">₱50 PACKAGE</NeonButton>
              )}
              {paymentReceived >= 100 && (
                <NeonButton onClick={() => { setPackageSelected(100); setAppState("setup"); }} className="w-full py-10 text-xl border-4 border-primary">₱100 PACKAGE</NeonButton>
              )}
            </div>
          </div>
        )}

        {appState === "setup" && (
          <div className="w-full h-full max-w-7xl flex flex-row gap-8 items-start py-10 px-8">
             <div className="flex-1 space-y-6 overflow-y-auto pr-4 scrollbar-hide">
                <div className="space-y-4">
                  <h2 className="font-headline font-black text-3xl italic uppercase text-primary">Select Layout</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {currentBlueprints.map(bp => (
                      <button 
                        key={bp.id} 
                        onClick={() => setSelectedBlueprint(bp)} 
                        className={cn("p-4 border-2 flex flex-col items-center bg-white/5 transition-all", selectedBlueprint?.id === bp.id ? "border-primary bg-primary/10 scale-95" : "border-white/10")}
                      >
                        <span className="text-xs font-black uppercase italic">{bp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="font-headline font-black text-3xl italic uppercase text-primary">Filters</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {currentFilters.map(f => (
                      <button key={f.id} onClick={() => setSelectedFilter(f)} className={cn("p-4 border-2 flex flex-col bg-white/5 transition-all", selectedFilter.id === f.id ? "border-primary bg-primary/10" : "border-white/10")}>
                        <span className="text-[10px] font-black uppercase italic">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
             </div>
             <div className="w-[500px] flex flex-col gap-6">
                <div className="relative aspect-[16/9] bg-zinc-900 border-4 border-white overflow-hidden shadow-2xl">
                   <video ref={videoRef} autoPlay playsInline muted className={cn("absolute inset-0 w-full h-full object-cover", selectedFilter.class)} />
                </div>
                <NeonButton onClick={() => startShotSequence()} className="w-full py-12 text-3xl">SHOOT</NeonButton>
             </div>
          </div>
        )}

        {appState === "capturing" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
             <video ref={videoRef} autoPlay playsInline muted className={cn("w-full h-full object-cover", selectedFilter.class)} />
             {countdown !== null && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                 <span className="text-[25rem] font-black italic text-white animate-bounce drop-shadow-[0_0_50px_rgba(255,51,153,0.8)]">{countdown}</span>
               </div>
             )}
             {isProcessing && <div className="absolute inset-0 bg-white animate-pulse z-[60]" />}
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
                      filterClass={selectedFilter.class} 
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
                onClick={() => selectedRetakeIndex !== null && startSingleShotSequence(selectedRetakeIndex)} 
                disabled={selectedRetakeIndex === null} 
                className={cn(
                  "w-full py-8 font-black uppercase italic transition-all border-2 flex items-center justify-center gap-3",
                  selectedRetakeIndex !== null 
                    ? "bg-white text-black border-white hover:scale-105" 
                    : "bg-white/5 text-white/20 border-white/10 opacity-50"
                )}
               >
                 <Target className="w-5 h-5" /> {selectedRetakeIndex !== null ? `Retake Photo ${selectedRetakeIndex + 1}` : "Select Slot to Retake"}
               </button>

               <button 
                onClick={() => setAppState("setup")} 
                className="w-full py-4 border-2 border-white/20 font-black uppercase italic text-white/40 hover:text-white transition-colors flex items-center justify-center gap-2"
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
                      filterClass={selectedFilter.class} 
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
                      <h3 className="text-[10px] font-black uppercase text-white/40 italic">Quotes</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {QUOTES.map(q => (
                          <button key={q.id} onClick={() => setSelectedQuote(q)} className={cn("p-4 border-2 text-left transition-all", selectedQuote.id === q.id ? "border-primary bg-primary/10" : "border-white/10 bg-white/5")}><p className="text-xs font-bold italic">"{q.text}"</p></button>
                        ))}
                      </div>
                   </div>
                </div>
                <NeonButton onClick={() => setAppState("printing")} className="w-full py-10 text-2xl">FINISH & PRINT</NeonButton>
             </div>
          </div>
        )}

        {appState === "printing" && (
          <div className="w-full flex flex-row items-center gap-16 px-10 h-full">
             <div className="flex-1 space-y-10">
                <div className="space-y-2">
                  <h2 className="font-headline font-black text-5xl italic uppercase text-primary">Printing...</h2>
                  <p className="text-lg font-black uppercase text-white/40 italic tracking-widest">Your portrait is being processed</p>
                </div>
                <Progress value={printProgress} className="h-4 bg-white/10" />
                <div className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <Printer className="w-8 h-8 text-primary animate-pulse" />
                  <p className="text-sm font-bold uppercase italic text-white/60">SENDING DATA TO THERMAL PRINTER via NOKOPRINT</p>
                </div>
             </div>
             <div className="bg-white/5 border-2 border-white/10 p-8 flex flex-col items-center space-y-6 rounded-[3rem] w-[400px] shadow-[0_0_50px_rgba(255,51,153,0.2)]">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black italic uppercase text-primary">HD SOFT COPY</h3>
                  <p className="text-[10px] font-black uppercase text-white/40 italic">SCAN TO SAVE TO YOUR PHONE</p>
                </div>
                <div className="aspect-square w-full bg-white p-6 rounded-3xl flex items-center justify-center shadow-2xl">
                  {softCopyQrUrl ? <img src={softCopyQrUrl} alt="Scan to save" className="w-full h-full" /> : <Loader2 className="w-12 h-12 animate-spin text-primary" />}
                </div>
                {uploadStatus === "complete" ? (
                  <button onClick={() => setAppState("thankyou")} className="w-full bg-primary py-6 text-xl font-black uppercase italic rounded-2xl shadow-xl active:scale-95 transition-transform">COMPLETE SESSION</button>
                ) : (
                  <div className="flex items-center gap-3 py-6">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-[10px] font-black uppercase text-white/40 italic">Syncing HD to Cloud...</span>
                  </div>
                )}
             </div>
          </div>
        )}

        {appState === "thankyou" && (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000">
             <JnlLogo variant="hero" color="light" className="mb-12" />
             <h2 className="font-headline font-black text-7xl italic uppercase">THANK <span className="text-primary">YOU!</span></h2>
             <p className="text-xl font-black uppercase text-white/40 italic tracking-[0.3em] mt-4">VISIT US AGAIN SOON</p>
             <NeonButton onClick={resetSession} className="px-20 py-8 text-2xl mt-16">BACK TO START</NeonButton>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
