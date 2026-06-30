
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
  const [status, setStatus] = useState<'verifying' | 'syncing' | 'complete'>('verifying');
  const retryCount = useRef(0);
  const MAX_RETRIES = 120; // 60 seconds of polling at 500ms intervals

  const fetchPhoto = useCallback(async () => {
    if (!id) return;
    
    try {
      const { storage, db } = initializeFirebase();
      const docRef = doc(db, "photos", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const photoRef = ref(storage, `photos/${id}.jpg`);
        try {
          const url = await getDownloadURL(photoRef);
          setImageUrl(url);
          setLoading(false);
          setStatus('complete');
          return;
        } catch (e) {
          // File not uploaded yet
          setStatus('syncing');
        }
      }

      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        setTimeout(fetchPhoto, 500); 
      } else {
        setError("Your photo is still being processed. Please refresh in a moment.");
        setLoading(false);
      }
    } catch (err: any) {
      setError("Connection issue. Please try again.");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPhoto();
  }, [fetchPhoto]);

  const handleDownload = async () => {
    if (!imageUrl || !id) return;
    try {
      const { db } = initializeFirebase();
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
    } catch (e) {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <KioskLayout className="bg-zinc-950 overflow-y-auto">
      <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8 text-center">
        <div className="w-full max-w-lg bg-zinc-900 border border-white/10 p-8 rounded-[3rem] shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center py-20 space-y-8">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <div className="space-y-2">
                <p className="text-white text-xl font-black uppercase italic">Preparing your photo...</p>
                <p className="text-white/40 text-[10px] font-bold uppercase italic">Inihahanda ang iyong larawan...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-20 space-y-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
              <p className="text-white/80 font-bold uppercase text-xs">{error}</p>
              <NeonButton onClick={() => window.location.reload()} className="w-full">RETRY</NeonButton>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative aspect-[2/3] w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white">
                <img src={imageUrl!} alt="Portrait" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-black italic uppercase text-primary">HD SOFT COPY</h2>
                <NeonButton onClick={handleDownload} className="w-full flex items-center justify-center gap-3 !py-6 text-xl">
                  <Download className="w-6 h-6" /> DOWNLOAD NOW
                </NeonButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </KioskLayout>
  );
}
