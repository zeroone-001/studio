
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface NeonButtonProps extends ButtonProps {
  glow?: boolean;
}

export function NeonButton({ className, glow = true, children, ...props }: NeonButtonProps) {
  return (
    <Button
      className={cn(
        "relative font-headline font-bold text-lg py-8 px-10 transition-all active:scale-95 uppercase tracking-widest",
        "bg-primary hover:bg-primary/90 text-white border-2 border-primary rounded-none",
        glow && "neon-border shadow-[0_0_15px_rgba(255,51,153,0.5)]",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
