
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { initializeFirebase } from "@/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NeonButton } from "@/components/kiosk/neon-button";
import { Download, Loader2, AlertCircle, Image as ImageIcon, RefreshCcw } from "lucide-react";

/**
 * Public Retrieval Client Component.
 * Contains the logic for fetching and downloading photos.
 */
export default function RetrieveClient() {
  const params = useParams();
  const id = params?.id as string;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'verifying' | 'syncing' | 'complete'>('verifying');
  const retryCount = useRef(0);
  const MAX_RETRIES = 120; 

  const fetchPhoto = useCallback(async () => {
    if (!id || id === 'placeholder') return;
    console.log(`[RETRIEVAL_DIAG] --- FETCH START (${id}) ---`);
    
    try {
      const { storage, db } = initializeFirebase();
      const docRef = doc(db, "photos", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`[RETRIEVAL_DIAG] Firestore Found. Status: ${data.status}`);
        
        if (data.status === 'complete' && data.downloadUrl) {
          setImageUrl(data.downloadUrl);
          setLoading(false);
          setStatus('complete');
          return;
        }
        setStatus('syncing');
      } else {
        console.log(`[RETRIEVAL_DIAG] Document not yet created in Firestore.`);
      }

      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        setTimeout(fetchPhoto, 1000); 
      } else {
        setError("Your photo sync is taking longer than expected. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(`[RETRIEVAL_DIAG] Connection Error: ${err.message}`);
      setError("Unable to connect to JNL Cloud.");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPhoto();
  }, [fetchPhoto]);

  const handleDownload = async () => {
    if (!imageUrl || !id) return;

    console.log("[RETRIEVAL_DIAG] --- DOWNLOAD CLICKED ---");
    
    try {
      const { db } = initializeFirebase();
      updateDoc(doc(db, "photos", id), { isDownloaded: true }).catch(() => {});
      
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('CORS or Network Block');
      
      const blob = await response.blob();
      console.log(`[RETRIEVAL_DIAG] Blob verified: ${blob.size} bytes`);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JNL_Studio_Portrait_${id}.jpg`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (e: any) {
      console.warn("[RETRIEVAL_DIAG] Save-As link failed, using fallback tab open");
      window.open(imageUrl, '_blank');
    }
  };

  const handleRetry = () => {
    retryCount.current = 0;
    setError(null);
    setLoading(true);
    fetchPhoto();
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white overflow-y-auto selection:bg-primary/30">
      <div className="flex flex-col items-center justify-start w-full px-4 py-12 text-center">
        <div className="w-full max-w-lg bg-zinc-900 border border-white/10 p-8 rounded-[3rem] shadow-2xl mb-12">
          
          <div className="relative aspect-[2/3] w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-white mb-8">
            {imageUrl ? (
              <img src={imageUrl} alt="Portrait" className="w-full h-full object-contain animate-in fade-in duration-500" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-zinc-100 text-zinc-400 space-y-4">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <ImageIcon className="w-6 h-6 text-zinc-300 absolute inset-0 m-auto" />
                </div>
                <p className="text-[10px] font-black uppercase italic tracking-widest animate-pulse">Syncing HD Version...</p>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-black italic uppercase text-primary leading-none">HD SOFT COPY</h2>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Available for 10 Minutes Only</p>
            </div>

            <div className="flex flex-col gap-4">
              {imageUrl ? (
                <>
                  <NeonButton onClick={handleDownload} className="w-full flex items-center justify-center gap-3 !py-6 text-xl animate-in zoom-in-95">
                    <Download className="w-6 h-6" /> DOWNLOAD NOW
                  </NeonButton>
                  <p className="text-white/40 text-[10px] font-bold uppercase italic">Tip: Long press image to save directly</p>
                </>
              ) : error ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-2 py-2 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-white/80 font-black uppercase italic text-xs px-4">{error}</p>
                  </div>
                  <NeonButton onClick={handleRetry} className="w-full flex items-center justify-center gap-3 !py-6 text-xl">
                    <RefreshCcw className="w-5 h-5" /> RETRY SYNC
                  </NeonButton>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="py-2">
                    <p className="text-primary text-[10px] font-black uppercase italic animate-pulse">Still Processing...</p>
                    <p className="text-white/20 text-[8px] font-bold uppercase">Transmitting from JNL Booth</p>
                  </div>
                  <NeonButton disabled className="w-full flex items-center justify-center gap-3 !py-6 text-xl opacity-50 grayscale cursor-not-allowed">
                    <Loader2 className="w-5 h-5 animate-spin" /> SYNCING...
                  </NeonButton>
                </div>
              )}
            </div>

            <div className="pt-2">
              <p className="text-primary/60 text-[8px] font-black uppercase tracking-tighter">JNL STUDIO CLOUD SYNCED</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
