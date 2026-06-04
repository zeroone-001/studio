
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface JnlLogoProps {
  variant?: "hero" | "watermark" | "admin" | "icon";
  color?: "dark" | "light" | "pink";
  className?: string;
}

export function JnlLogo({ variant = "hero", color = "light", className }: JnlLogoProps) {
  const isHero = variant === "hero";
  const isIcon = variant === "icon";
  const isWatermark = variant === "watermark";
  
  const colors = {
    light: { main: "white", accent: "#FF3399" },
    dark: { main: "black", accent: "#FF3399" },
    pink: { main: "#FF3399", accent: "white" }
  };

  const activeColors = colors[color];

  if (isIcon) {
    return (
      <svg viewBox="0 0 100 100" className={cn("w-12 h-12", className)}>
        <circle cx="50" cy="50" r="48" fill="none" stroke={activeColors.main} strokeWidth="1" />
        <path 
          d="M35 30 V60 C35 65 40 70 45 70 M55 30 V70 M65 30 V70 H75" 
          fill="none" 
          stroke={activeColors.accent} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
      </svg>
    );
  }

  return (
    <div className={cn("flex flex-col items-center select-none", className)}>
      {/* Custom Monogram Icon */}
      {!isWatermark && (
        <div className={cn("relative mb-2", isHero ? "w-24 h-24" : "w-10 h-10")}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="5" y="5" width="90" height="90" fill="none" stroke={activeColors.main} strokeWidth="0.5" opacity="0.5" transform="rotate(45 50 50)" />
            <path 
              d="M35 35 V60 C35 65 38 68 42 68 M50 32 V68 M58 32 V68 H68" 
              fill="none" 
              stroke={activeColors.accent} 
              strokeWidth="3" 
              strokeLinecap="round" 
              className={isHero ? "animate-pulse" : ""}
            />
          </svg>
        </div>
      )}

      {/* Main Typography - Added gap to prevent italic overlap */}
      <div className="text-center">
        <h1 
          className={cn(
            "font-headline font-black tracking-tight uppercase italic leading-none flex items-center justify-center",
            isHero ? "text-6xl gap-4" : isWatermark ? "text-lg gap-2" : "text-xl gap-2"
          )}
          style={{ color: activeColors.main }}
        >
          <span>JNL</span>
          <span style={{ color: activeColors.accent }}>STUDIO</span>
        </h1>
        {variant !== "watermark" && (
          <p 
            className={cn(
              "font-bold tracking-[0.4em] uppercase opacity-60 mt-1",
              isHero ? "text-sm" : "text-[8px]"
            )}
            style={{ color: activeColors.main }}
          >
            PHOTOBOOTH
          </p>
        )}
      </div>
    </div>
  );
}
