
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

  const [usbHandle, setUsbHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [preparedBlob, setPreparedBlob] = useState<Blob | null>(null);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  const [runtimeStatus, setRuntimeStatus] = useState({
    photoGenerated: 'PENDING',
    photoSaved: 'PENDING',
    intentTriggered: 'PENDING',
    intentAcknowledged: 'PENDING',
    cloudSync: 'PENDING',
    sessionCreated: 'PENDING',
    fileCreated: 'PENDING',
    fileSize: '0 bytes',
    usbBackup: 'PENDING',
    navigatorShareStarted: 'PENDING',
    navigatorShareResolved: 'PENDING',
    navigatorShareRejected: 'PENDING',
    nokoprintOpened: 'PENDING',
    secureContext: 'CHECKING',
    topLevelContext: 'CHECKING',
    userAgent: '',
    lastErrorMessage: '',
    savePath: 'NONE',
    qrSourceUrl: 'NONE',
    shareIntentPayload: 'NONE',
    lastSaveError: 'NONE',
    captureSuccess: 'PENDING',
    canvasExists: 'PENDING',
    canvasWidth: '0',
    canvasHeight: '0',
    frameApplied: 'PENDING',
    filterApplied: 'PENDING',
    blobCreated: 'PENDING',
    blobSize: '0 bytes',
    uploadStarted: 'FALSE',
    uploadCompleted: 'FALSE',
    uploadFailed: 'FALSE',
    uploadTarget: 'NONE',
    uploadedFileUrl: 'NONE',
    storageProvider: 'Firebase Storage',
    lastUploadError: 'NONE',
    fbProjectId: 'NONE',
    fbStorageBucket: 'NONE',
    fbUserUid: 'NONE',
    fbAuthState: 'OFFLINE',
    fbUploadProgress: '0%',
    fbTaskState: 'NONE',
    fbErrorCode: 'NONE',
    fbErrorMessage: 'NONE',
    fbException: 'NONE',
    fbUrlGenerated: 'FALSE',
    usbDevicesCount: 0,
    shareCapable: 'UNKNOWN',
    usbHandleValid: 'FALSE'
  });

  // INITIALIZATION & PRE-AUTH
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { app, auth } = initializeFirebase();
      
      setRuntimeStatus(prev => ({
        ...prev,
        fbProjectId: (app.options as any).projectId || 'UNKNOWN',
        fbStorageBucket: (app.options as any).storageBucket || 'UNKNOWN'
      }));

      // Background sign-in ensures we are ready for high-res upload during capture
      signInAnonymously(auth).then(() => {
        KioskLogger.log('info', 'SESSION', 'Anonymous Auth Successful', 'SUCCESS');
      }).catch(e => {
        KioskLogger.log('error', 'SESSION', 'Auth Initialization Failed', 'FAILED', e.message);
        setRuntimeStatus(prev => ({ ...prev, fbException: 'AUTH_FAILED: ' + e.message, fbAuthState: 'ERROR', fbErrorCode: e.code }));
      });

      onAuthStateChanged(auth, (user) => {
        setRuntimeStatus(prev => ({
          ...prev,
          fbUserUid: user?.uid || 'NONE',
          fbAuthState: user ? 'LOGGED_IN' : 'SIGNED_OUT'
        }));
      });

      const checkHardware = async () => {
        let usbCount = 0;
        if ('usb' in navigator) {
          try {
            const devices = await navigator.usb.getDevices();
            usbCount = devices.length;
          } catch (e) {}
        }
        setRuntimeStatus(prev => ({
          ...prev,
          secureContext: window.isSecureContext ? 'YES' : 'NO',
          topLevelContext: window.self === window.top ? 'YES' : 'NO',
          userAgent: navigator.userAgent,
          usbDevicesCount: usbCount,
          shareCapable: !!navigator.share ? 'YES' : 'NO'
        }));
      };
      checkHardware();
      setOriginUrl(window.location.origin);
    }
  }, []);

  // TEMPORARY STORAGE CLEANUP (Runs on Kiosk Background)
  useEffect(() => {
    const { db, storage } = initializeFirebase();
    const photosRef = collection(db, "photos");
    const q = query(photosRef, where("status", "==", "complete"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added" || change.type === "modified") {
          const data = change.doc.data();
          const docId = change.doc.id;
          
          const now = Date.now();
          const timestamp = data.timestamp?.toMillis?.() || 0;
          const isStale = timestamp > 0 && (now - timestamp > 10 * 60 * 1000); // 10 minutes

          if (data.isDownloaded || isStale) {
            KioskLogger.log('info', 'CLOUD', `Purging ${isStale ? 'Stale' : 'Accessed'} Photo: ${docId}`, 'SUCCESS');
            
            try {
              const photoRef = ref(storage, data.storagePath);
              await deleteObject(photoRef);
            } catch (e) {}

            try {
              await deleteDoc(doc(db, "photos", docId));
            } catch (e) {}
          }
        }
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (appState === "payment") {
      if (paymentReceived >= 100) {
        setAppState("package-selection");
      } else if (paymentReceived >= 50) {
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
      }, 150);
      return () => clearInterval(interval);
    }
  }, [appState]);

  const initiatePrint = useCallback(async (blob: Blob) => {
    try {
      if (!blob || blob.size === 0) throw new Error("Null or Empty Blob detected");

      const timestamp = Date.now();
      const sessionId = `jnl_${timestamp.toString(36)}`;
      const fileName = `JNL_STUDIO_${sessionId}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      
      setRuntimeStatus(prev => ({ 
        ...prev, 
        intentTriggered: 'PASS', 
        navigatorShareStarted: 'PASS'
      }));

      KioskLogger.log('info', 'PRINT', `Attempting Intent Launch for: ${fileName}`, 'PENDING');

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'JNL Studio Portrait',
          text: 'Open with NokoPrint'
        });
        KioskLogger.log('info', 'PRINT', 'Share Intent Dispatched Successfully', 'SUCCESS');
        setRuntimeStatus(prev => ({ 
          ...prev, 
          intentAcknowledged: 'PASS', 
          navigatorShareResolved: 'PASS', 
          nokoprintOpened: 'PASS' 
        }));
      } else {
        throw new Error('Share API blocked or file rejected by OS');
      }
    } catch (e: any) {
      KioskLogger.log('error', 'PRINT', 'Intent Dispatch Failed', 'FAILED', e.message);
      setRuntimeStatus(prev => ({ 
        ...prev, 
        intentAcknowledged: 'FAIL', 
        navigatorShareRejected: 'FAIL', 
        lastErrorMessage: e.message 
      }));
    }
  }, []);

  const handleCloudSync = useCallback(async (blob: Blob) => {
    const sessionId = `jnl_${Math.random().toString(36).substring(2, 12)}`;
    setCurrentSessionId(sessionId);
    
    setRuntimeStatus(prev => ({ ...prev, uploadStarted: 'TRUE', uploadTarget: `photos/${sessionId}.jpg` }));

    if (!blob || blob.size === 0) {
      setRuntimeStatus(prev => ({ ...prev, photoSaved: 'FAIL', lastSaveError: 'Empty Image', uploadFailed: 'TRUE' }));
      return;
    }

    // MANDATORY PRODUCTION SEQUENCE: Local Save -> USB Archive -> Cloud Sync
    await SessionStore.savePhotoLocally(sessionId, blob);
    KioskLogger.log('info', 'SESSION', `Local IndexedDB Save Complete: ${sessionId}`, 'SUCCESS');

    if (usbHandle) {
      const usbResult = await SessionStore.saveToUsb(usbHandle, sessionId, blob);
      if (usbResult.success) {
        KioskLogger.log('info', 'HARDWARE', `Lexar Archive Success: ${usbResult.path}`, 'SUCCESS');
        setRuntimeStatus(prev => ({ ...prev, usbBackup: 'PASS', usbHandleValid: 'TRUE' }));
      } else {
        KioskLogger.log('error', 'HARDWARE', `Lexar Archive Failed`, 'FAILED');
        setRuntimeStatus(prev => ({ ...prev, usbBackup: 'FAIL' }));
      }
    } else {
      setRuntimeStatus(prev => ({ ...prev, usbBackup: 'OFFLINE' }));
    }

    const { storage, db, auth } = initializeFirebase();

    // Ensure Auth is ready for production storage rules
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (e: any) {
        KioskLogger.log('error', 'SESSION', 'Fallback Auth Failed', 'FAILED', e.message);
        setRuntimeStatus(prev => ({ ...prev, fbException: 'AUTH_FAILED: ' + e.message }));
      }
    }

    // UPLOAD TEMPORARY SOFT COPY WITH FAST PRODUCTION TIMEOUT
    const retrievalUrl = `${originUrl}/retrieve/${sessionId}`;
    setUploadStatus("uploading");
    setRuntimeStatus(prev => ({ ...prev, qrSourceUrl: retrievalUrl }));

    const docRef = doc(db, "photos", sessionId);
    const sessionData = {
      id: sessionId,
      storagePath: `photos/${sessionId}.jpg`,
      timestamp: serverTimestamp(),
      isDownloaded: false,
      promoConsent: promoConsent,
      status: 'uploading'
    };

    try {
      await setDoc(docRef, sessionData);
      setRuntimeStatus(prev => ({ ...prev, sessionCreated: 'PASS' }));

      const photoRef = ref(storage, `photos/${sessionId}.jpg`);
      const uploadTask = uploadBytesResumable(photoRef, blob, { contentType: 'image/jpeg' });

      // HARD PRODUCTION TIMEOUT: 5 Seconds for Soft Copy to prevent kiosk hang
      const cloudTimeout = setTimeout(() => {
        if (uploadStatus !== "complete") {
          setUploadStatus("error");
          KioskLogger.log('warn', 'CLOUD', 'Upload Timeout Reached (Switching to Offline)', 'FAILED');
          setRuntimeStatus(prev => ({ 
            ...prev, 
            uploadFailed: 'TRUE', 
            fbErrorMessage: 'Network Timeout (Offline Mode Active)' 
          }));
        }
      }, 5000);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setRuntimeStatus(prev => ({
            ...prev,
            fbUploadProgress: `${progress.toFixed(1)}%`,
            fbTaskState: snapshot.state
          }));
        },
        async (error: any) => {
          clearTimeout(cloudTimeout);
          setUploadStatus("error");
          KioskLogger.log('error', 'CLOUD', 'Firebase Storage Error', 'FAILED', error.code);
          setRuntimeStatus(prev => ({ 
            ...prev, 
            uploadFailed: 'TRUE', 
            fbErrorCode: error.code || 'UNKNOWN',
            fbErrorMessage: error.message || 'UNKNOWN',
            fbException: JSON.stringify(error)
          }));
        },
        async () => {
          clearTimeout(cloudTimeout);
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          await updateDoc(docRef, { status: 'complete', downloadUrl: downloadUrl });
          
          setSoftCopyQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(retrievalUrl)}`);
          setUploadStatus("complete");
          KioskLogger.log('info', 'CLOUD', 'Soft Copy Upload Verified', 'SUCCESS');
          
          setRuntimeStatus(prev => ({ 
            ...prev, 
            cloudSync: 'PASS', 
            uploadCompleted: 'TRUE', 
            uploadedFileUrl: downloadUrl,
            fbUrlGenerated: 'TRUE',
            fbTaskState: 'success'
          }));
        }
      );
    } catch (error: any) {
      setUploadStatus("error");
      KioskLogger.log('error', 'CLOUD', 'Database Entry Failed', 'FAILED', error.message);
      setRuntimeStatus(prev => ({ 
        ...prev, 
        cloudSync: 'FAIL', 
        uploadFailed: 'TRUE', 
        fbException: error.message 
      }));
    }
  }, [originUrl, usbHandle, promoConsent, uploadStatus]);

  const preSpoolPrintFile = useCallback(async () => {
    if (!selectedBlueprint || capturedPhotos.length === 0) return;
    
    setIsPreparingPrint(true);
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1600;
    exportCanvas.height = 2400;
    const ctx = exportCanvas.getContext('2d');
    
    if (!ctx) {
      setRuntimeStatus(prev => ({ ...prev, canvasExists: 'FAIL' }));
      setIsPreparingPrint(false);
      return;
    }

    setRuntimeStatus(prev => ({ 
      ...prev, 
      canvasExists: 'PASS', 
      canvasWidth: '1600', 
      canvasHeight: '2400' 
    }));

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
      
      setRuntimeStatus(prev => ({ ...prev, filterApplied: 'PASS' }));

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
      
      setRuntimeStatus(prev => ({ ...prev, frameApplied: 'PASS' }));

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

    if (isStrip) {
      await drawContent(0);
      await drawContent(800);
    } else {
      await drawContent(0);
    }

    setRuntimeStatus(prev => ({ ...prev, photoGenerated: 'PASS' }));
    
    // PRODUCTION QUALITY OPTIMIZATION: 0.90 Quality for ultra-fast soft copy delivery
    exportCanvas.toBlob((blob) => {
      if (blob && blob.size > 0) {
        setPreparedBlob(blob);
        setRuntimeStatus(prev => ({ 
          ...prev, 
          blobCreated: 'PASS', 
          blobSize: `${(blob.size / 1024).toFixed(1)} KB`,
          fileCreated: 'PASS'
        }));
      } else {
        setRuntimeStatus(prev => ({ 
          ...prev, 
          blobCreated: 'FAIL', 
          fileCreated: 'FAIL',
          blobSize: '0 bytes',
          lastErrorMessage: 'Zero-byte Canvas output' 
        }));
      }
      setIsPreparingPrint(false);
    }, 'image/jpeg', 0.90);
  }, [selectedBlueprint, capturedPhotos, selectedQuote, selectedFilter, placedStickers]);

  const addSticker = (type: string) => {
    const newSticker: PlacedSticker = {
      id: Math.random().toString(36).substring(7),
      type,
      x: 50,
      y: 50,
      size: 20,
      rotation: 0,
      zIndex: placedStickers.length + 100
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
    setUploadStatus("idle");
    setSoftCopyQrUrl("");
    setRuntimeStatus(prev => ({
      ...prev,
      photoGenerated: 'PENDING',
      photoSaved: 'PENDING',
      intentTriggered: 'PENDING',
      intentAcknowledged: 'PENDING',
      cloudSync: 'PENDING',
      sessionCreated: 'PENDING',
      fileCreated: 'PENDING',
      fileSize: '0 bytes',
      usbBackup: usbHandle ? 'PENDING' : 'OFFLINE',
      navigatorShareStarted: 'PENDING',
      navigatorShareResolved: 'PENDING',
      navigatorShareRejected: 'PENDING',
      nokoprintOpened: 'PENDING',
      savePath: 'NONE',
      qrSourceUrl: 'NONE',
      shareIntentPayload: 'NONE',
      lastSaveError: 'NONE',
      captureSuccess: 'PENDING',
      canvasExists: 'PENDING',
      frameApplied: 'PENDING',
      filterApplied: 'PENDING',
      blobCreated: 'PENDING',
      blobSize: '0 bytes',
      uploadStarted: 'FALSE',
      uploadCompleted: 'FALSE',
      uploadFailed: 'FALSE',
      uploadedFileUrl: 'NONE',
      fbUploadProgress: '0%',
      fbTaskState: 'NONE',
      fbErrorCode: 'NONE',
      fbErrorMessage: 'NONE',
      fbException: 'NONE',
      fbUrlGenerated: 'FALSE'
    }));
  }, [usbHandle]);

  const startShotSequence = async () => {
    const totalShots = packageSelected === 50 ? 3 : 6;
    const photos: string[] = capturedPhotos.length > 0 ? [...capturedPhotos] : [];
    
    setAppState("capturing");
    setIsCapturingReady(true);

    for (let i = (selectedRetakeIndex !== null ? selectedRetakeIndex : 0); 
         i < (selectedRetakeIndex !== null ? selectedRetakeIndex + 1 : totalShots); i++) {
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
        if (selectedRetakeIndex !== null) {
          photos[i] = shot;
        } else {
          photos.push(shot);
        }
        setCapturedPhotos([...photos]);
      }
      await new Promise(r => setTimeout(r, 300)); 
      setIsProcessing(false);
    }
    setSelectedRetakeIndex(null);
    setAppState("review");
  };

  const takePhoto = (): string | null => {
    if (!videoRef.current || !canvasRef.current) {
      setRuntimeStatus(prev => ({ ...prev, captureSuccess: 'FAIL' }));
      return null;
    }
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const shot = canvasRef.current.toDataURL('image/jpeg', 0.92);
      setRuntimeStatus(prev => ({ ...prev, captureSuccess: shot ? 'PASS' : 'FAIL' }));
      return shot;
    }
    setRuntimeStatus(prev => ({ ...prev, captureSuccess: 'FAIL' }));
    return null;
  };

  useEffect(() => {
    if (appState === "setup" || appState === "capturing") {
      const start = async () => {
        if (cameraStream && cameraStream.active) {
          if (videoRef.current && videoRef.current.srcObject !== cameraStream) {
            videoRef.current.srcObject = cameraStream;
          }
          return;
        }
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
    if (appState === "final-preview") {
      preSpoolPrintFile();
    }
  }, [appState, preSpoolPrintFile, cameraStream]);

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
            onSimulateCash={(amount) => {
              setPaymentReceived(prev => prev + amount);
            }}
            onMountUsb={setUsbHandle}
            runtimeStatus={runtimeStatus}
            usbHandle={usbHandle}
          />
        )}
        {isOwnerMode && <HealthMonitor usbMounted={!!usbHandle} />}
        
        {appState === "welcome" && (
          <div className="flex flex-col items-center w-full h-full animate-in fade-in duration-1000">
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div onClick={() => {
                setLogoTapCount(p => p + 1);
                if (logoTapCount >= 4) {
                  setIsAdminDialogOpen(true);
                  setLogoTapCount(0);
                }
              }}>
                <JnlLogo variant="hero" color="light" />
              </div>
            </div>
            <div className="w-full flex flex-col items-center pb-8">
              <div className="text-sm font-black uppercase text-white/60 mb-6 tracking-[0.3em] animate-pulse">
                INSERT ₱50 OR ₱100 BILL
              </div>
              <NeonButton onClick={() => setAppState("payment")} className="w-[35%] text-2xl py-10">TOUCH TO START</NeonButton>
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
          <div className="w-full h-full flex flex-col items-center justify-center px-6 gap-8">
            <h2 className="text-4xl font-headline font-black italic uppercase text-primary">CONFIRM PACKAGE</h2>
            <div className="flex justify-center w-full max-w-5xl">
              {paymentReceived >= 100 ? (
                <button 
                  onClick={() => { setPackageSelected(100); setAppState("setup"); }}
                  className="group relative bg-white/5 border-4 border-primary p-10 flex flex-col items-center transition-all hover:bg-primary/5 active:scale-95 w-[420px]"
                >
                  <span className="text-6xl font-black italic text-white mb-2">₱100</span>
                  <span className="text-lg font-bold uppercase text-primary">PREMIUM PORTRAIT</span>
                  <div className="mt-4 space-y-1 text-center text-xs font-bold uppercase text-white/60">
                    <p>6 PHOTO SHOTS</p>
                    <p>4x6 SINGLE PORTRAIT</p>
                    <p>FULL FILTER LIBRARY</p>
                  </div>
                </button>
              ) : (
                <button 
                  onClick={() => { setPackageSelected(50); setAppState("setup"); }}
                  className="group relative bg-white/5 border-4 border-primary p-10 flex flex-col items-center transition-all hover:bg-primary/5 active:scale-95 w-[420px]"
                >
                  <span className="text-6xl font-black italic text-white mb-2">₱50</span>
                  <span className="text-lg font-bold uppercase text-primary">CLASSIC STRIP</span>
                  <div className="mt-4 space-y-1 text-center text-xs font-bold uppercase text-white/60">
                    <p>3 PHOTO SHOTS</p>
                    <p>2x6 PHOTO STRIP</p>
                    <p>5 BEAUTY FILTERS</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {appState === "setup" && (
          <div className="w-full h-full max-w-[98%] flex flex-row gap-4 items-start py-2 px-2 overflow-hidden">
             <div className="flex-[0.4] space-y-3 pr-2 scrollbar-hide h-full pb-6">
                <div className="space-y-2">
                  <h2 className="font-headline font-black text-lg italic uppercase text-primary">Layout Selection</h2>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BLUEPRINTS.filter(b => b.package === packageSelected).map(bp => (
                      <button key={bp.id} onClick={() => setSelectedBlueprint(bp)} className={cn("p-1.5 border-2 flex flex-col items-center bg-white/5 transition-all min-h-[110px]", selectedBlueprint?.id === bp.id ? "border-primary bg-primary/10" : "border-white/10")}>
                        <div className="flex-1 w-full relative mb-1">
                          <BlueprintFrame blueprint={bp} photos={[]} isPreview className="!h-full !w-auto" />
                        </div>
                        <span className="text-[6px] font-black uppercase italic text-center">{bp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="font-headline font-black text-lg italic uppercase text-primary">Beauty Filters</h2>
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
                 {selectedBlueprint && (
                    <BlueprintFrame 
                      blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.filter} isPreview 
                      onSelectSlot={(idx) => setSelectedRetakeIndex(idx)} selectedSlotIndex={selectedRetakeIndex}
                    />
                 )}
              </div>
            </div>
            <div className="w-80 space-y-3">
               <NeonButton onClick={() => setAppState("decorating")} className="w-full py-6 text-xl">DECORATE</NeonButton>
               <button onClick={() => selectedRetakeIndex !== null && startShotSequence()} disabled={selectedRetakeIndex === null} className={cn("w-full py-6 font-black uppercase italic border-2 flex items-center justify-center gap-3", selectedRetakeIndex !== null ? "bg-white text-black" : "bg-white/5 text-white/20")}>
                 <Target className="w-5 h-5" /> Retake Selection
               </button>
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
                      blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.filter} 
                      quoteText={selectedQuote.text} stickers={placedStickers} selectedStickerId={selectedStickerId}
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
                          <button key={s.id} onClick={() => addSticker(s.id)} className="aspect-square bg-white/5 border border-white/10 p-1 flex items-center justify-center hover:border-primary transition-colors">
                            <s.icon className={cn("w-full h-full", s.color)} />
                          </button>
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
                {selectedBlueprint && (
                  <BlueprintFrame blueprint={selectedBlueprint} photos={capturedPhotos} filterClass={selectedFilter.filter} quoteText={selectedQuote.text} stickers={placedStickers} isPreview={true} />
                )}
                {isPreparingPrint && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-[80]">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <span className="text-[9px] font-black uppercase italic text-primary">Pre-spooling...</span>
                  </div>
                )}
              </div>
            </div>
            <NeonButton 
              disabled={isPreparingPrint || !preparedBlob}
              onClick={() => {
                if (preparedBlob) {
                  initiatePrint(preparedBlob);
                  handleCloudSync(preparedBlob);
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
                <div className="mb-12 min-h-[40px]">
                   {promoConsent !== null && (
                     <div className="flex items-center gap-3 text-primary font-black uppercase italic text-2xl animate-in slide-in-from-top-4">
                       <CheckCircle2 className="w-8 h-8" />
                       {promoConsent ? "Promotion Approved" : "Private Session"}
                     </div>
                   )}
                </div>

                <div className="text-center mb-8">
                   <h2 className="font-headline font-black text-6xl italic uppercase text-primary mb-4">Printing...</h2>
                   <div className="flex flex-col items-center justify-center gap-3">
                     <div className="flex items-center gap-2">
                        {(uploadStatus === 'uploading' || runtimeStatus.cloudSync === 'PENDING') && uploadStatus !== 'error' && <Loader2 className="w-4 h-4 text-white/40 animate-spin" />}
                        <p className={cn("font-bold uppercase tracking-[0.3em] text-sm italic", uploadStatus === 'error' ? "text-red-500" : "text-white/40")}>
                          {uploadStatus === 'idle' && "Initializing Sequence..."}
                          {uploadStatus === 'uploading' && "Uploading High-Res Version..."}
                          {uploadStatus === 'complete' && "Cloud Storage Verified"}
                          {uploadStatus === 'error' && "Soft Copy Unavailable (Offline)"}
                        </p>
                     </div>
                     <p className="text-primary text-[10px] font-black uppercase italic animate-pulse">
                        {softCopyQrUrl ? "SYSTEM READY - SCAN QR" : (uploadStatus === 'error' ? "Physical Print in Progress" : "HOLD ON, SYNCING...")}
                     </p>
                   </div>
                </div>

                <div className="w-full max-w-2xl">
                   <Progress value={printProgress} className="h-8 bg-white/10 w-full" />
                </div>
             </div>

             <div className="w-[480px] bg-white/5 flex flex-col items-center justify-center p-10">
                {softCopyQrUrl ? (
                  <div className="animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center space-y-8">
                     <div className="text-center space-y-2">
                       <h3 className="text-3xl font-black italic uppercase text-primary">HD SOFT COPY</h3>
                       <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Available for 10 minutes only</p>
                     </div>
                     <div className="bg-white p-6 rounded-[3rem] shadow-[0_0_50px_rgba(255,51,153,0.1)]">
                        <img src={softCopyQrUrl} alt="Scan to save" className="w-64 h-64" />
                     </div>
                     <p className="text-xs font-bold uppercase text-white/40 text-center leading-relaxed">Scan now to save your<br/>high-resolution portrait</p>
                     
                     {(printProgress >= 100 || runtimeStatus.intentAcknowledged !== 'PENDING') && (
                        <button 
                          onClick={() => setAppState("thankyou")} 
                          className="w-full bg-primary py-8 text-2xl font-black uppercase italic rounded-3xl shadow-[0_10px_30px_rgba(255,51,153,0.3)] active:scale-95 transition-all text-white"
                        >
                          DONE
                        </button>
                     )}
                  </div>
                ) : uploadStatus === 'error' ? (
                  <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-500">
                    <div className="w-32 h-32 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center">
                      <WifiOff className="w-16 h-16 text-red-500" />
                    </div>
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-black italic uppercase text-white/60">OFFLINE MODE</h3>
                      <p className="text-[10px] font-bold uppercase text-white/30 leading-relaxed max-w-[250px]">Internet connection lost. High-res download is disabled, but your physical print is unaffected.</p>
                    </div>
                    {(printProgress >= 100 || runtimeStatus.intentAcknowledged !== 'PENDING') && (
                        <button 
                          onClick={() => setAppState("thankyou")} 
                          className="w-full bg-zinc-800 py-8 text-2xl font-black uppercase italic rounded-3xl shadow-xl active:scale-95 transition-all text-white/40"
                        >
                          DONE
                        </button>
                     )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-6 opacity-20">
                     <div className="relative">
                        <Loader2 className="w-16 h-16 text-white animate-spin" />
                        <Camera className="w-6 h-6 absolute inset-0 m-auto" />
                     </div>
                     <div className="text-center space-y-2">
                        <span className="text-sm font-black uppercase italic tracking-widest block">Verifying Upload...</span>
                        <span className="text-[8px] font-bold uppercase block">QR generates after success</span>
                     </div>
                  </div>
                )}
             </div>

             {promoConsent === null && (
               <div className="absolute inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 backdrop-blur-md">
                 <div className="bg-zinc-950 border-4 border-primary p-12 flex flex-col items-center space-y-8 rounded-[4rem] w-full max-w-4xl shadow-2xl">
                   <div className="space-y-4 text-center">
                     <div className="space-y-1">
                        <h3 className="text-3xl font-black italic uppercase text-primary">📸 Moment Sharing Consent</h3>
                        <p className="text-primary/60 text-lg font-black italic uppercase">Pahintulot sa Pagbabahagi ng Larawan at Moment</p>
                     </div>
                     
                     <div className="space-y-4 py-4 border-y border-white/10">
                        <div className="space-y-1">
                          <p className="text-white text-lg font-bold">JNL Studio may share your photobooth moments on our Facebook page for promotional purposes.</p>
                          <p className="text-white/40 text-sm italic font-medium">Maaaring ibahagi ng JNL Studio ang inyong photobooth moments sa aming Facebook page para sa promotion.</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Your choice will not affect your photos, prints, or soft copy.</p>
                          <p className="text-white/40 text-[10px] italic font-medium">Ang inyong sagot ay hindi makakaapekto sa inyong prints o soft copy.</p>
                        </div>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6 w-full pt-4">
                      <button 
                        onClick={() => setPromoConsent(true)} 
                        className="py-8 border-4 border-green-500 bg-green-500/10 text-green-500 text-2xl font-black italic uppercase rounded-3xl hover:bg-green-500/20 active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
                      >
                        <span>✅ YES, I AGREE</span>
                      </button>
                      <button 
                        onClick={() => setPromoConsent(false)} 
                        className="py-8 border-4 border-red-500 bg-red-500/10 text-red-500 text-2xl font-black italic uppercase rounded-3xl hover:bg-red-500/20 active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
                      >
                        <span>❌ NO, THANK YOU</span>
                      </button>
                   </div>
                 </div>
               </div>
             )}
          </div>
        )}

        {appState === "thankyou" && (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000 p-12 space-y-12">
             <div className="text-center space-y-4">
                <h2 className="font-headline font-black text-7xl italic uppercase text-primary">Thank You!</h2>
                <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-sm">Visit us again at JNL Studio</p>
             </div>

             <div className="bg-white/5 border-2 border-white/10 p-12 rounded-[5rem] flex flex-col items-center space-y-8 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center gap-6">
                   <h3 className="text-4xl font-black italic uppercase text-primary">FOLLOW US</h3>
                   <span className="text-6xl animate-bounce">👇</span>
                </div>
                <div className="bg-white p-8 rounded-[4rem] shadow-xl">
                   <img 
                     src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent("https://www.facebook.com/share/18vnB4a7gB/")}`} 
                     alt="Facebook Page" 
                     className="w-72 h-72" 
                   />
                </div>
                <p className="text-white/40 font-bold uppercase tracking-widest text-base">Scan to follow JNL Studio on Facebook</p>
             </div>

             <NeonButton onClick={resetSession} className="px-24 !py-10 text-3xl mt-6 rounded-2xl">BACK TO START</NeonButton>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
