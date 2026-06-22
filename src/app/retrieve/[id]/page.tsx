
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
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
        
        // Instant direct fetch from Firebase Storage CDN
        const url = await getDownloadURL(photoRef);
        const duration = performance.now() - startTime;
        
        setImageUrl(url);
        setRetrievalStats(`CDN Response: ${duration.toFixed(0)}ms`);
        setLoading(false);
      } catch (err) {
        setError("Finalizing HD portrait... refresh in 3s.");
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [id]);

  const handleDownload = async () => {
    if (!imageUrl || !id) return;
    try {
      const { db } = initializeFirebase();
      // Track successful download interaction
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
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">Fetching HD Soft Copy...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-24 space-y-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
              <p className="text-white/80 font-bold uppercase text-xs leading-relaxed max-w-[250px]">{error}</p>
              <NeonButton onClick={() => window.location.reload()} className="!py-4 mt-4 w-full text-sm">TRY AGAIN</NeonButton>
            </div>
          ) : (
            <div className="space-y-8">
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
                  {retrievalStats && (
                    <div className="flex items-center justify-center gap-2 text-[7px] font-black uppercase text-white/20 tracking-[0.4em]">
                      <Activity className="w-2.5 h-2.5" /> {retrievalStats}
                    </div>
                  )}
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

        <p className="mt-12 text-[8px] font-black uppercase tracking-[0.6em] text-white/10">
          © JNL STUDIO PORTRAITS
        </p>
      </div>
    </KioskLayout>
  );
}
