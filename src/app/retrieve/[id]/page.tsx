
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { Download, Loader2, AlertCircle, Share2, Activity, Clock } from "lucide-react";

export default function RetrievePage() {
  const params = useParams();
  const id = params?.id as string;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);
  const MAX_RETRIES = 100; // High-frequency polling for instant mall-style performance

  const fetchPhoto = useCallback(async () => {
    if (!id) return;
    console.log(`[VERIFIED RETRIEVAL ATTEMPT]: ${id}`);
    
    try {
      const { storage, db } = initializeFirebase();
      
      // Step 1: Verify document existence first (Firestore)
      const docRef = doc(db, "photos", id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log(`[VERIFIED RETRIEVAL]: Doc not found for ${id}, polling (Attempt ${retryCount.current})...`);
        // High-frequency retry logic to handle background upload latency
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current += 1;
          setTimeout(fetchPhoto, 500); // Poll every 500ms
          return;
        }
        setError("Portrait not found. Please scan the QR code again or contact support.");
        setLoading(false);
        return;
      }

      console.log(`[VERIFIED RETRIEVAL]: Doc found for ${id}`);

      // Step 2: Get signed production URL from Storage
      const photoRef = ref(storage, `photos/${id}.jpg`);
      const url = await getDownloadURL(photoRef);
      
      setImageUrl(url);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.warn(`[VERIFIED RETRIEVAL]: Storage path not ready for ${id}`, err);
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        setTimeout(fetchPhoto, 500);
      } else {
        setError("HD Portrait is still syncing. Please refresh in a few seconds.");
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchPhoto();
  }, [fetchPhoto]);

  const handleDownload = async () => {
    if (!imageUrl || !id) return;
    try {
      const { db } = initializeFirebase();
      const docRef = doc(db, "photos", id);
      // Track download for analytics
      updateDoc(docRef, { isDownloaded: true }).catch(() => {});

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JNL_Studio_HD_${id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log(`[VERIFIED DOWNLOAD]: Success for ${id}`);
    } catch (e) {
      window.open(imageUrl, '_blank');
      console.warn(`[VERIFIED DOWNLOAD]: Fallback used for ${id}`, e);
    }
  };

  const handleShare = async () => {
    if (!imageUrl || !navigator.share) return;
    try {
      await navigator.share({
        title: 'JNL Studio Portrait',
        text: 'Check out my HD moment from JNL Studio!',
        url: window.location.href,
      });
    } catch (e) {}
  };

  return (
    <KioskLayout className="bg-zinc-950 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8 text-center">
        
        <div className="w-full max-w-lg bg-zinc-900 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl animate-in slide-in-from-bottom-8 duration-500">
          {loading ? (
            <div className="flex flex-col items-center py-24 space-y-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Clock className="w-6 h-6 text-primary/40 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-white/80 font-black uppercase tracking-[0.3em] text-[10px]">VERIFYING SESSION...</p>
                <p className="text-white/20 font-bold uppercase text-[7px] tracking-tighter">SECURE ID HANDSHAKE ACTIVE</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-24 space-y-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
              <p className="text-white/80 font-bold uppercase text-xs leading-relaxed max-w-[280px]">{error}</p>
              <NeonButton onClick={() => window.location.reload()} className="!py-4 mt-4 w-full text-sm">RETRY HANDSHAKE</NeonButton>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative aspect-[2/3] w-full rounded-[1.5rem] overflow-hidden shadow-inner border-4 border-white bg-zinc-950">
                <img 
                  src={imageUrl!} 
                  alt="HD Portrait" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-headline font-black italic uppercase text-primary tracking-tight">HD SOFT COPY</h2>
                  <div className="flex items-center justify-center gap-2 text-[7px] font-black uppercase text-white/20 tracking-[0.4em]">
                    <Activity className="w-2.5 h-2.5" /> JNL VERIFIED SESSION
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <NeonButton onClick={handleDownload} className="w-full flex items-center justify-center gap-3 !py-5 text-lg">
                    <Download className="w-6 h-6" /> SAVE TO GALLERY
                  </NeonButton>
                  <button 
                    onClick={handleShare}
                    className="w-full border-2 border-white/20 font-headline font-black text-xs py-4 italic uppercase text-white/60 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" /> SHARE MOMENT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </KioskLayout>
  );
}
