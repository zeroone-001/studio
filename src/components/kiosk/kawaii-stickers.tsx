
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface KawaiiProps {
  className?: string;
}

// 1. HEARTS
export const PuffyHeart = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
        <feOffset dx="1" dy="2" result="offsetblur" />
        <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <path 
      d="M50 88C50 88 10 65 10 38C10 20 28 10 42 22C45 25 48 30 50 32C52 30 55 25 58 22C72 10 90 20 90 38C90 65 50 88 50 88Z" 
      fill="#FFB7CE" 
      stroke="white" 
      strokeWidth="6"
      strokeLinejoin="round"
      filter="url(#shadow)"
    />
    <path d="M30 30C35 25 40 25 45 35" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const RibbonHeart = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 85C50 85 15 65 15 40C15 25 30 15 42 25C45 28 48 32 50 35C52 32 55 28 58 25C70 15 85 25 85 40C85 65 50 85 50 85Z" fill="#FFD1DC" stroke="white" strokeWidth="6" />
    <path d="M35 55L65 55M40 50L60 60M40 60L60 50" fill="none" stroke="#FF3399" strokeWidth="2" opacity="0.4" />
  </svg>
);

// 2. CUTE OBJECTS
export const KawaiiBunny = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <ellipse cx="35" cy="25" rx="10" ry="20" fill="white" stroke="#FFE4E1" strokeWidth="2" transform="rotate(-15 35 25)" />
    <ellipse cx="65" cy="25" rx="10" ry="20" fill="white" stroke="#FFE4E1" strokeWidth="2" transform="rotate(15 65 25)" />
    <circle cx="50" cy="60" r="30" fill="white" stroke="#FFE4E1" strokeWidth="4" />
    <circle cx="40" cy="60" r="3" fill="#333" />
    <circle cx="60" cy="60" r="3" fill="#333" />
    <circle cx="30" cy="65" r="5" fill="#FFB7CE" opacity="0.5" />
    <circle cx="70" cy="65" r="5" fill="#FFB7CE" opacity="0.5" />
    <path d="M48 70C48 70 49 72 50 72C51 72 52 70 52 70" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const TeddyBear = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="30" cy="30" r="12" fill="#D2B48C" stroke="white" strokeWidth="4" />
    <circle cx="70" cy="30" r="12" fill="#D2B48C" stroke="white" strokeWidth="4" />
    <circle cx="50" cy="55" r="35" fill="#D2B48C" stroke="white" strokeWidth="4" />
    <circle cx="50" cy="60" r="12" fill="white" opacity="0.4" />
    <circle cx="40" cy="50" r="2.5" fill="#333" />
    <circle cx="60" cy="50" r="2.5" fill="#333" />
    <circle cx="30" cy="55" r="4" fill="#FFB7CE" opacity="0.4" />
    <circle cx="70" cy="55" r="4" fill="#FFB7CE" opacity="0.4" />
  </svg>
);

export const KawaiiPanda = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="30" cy="30" r="12" fill="#333" />
    <circle cx="70" cy="30" r="12" fill="#333" />
    <circle cx="50" cy="60" r="35" fill="white" stroke="#333" strokeWidth="4" />
    <ellipse cx="40" cy="55" rx="8" ry="10" fill="#333" />
    <ellipse cx="60" cy="55" rx="8" ry="10" fill="#333" />
    <circle cx="40" cy="53" r="2" fill="white" />
    <circle cx="60" cy="53" r="2" fill="white" />
    <circle cx="50" cy="68" r="4" fill="#333" />
  </svg>
);

// 3. AESTHETIC
export const KawaiiCloud = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M25 65C15 65 15 50 25 50C25 35 45 35 50 45C55 35 75 35 75 50C85 50 85 65 75 65H25Z" fill="white" stroke="#E6E6FA" strokeWidth="4" />
    <circle cx="35" cy="55" r="1.5" fill="#333" />
    <circle cx="65" cy="55" r="1.5" fill="#333" />
    <circle cx="28" cy="58" r="3" fill="#FFD1DC" opacity="0.5" />
    <circle cx="72" cy="58" r="3" fill="#FFD1DC" opacity="0.5" />
  </svg>
);

export const PastelSparkle = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 10L55 45L90 50L55 55L50 90L45 55L10 50L45 45Z" fill="#FFF44F" stroke="white" strokeWidth="4" />
  </svg>
);

export const RainbowSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 60" className={cn("w-full h-full", className)}>
    <path d="M10 50C10 20 90 20 90 50" fill="none" stroke="#FF3399" strokeWidth="10" />
    <path d="M20 50C20 30 80 30 80 50" fill="none" stroke="#FFD1DC" strokeWidth="10" />
    <path d="M30 50C30 40 70 40 70 50" fill="none" stroke="#E6E6FA" strokeWidth="10" />
  </svg>
);

// 4. TEXT STICKERS
export const SlayText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 120 60" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#FF3399" stroke="white" strokeWidth="4" paintOrder="stroke" style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '32px' }}>SLAY</text>
  </svg>
);

export const CutieText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 120 60" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#FFB7CE" stroke="white" strokeWidth="4" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '28px' }}>CUTIE</text>
  </svg>
);

export const BestiesText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 140 60" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#E6E6FA" stroke="white" strokeWidth="4" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '24px' }}>BESTIES</text>
  </svg>
);
