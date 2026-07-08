
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { KioskLayout } from "@/components/kiosk/kiosk-layout";
import { NeonButton } from "@/components/kiosk/neon-button";
import { Download, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";

/**
 * Public Retrieval Page.
 * Strictly login-free. Uses high-frequency polling to detect successful kiosk upload.
 */
export default function RetrievePage() {
  const params = useParams();
  const id = params?.id as string;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'verifying' | 'syncing' | 'complete'>('verifying');
  const retryCount = useRef(0);
  const MAX_RETRIES = 120; // 60 seconds at 500ms intervals

  const fetchPhoto = useCallback(async () => {
    if (!id) return;
    
    try {
      const { storage, db } = initializeFirebase();
      const docRef = doc(db, "photos", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Prefer the stored downloadUrl if available for instant performance
        if (data.status === 'complete' && data.downloadUrl) {
          setImageUrl(data.downloadUrl);
          setLoading(false);
          setStatus('complete');
          return;
        }

        // Fallback to manual URL generation if binary is uploaded but URL not in doc
        const photoRef = ref(storage, `photos/${id}.jpg`);
        try {
          const url = await getDownloadURL(photoRef);
          setImageUrl(url);
          setLoading(false);
          setStatus('complete');
          return;
        } catch (e: any) {
          // Binary not ready yet or rules blocking
          setStatus('syncing');
        }
      }

      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        setTimeout(fetchPhoto, 500); 
      } else {
        setError("Your photo sync is taking longer than expected. Please check your connection.");
        setLoading(false);
      }
    } catch (err: any) {
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        setTimeout(fetchPhoto, 1000);
      } else {
        setError("Unable to connect to JNL Cloud. Please try refreshing.");
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
      // Track download status for admin analytics
      updateDoc(doc(db, "photos", id), { isDownloaded: true });
      
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
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <ImageIcon className="w-6 h-6 text-white/20 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-white text-xl font-black uppercase italic">Preparing Soft Copy...</p>
                  <p className="text-white/40 text-[10px] font-bold uppercase italic tracking-widest">Inihahanda ang iyong larawan...</p>
                </div>
                {status === 'syncing' && (
                  <p className="text-primary text-[10px] font-black uppercase italic animate-pulse">Syncing High-Res Version...</p>
                )}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-20 space-y-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
              <div className="space-y-2">
                <p className="text-white/80 font-black uppercase italic text-lg">Transmission Issue</p>
                <p className="text-white/40 font-bold uppercase text-[10px]">{error}</p>
              </div>
              <NeonButton onClick={() => window.location.reload()} className="w-full !py-6">RETRY</NeonButton>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative aspect-[2/3] w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white">
                <img src={imageUrl!} alt="Portrait" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black italic uppercase text-primary">HD SOFT COPY</h2>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Available for 24 Hours Only</p>
                </div>
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
