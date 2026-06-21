
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { JnlLogo } from "@/components/kiosk/jnl-logo";
import { Download, Loader2, AlertCircle, Share2, Activity } from "lucide-react";

export default function RetrievePage() {
  const params = useParams();
  const id = params?.id as string;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrievalStats, setRetrievalStats] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!id) return;
      const startTime = performance.now();
      
      try {
        const { storage } = initializeFirebase();
        const photoRef = ref(storage, `photos/${id}.jpg`);
        // Instant direct URL fetch
        const url = await getDownloadURL(photoRef);
        const duration = performance.now() - startTime;
        
        setImageUrl(url);
        setRetrievalStats(`CDN Retrieval: ${duration.toFixed(0)}ms`);
        setLoading(false);
      } catch (err) {
        // Only retry once after 500ms if initial load fails (likely a race condition with slow internet)
        setTimeout(async () => {
          try {
            const { storage } = initializeFirebase();
            const photoRef = ref(storage, `photos/${id}.jpg`);
            const url = await getDownloadURL(photoRef);
            setImageUrl(url);
            setLoading(false);
          } catch (e) {
            setError("Your photo is being finalized. Please refresh in a moment.");
            setLoading(false);
          }
        }, 500);
      }
    };

    fetchPhoto();
  }, [id]);

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
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
        text: 'Check out my studio portrait from JNL Studio Booth!',
        url: window.location.href,
      });
    } catch (e) {}
  };

  return (
    <KioskLayout className="bg-zinc-950 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-12 text-center">
        <JnlLogo variant="icon" className="mb-8 w-24 h-24 animate-in fade-in zoom-in duration-700" />
        
        <div className="w-full max-w-lg bg-zinc-900 border border-white/10 p-6 sm:p-10 rounded-[3rem] shadow-2xl backdrop-blur-3xl animate-in slide-in-from-bottom-12 duration-700">
          {loading ? (
            <div className="flex flex-col items-center py-20 space-y-6">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px]">Connecting to Studio CDN...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-20 space-y-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
              <p className="text-white/80 font-bold uppercase text-sm leading-relaxed">{error}</p>
              <NeonButton onClick={() => window.location.reload()} className="!py-4 mt-4 w-full">TRY AGAIN</NeonButton>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="relative aspect-[2/3] w-full rounded-[2rem] overflow-hidden shadow-inner border-4 border-white bg-zinc-950">
                <img 
                  src={imageUrl!} 
                  alt="Your HD Portrait" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-headline font-black italic uppercase text-primary tracking-tight">HD SOFT COPY</h2>
                  {retrievalStats && (
                    <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase text-white/30 tracking-[0.4em]">
                      <Activity className="w-3 h-3" /> {retrievalStats}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NeonButton onClick={handleDownload} className="w-full flex items-center justify-center gap-3 !py-6 text-lg">
                    <Download className="w-6 h-6" /> SAVE
                  </NeonButton>
                  <button 
                    onClick={handleShare}
                    className="w-full border-4 border-white font-headline font-black text-lg py-6 italic uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                  >
                    <Share2 className="w-6 h-6" /> SHARE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="mt-16 mb-8 text-[9px] font-black uppercase tracking-[0.6em] text-white/10">
          © JNL STUDIO PORTRAITS
        </p>
      </div>
    </KioskLayout>
  );
}
