
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { JnlLogo } from "@/components/kiosk/jnl-logo";
import { Download, Loader2, AlertCircle } from "lucide-react";

export default function RetrievePage() {
  const params = useParams();
  const id = params?.id as string;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!id) return;
      try {
        const { storage } = initializeFirebase();
        const photoRef = ref(storage, `photos/${id}.jpg`);
        // Using high priority retrieval
        const url = await getDownloadURL(photoRef);
        setImageUrl(url);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Your photo is still being processed. Please refresh in a moment.");
      } finally {
        setLoading(false);
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
      a.download = `JNL_Studio_${id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <KioskLayout className="bg-zinc-950">
      <div className="flex flex-col items-center justify-center min-h-screen w-full px-6 py-12 text-center overflow-y-auto scrollbar-hide">
        <JnlLogo variant="icon" className="mb-8 w-20 h-20" />
        
        <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-500">
          {loading ? (
            <div className="flex flex-col items-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-white/60 font-black uppercase tracking-widest text-[10px]">Retrieving Memory...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-12 space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-white/80 font-bold uppercase text-sm">{error}</p>
              <NeonButton onClick={() => window.location.reload()} className="!py-4 mt-4">Refresh</NeonButton>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-zinc-900">
                <img 
                  src={imageUrl!} 
                  alt="Your Portrait" 
                  className="w-full h-full object-contain"
                  onLoad={() => setLoading(false)}
                />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-headline font-black italic uppercase text-primary">Your Studio Copy</h2>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Digital Download Ready</p>
                
                <NeonButton onClick={handleDownload} className="w-full flex items-center justify-center gap-2 !py-6">
                  <Download className="w-5 h-5" /> Download HD
                </NeonButton>
              </div>
            </div>
          )}
        </div>

        <p className="mt-12 mb-8 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
          © JNL STUDIO PHOTOBOOTH
        </p>
      </div>
    </KioskLayout>
  );
}
