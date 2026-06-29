
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { KioskLogger } from "@/lib/kiosk/logger";

export default function RetrievePage() {
  const params = useParams();
  const id = params?.id as string;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'verifying' | 'found' | 'syncing' | 'complete'>('verifying');
  const retryCount = useRef(0);
  const MAX_RETRIES = 120; // 60 seconds of polling for HD availability

  const fetchPhoto = useCallback(async () => {
    if (!id) return;
    
    try {
      const { storage, db } = initializeFirebase();
      KioskLogger.log('info', 'QR', 'Retrieval page opened.', 'SUCCESS');
      
      const docRef = doc(db, "photos", id);
      const docSnap = await getDoc(docRef);
      
      // If doc doesn't exist yet, keep polling. Cloud upload might be slow.
      if (!docSnap.exists()) {
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current += 1;
          setTimeout(fetchPhoto, 500); 
          return;
        }
        setError("Photo not found.");
        setLoading(false);
        KioskLogger.log('error', 'QR', 'Image lookup failed.', 'FAILED', 'Session ID not found');
        return;
      }

      setStatus('syncing');
      KioskLogger.log('info', 'QR', 'Session record found.', 'SUCCESS');

      const photoRef = ref(storage, `photos/${id}.jpg`);
      try {
        const url = await getDownloadURL(photoRef);
        setImageUrl(url);
        setLoading(false);
        setStatus('complete');
        KioskLogger.log('info', 'QR', 'Photo Displayed.', 'SUCCESS');
        KioskLogger.log('info', 'QR', 'Download Available.', 'SUCCESS');
      } catch (e: any) {
        // Record exists but file not in storage yet (Syncing state)
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current += 1;
          setTimeout(fetchPhoto, 1000); 
        } else {
          setError("Photo syncing. Please refresh in a moment.");
          setLoading(false);
          KioskLogger.log('error', 'QR', 'Image load failed.', 'FAILED', e.message);
        }
      }
    } catch (err: any) {
      setError("Unable to connect to service.");
      setLoading(false);
      KioskLogger.log('error', 'QR', 'Handshake error.', 'FAILED', err.message);
    }
  }, [id]);

  useEffect(() => {
    fetchPhoto();
  }, [fetchPhoto]);

  const handleDownload = async () => {
    if (!imageUrl || !id) return;
    try {
      const { db } = initializeFirebase();
      // REQUIREMENT: Update Firestore so the kiosk knows the download was successful
      await updateDoc(doc(db, "photos", id), { isDownloaded: true });
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JNL_Studio_Portrait_${id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      KioskLogger.log('info', 'QR', 'Download triggered.', 'SUCCESS');
    } catch (e) {
      window.open(imageUrl, '_blank');
      KioskLogger.log('warn', 'QR', 'Fallback download triggered.', 'SUCCESS');
    }
  };

  return (
    <KioskLayout className="bg-zinc-950 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8 text-center">
        <div className="w-full max-w-lg bg-zinc-900 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center py-24 space-y-6">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-white/80 font-black uppercase tracking-[0.3em] text-[10px]">
                {status === 'verifying' ? 'VERIFYING SESSION...' : 'HD VERSION SYNCING...'}
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-24 space-y-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
              <p className="text-white/80 font-bold uppercase text-xs">{error}</p>
              <NeonButton onClick={() => window.location.reload()} className="!py-4 mt-4 w-full text-sm">RETRY</NeonButton>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative aspect-[2/3] w-full rounded-[1.5rem] overflow-hidden border-4 border-white shadow-xl">
                <img src={imageUrl!} alt="JNL Studio Portrait" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-6">
                <h2 className="text-2xl font-black italic uppercase text-primary">HD SOFT COPY</h2>
                <NeonButton onClick={handleDownload} className="w-full flex items-center justify-center gap-3 !py-5 text-lg">
                  <Download className="w-6 h-6" /> DOWNLOAD
                </NeonButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </KioskLayout>
  );
}
