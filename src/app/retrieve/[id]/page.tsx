
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { JnlLogo } from "@/components/kiosk/jnl-logo";
import { Download, Loader2, AlertCircle, Share2, Activity, Clock } from "lucide-react";

export default function RetrievePage() {
  const params = useParams();
  const id = params?.id as string;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);

  const fetchPhoto = useCallback(async () => {
    if (!id) return;
    
    try {
      const { storage } = initializeFirebase();
      const photoRef = ref(storage, `photos/${id}.jpg`);
      
      // TARGET: Direct CDN fetch - high frequency polling for instant result
      // Increased polling frequency to 400ms for ultra-fast customer experience
      const url = await getDownloadURL(photoRef);
      setImageUrl(url);
      setLoading(false);
    } catch (err) {
      // High-speed polling (every 400ms) to detect background upload completion immediately
      if (retries < 50) { // Approx 20 seconds total
        setTimeout(() => setRetries(prev => prev + 1), 400);
      } else {
        setError("Finalizing HD portrait... please try again in a few seconds.");
        setLoading(false);
      }
    }
  }, [id, retries]);

  useEffect(() => {
    fetchPhoto();
  }, [fetchPhoto]);

  const handleDownload = async () => {
    if (!imageUrl || !id) return;
    try {
      const { db } = initializeFirebase();
      const docRef = doc(db, "photos", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await updateDoc(docRef, { isDownloaded: true });
      }

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
        text: 'My studio portrait from JNL Studio Booth!',
        url: window.location.href,
      });
    } catch (e) {}
  };

  return (
    <KioskLayout className="bg-zinc-950 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8 text-center">
        <JnlLogo variant="icon" className="mb-6 w-20 h-20" />
        
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
                <p className="text-white/80 font-black uppercase tracking-[0.3em] text-[10px]">Processing HD Buffer...</p>
                <p className="text-white/20 font-bold uppercase text-[8px]">Session sync in progress</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-24 space-y-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
              <p className="text-white/80 font-bold uppercase text-xs leading-relaxed max-w-[250px]">{error}</p>
              <NeonButton onClick={() => window.location.reload()} className="!py-4 mt-4 w-full text-sm">TRY AGAIN</NeonButton>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative aspect-[2/3] w-full rounded-[1.5rem] overflow-hidden shadow-inner border-4 border-white bg-zinc-950">
                <img 
                  src={imageUrl!} 
                  alt="Your HD Portrait" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-headline font-black italic uppercase text-primary tracking-tight">HD SOFT COPY</h2>
                  <div className="flex items-center justify-center gap-2 text-[7px] font-black uppercase text-white/20 tracking-[0.4em]">
                    <Activity className="w-2.5 h-2.5" /> CDN LINK VERIFIED
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

        {/* Branding N (Monogram) is hidden on soft-copy page for customers */}
        <p className="mt-12 text-[8px] font-black uppercase tracking-[0.6em] text-white/10">
          © JNL STUDIO PORTRAITS
        </p>
      </div>
    </KioskLayout>
  );
}
