
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NeonButton } from "./neon-button";
import { ShieldCheck, Lock } from "lucide-react";

interface AdminAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export function AdminAuthDialog({ isOpen, onClose, onAuthSuccess }: AdminAuthDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default Owner PIN for the photobooth
    if (pin === "2580") { 
      onAuthSuccess();
      setPin("");
      onClose();
      setError(false);
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-white/20 sm:max-w-md p-8">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/40">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-3xl font-headline font-black italic uppercase">Admin Access</DialogTitle>
          <DialogDescription className="text-white/40 uppercase font-bold text-[10px] tracking-widest mt-2">
            Secure authentication required for owner test mode
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="relative">
            <Input
              type="password"
              placeholder="ENTER SECURE PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className={cn(
                "h-16 text-center text-3xl font-black tracking-[1em] bg-white/5 border-2 rounded-none focus-visible:ring-primary",
                error ? "border-red-500 animate-shake" : "border-white/20"
              )}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-[10px] font-black uppercase text-center mt-2 animate-bounce">
                INVALID CREDENTIALS
              </p>
            )}
          </div>

          <DialogFooter>
            <NeonButton type="submit" className="w-full !py-6">
              VERIFY OWNER
            </NeonButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { cn } from "@/lib/utils";
