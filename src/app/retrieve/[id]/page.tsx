
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { Download, Loader2, AlertCircle, Share2, Activity, Clock } from "lucide-react";

/**
 * Retrieval Page for Secure HD Soft Copy Downloads.
 * Isolated by high-entropy SessionId. No login required.
 */
export default function RetrievePage() {
  const params = useParams();
  const id = params?.id as string;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'verifying' | 'found' | 'syncing' | 'complete'>('verifying');
  const retryCount = useRef(0);
  const MAX_RETRIES = 240; // ~1 minute of polling at 250ms

  const fetchPhoto = useCallback(async () => {
    if (!id) return;
    
    try {
      const { storage, db } = initializeFirebase();
      
      // 1. SESSION VERIFICATION (Isolated by high-entropy ID)
      const docRef = doc(db, "photos", id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current += 1;
          setTimeout(fetchPhoto, 250); 
          return;
        }
        setError("Photo not found.");
        setLoading(false);
        return;
      }

      setStatus('syncing');

      // 2. HD FETCH
      const photoRef = ref(storage, `photos/${id}.jpg`);
      const url = await getDownloadURL(photoRef);
      
      setImageUrl(url);
      setLoading(false);
      setError(null);
      setStatus('complete');
    } catch (err: any) {
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        setTimeout(fetchPhoto, 250); 
      } else {
        setError("Photo syncing. Please refresh in a moment.");
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
      await updateDoc(doc(db, "photos", id), {
        isDownloaded: true
      });

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
    } catch (e) {
      window.open(imageUrl, '_blank');
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
                    <Download className="w-6 h-6" /> DOWNLOAD
                  </NeonButton>
                  <button 
                    onClick={handleShare}
                    className="w-full border-2 border-white/20 font-headline font-black text-xs py-4 italic uppercase text-white/60 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" /> SHARE
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
