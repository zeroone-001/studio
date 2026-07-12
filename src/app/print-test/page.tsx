"use client";

import React, { useState } from "react";
import { NeonButton } from "@/components/kiosk/neon-button";
import { AlertCircle, CheckCircle2, Loader2, Printer } from "lucide-react";

/**
 * MINIMAL PRINT VERIFICATION PAGE
 * Goal: Verify if Android Chrome can trigger NokoPrint via navigator.share
 * with zero app overhead.
 */
export default function PrintTestPage() {
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const runMinimalTest = async () => {
    setStatus("testing");
    addLog("Starting Minimal Test...");

    try {
      // 1. Create a dummy image
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");

      // Draw simple test content
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = "black";
      ctx.font = "bold 40px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SYSTEM TEST", 200, 180);
      ctx.font = "20px sans-serif";
      ctx.fillText(new Date().toLocaleString(), 200, 220);

      addLog("Canvas generated.");

      // 2. Convert to File object
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("Blob generation failed");
      
      const file = new File([blob], `TEST_PRINT_${Date.now()}.png`, { type: "image/png" });
      addLog(`File created: ${file.size} bytes`);

      // 3. Capability Check
      if (!navigator.share) {
        throw new Error("navigator.share is NOT supported in this browser.");
      }

      const canShare = navigator.canShare && navigator.canShare({ files: [file] });
      addLog(`navigator.canShare: ${canShare ? "YES" : "NO"}`);

      // 4. Trigger Intent
      addLog("Dispatching navigator.share...");
      await navigator.share({
        files: [file],
        title: "Test Print",
        text: "Testing NokoPrint Bridge"
      });

      addLog("INTENT SUCCESS: OS acknowledged the share.");
      setStatus("success");
    } catch (e: any) {
      const errorMsg = `${e.name}: ${e.message}`;
      addLog(`INTENT FAILED: ${errorMsg}`);
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black italic uppercase text-primary">Print Path Verify</h1>
          <p className="text-white/40 text-xs uppercase font-bold tracking-widest">Minimal Hardware Diagnostic</p>
        </div>

        <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <Printer className="w-10 h-10 text-primary" />
          </div>
          
          <NeonButton 
            onClick={runMinimalTest} 
            disabled={status === "testing"}
            className="w-full !py-8 text-xl"
          >
            {status === "testing" ? (
              <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> TESTING...</span>
            ) : "RUN MINIMAL TEST"}
          </NeonButton>
        </div>

        {status === "success" && (
          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl flex items-center gap-3 text-green-500 font-bold uppercase italic text-sm">
            <CheckCircle2 className="w-5 h-5" /> Test Dispatch Success
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-500 font-bold uppercase italic text-sm">
            <AlertCircle className="w-5 h-5" /> Test Dispatch Failed
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase text-white/30 tracking-widest">Execution Log</h3>
          <div className="bg-black border border-white/5 p-4 rounded-xl h-48 overflow-y-auto font-mono text-[9px] text-white/60 space-y-1">
            {log.length === 0 && <p className="opacity-30 italic">No activity yet...</p>}
            {log.map((entry, i) => (
              <p key={i} className={entry.includes("FAILED") ? "text-red-400" : entry.includes("SUCCESS") ? "text-green-400" : ""}>
                {entry}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
