
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface KawaiiProps {
  className?: string;
}

// --- HEARTS (Puffy Style) ---
export const PuffyHeart = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <defs>
      <radialGradient id="grad-puffy-heart" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
      </radialGradient>
    </defs>
    <path d="M50 88C50 88 10 65 10 38C10 20 28 10 42 22C45 25 48 30 50 32C52 30 55 25 58 22C72 10 90 20 90 38C90 65 50 88 50 88Z" fill="url(#grad-puffy-heart)" stroke="white" strokeWidth="4" />
    <ellipse cx="40" cy="35" rx="8" ry="4" fill="white" opacity="0.4" transform="rotate(-30 40 35)" />
  </svg>
);

export const RibbonHeart = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 85C50 85 15 65 15 40C15 25 30 15 42 25C45 28 48 32 50 35C52 32 55 28 58 25C70 15 85 25 85 40C85 65 50 85 50 85Z" fill="currentColor" stroke="white" strokeWidth="4" />
    <path d="M50 35C50 35 45 45 35 55M50 35C50 35 55 45 65 55" stroke="white" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const DoubleHeart = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M40 70C40 70 10 55 10 35C10 20 25 15 35 25C40 30 40 70 40 70Z" fill="currentColor" opacity="0.6" stroke="white" strokeWidth="2" />
    <path d="M60 80C60 80 20 60 20 35C20 15 45 10 55 25C60 30 60 80 60 80Z" fill="currentColor" stroke="white" strokeWidth="3" />
  </svg>
);

export const SparkleHeart = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 80C50 80 15 60 15 35C15 20 30 15 42 25C50 30 50 80 50 80Z" fill="currentColor" />
    <path d="M50 80C50 80 85 60 85 35C85 20 70 15 58 25C50 30 50 80 50 80Z" fill="currentColor" opacity="0.8" />
    <path d="M20 20L25 30L30 20L25 10Z" fill="white" />
    <path d="M75 40L80 50L85 40L80 30Z" fill="white" />
  </svg>
);

export const WingedHeart = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 120 80" className={cn("w-full h-full", className)}>
    <path d="M25 40Q5 20 30 10T50 40" fill="white" opacity="0.5" stroke="white" strokeWidth="2" />
    <path d="M95 40Q115 20 90 10T70 40" fill="white" opacity="0.5" stroke="white" strokeWidth="2" />
    <path d="M60 70C60 70 30 55 30 35C30 20 45 15 55 25C60 30 60 70 60 70C60 70 65 30 70 25C80 15 95 20 95 35C95 55 60 70 60 70Z" fill="currentColor" stroke="white" strokeWidth="3" />
  </svg>
);

// --- COQUETTE BOWS ---
export const CoquetteBow = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 80" className={cn("w-full h-full", className)}>
    <path d="M50 40Q30 10 10 40T30 70L50 40" fill="currentColor" stroke="white" strokeWidth="3" />
    <path d="M50 40Q70 10 90 40T70 70L50 40" fill="currentColor" stroke="white" strokeWidth="3" />
    <circle cx="50" cy="40" r="8" fill="currentColor" stroke="white" strokeWidth="3" />
    <path d="M40 70L30 95M60 70L70 95" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

// --- ANIMALS ---
export const KawaiiBunny = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <ellipse cx="35" cy="25" rx="10" ry="25" fill="white" transform="rotate(-15 35 25)" stroke="currentColor" strokeWidth="2" />
    <ellipse cx="65" cy="25" rx="10" ry="25" fill="white" transform="rotate(15 65 25)" stroke="currentColor" strokeWidth="2" />
    <circle cx="50" cy="65" r="35" fill="white" stroke="currentColor" strokeWidth="3" />
    <circle cx="38" cy="60" r="4" fill="#333" />
    <circle cx="62" cy="60" r="4" fill="#333" />
    <ellipse cx="50" cy="68" rx="5" ry="3" fill="#FF99CC" />
    <path d="M45 75Q50 80 55 75" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TeddyBear = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="25" cy="30" r="15" fill="currentColor" stroke="white" strokeWidth="2" />
    <circle cx="75" cy="30" r="15" fill="currentColor" stroke="white" strokeWidth="2" />
    <circle cx="50" cy="65" r="40" fill="currentColor" stroke="white" strokeWidth="4" />
    <circle cx="38" cy="58" r="3.5" fill="black" />
    <circle cx="62" cy="58" r="3.5" fill="black" />
    <ellipse cx="50" cy="68" rx="12" ry="10" fill="white" opacity="0.3" />
    <path d="M48 68Q50 70 52 68" fill="none" stroke="black" strokeWidth="2" />
  </svg>
);

export const KawaiiPanda = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="25" cy="30" r="15" fill="#222" />
    <circle cx="75" cy="30" r="15" fill="#222" />
    <circle cx="50" cy="65" r="40" fill="white" stroke="#222" strokeWidth="4" />
    <ellipse cx="35" cy="58" rx="10" ry="12" fill="#222" />
    <ellipse cx="65" cy="58" rx="10" ry="12" fill="#222" />
    <circle cx="35" cy="56" r="3" fill="white" />
    <circle cx="65" cy="56" r="3" fill="white" />
    <path d="M47 75Q50 78 53 75" fill="none" stroke="#222" strokeWidth="2" />
  </svg>
);

export const KawaiiCat = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M20 40L35 15L50 40Z" fill="currentColor" stroke="white" strokeWidth="2" />
    <path d="M80 40L65 15L50 40Z" fill="currentColor" stroke="white" strokeWidth="2" />
    <circle cx="50" cy="65" r="40" fill="currentColor" stroke="white" strokeWidth="4" />
    <circle cx="35" cy="58" r="3" fill="white" />
    <circle cx="65" cy="58" r="3" fill="white" />
    <path d="M30 65L20 62M70 65L80 62" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <path d="M48 72Q50 75 52 72" fill="none" stroke="white" strokeWidth="2" />
  </svg>
);

export const KawaiiFrog = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="30" cy="30" r="18" fill="currentColor" stroke="black" strokeWidth="2" />
    <circle cx="70" cy="30" r="18" fill="currentColor" stroke="black" strokeWidth="2" />
    <ellipse cx="50" cy="65" rx="45" ry="35" fill="currentColor" stroke="black" strokeWidth="3" />
    <circle cx="30" cy="30" r="6" fill="black" />
    <circle cx="70" cy="30" r="6" fill="black" />
    <path d="M40 75Q50 85 60 75" fill="none" stroke="black" strokeWidth="4" />
    <ellipse cx="20" cy="60" rx="8" ry="5" fill="#FF99CC" opacity="0.6" />
    <ellipse cx="80" cy="60" rx="8" ry="5" fill="#FF99CC" opacity="0.6" />
  </svg>
);

export const KawaiiChick = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="60" r="40" fill="#FFEB3B" stroke="white" strokeWidth="3" />
    <circle cx="38" cy="55" r="4" fill="black" />
    <circle cx="62" cy="55" r="4" fill="black" />
    <path d="M45 68L50 75L55 68Z" fill="#FF9800" />
    <ellipse cx="25" cy="65" rx="6" ry="4" fill="#FFCDD2" />
    <ellipse cx="75" cy="65" rx="6" ry="4" fill="#FFCDD2" />
  </svg>
);

export const KawaiiPenguin = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <ellipse cx="50" cy="60" rx="40" ry="45" fill="#212121" />
    <ellipse cx="50" cy="65" rx="30" ry="35" fill="white" />
    <circle cx="38" cy="48" r="4" fill="white" />
    <circle cx="62" cy="48" r="4" fill="white" />
    <path d="M45 58L50 65L55 58Z" fill="#FF9800" />
  </svg>
);

export const KawaiiFox = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M10 40L30 10L50 40Z" fill="#FF7043" stroke="white" strokeWidth="2" />
    <path d="M90 40L70 10L50 40Z" fill="#FF7043" stroke="white" strokeWidth="2" />
    <circle cx="50" cy="65" r="40" fill="#FF7043" stroke="white" strokeWidth="4" />
    <ellipse cx="50" cy="75" rx="25" ry="18" fill="white" />
    <circle cx="38" cy="58" r="3" fill="black" />
    <circle cx="62" cy="58" r="3" fill="black" />
    <path d="M48 80Q50 82 52 80" fill="none" stroke="black" strokeWidth="2" />
  </svg>
);

export const KawaiiKoala = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="20" cy="40" r="18" fill="#9E9E9E" stroke="white" strokeWidth="2" />
    <circle cx="80" cy="40" r="18" fill="#9E9E9E" stroke="white" strokeWidth="2" />
    <circle cx="50" cy="65" r="40" fill="#9E9E9E" stroke="white" strokeWidth="4" />
    <ellipse cx="50" cy="65" rx="10" ry="15" fill="#424242" />
    <circle cx="35" cy="55" r="3.5" fill="black" />
    <circle cx="65" cy="55" r="3.5" fill="black" />
  </svg>
);

export const KawaiiPig = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="65" r="40" fill="#F8BBD0" stroke="white" strokeWidth="4" />
    <ellipse cx="50" cy="72" rx="15" ry="10" fill="#F48FB1" stroke="white" strokeWidth="2" />
    <circle cx="45" cy="72" r="2.5" fill="#880E4F" />
    <circle cx="55" cy="72" r="2.5" fill="#880E4F" />
    <circle cx="35" cy="58" r="4" fill="black" />
    <circle cx="65" cy="58" r="4" fill="black" />
  </svg>
);

// --- FOOD & DRINK ---
export const SushiSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <rect x="15" y="55" width="70" height="35" rx="10" fill="white" stroke="#333" strokeWidth="4" />
    <rect x="15" y="45" width="70" height="15" rx="5" fill="#FF6347" stroke="#333" strokeWidth="3" />
    <circle cx="35" cy="72" r="2.5" fill="#333" />
    <circle cx="65" cy="72" r="2.5" fill="#333" />
  </svg>
);

export const IceCreamSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 95L25 60H75L50 95Z" fill="#DEB887" stroke="#8B4513" strokeWidth="2" />
    <circle cx="50" cy="40" r="30" fill="#FFB7CE" stroke="white" strokeWidth="3" />
    <circle cx="42" cy="35" r="3" fill="#333" />
    <circle cx="58" cy="35" r="3" fill="#333" />
    <path d="M45 45Q50 50 55 45" fill="none" stroke="#333" strokeWidth="2" />
  </svg>
);

export const BobaSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <rect x="25" y="30" width="50" height="65" rx="8" fill="#E1F5FE" stroke="#333" strokeWidth="3" />
    <rect x="45" y="5" width="8" height="35" fill="#FF4081" stroke="#333" strokeWidth="2" />
    <circle cx="35" cy="80" r="5" fill="#333" />
    <circle cx="50" cy="85" r="5" fill="#333" />
    <circle cx="65" cy="80" r="5" fill="#333" />
    <rect x="25" y="25" width="50" height="10" rx="3" fill="#333" />
  </svg>
);

export const DonutSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="50" r="45" fill="#FF8A65" stroke="#D84315" strokeWidth="3" />
    <circle cx="50" cy="50" r="18" fill="white" stroke="#D84315" strokeWidth="3" />
    <path d="M25 35L30 30M70 45L75 40M40 75L45 80" stroke="white" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const CupcakeSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M25 65L35 95H65L75 65" fill="#BCAAA4" stroke="#5D4037" strokeWidth="3" />
    <path d="M20 65C20 40 80 40 80 65Z" fill="#F48FB1" stroke="white" strokeWidth="3" />
    <circle cx="50" cy="38" r="10" fill="#F44336" stroke="white" strokeWidth="2" />
  </svg>
);

export const PizzaSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 5L5 85H95L50 5Z" fill="#FFF176" stroke="#F57F17" strokeWidth="4" />
    <circle cx="45" cy="40" r="6" fill="#E53935" />
    <circle cx="65" cy="65" r="6" fill="#E53935" />
    <circle cx="30" cy="75" r="6" fill="#E53935" />
  </svg>
);

export const StrawberrySticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 95C30 95 15 75 15 50C15 25 50 15 50 15C50 15 85 25 85 50C85 75 70 95 50 95Z" fill="#E91E63" stroke="white" strokeWidth="4" />
    <path d="M35 25L50 5L65 25" fill="#4CAF50" stroke="white" strokeWidth="2" />
    <circle cx="35" cy="55" r="2" fill="white" />
    <circle cx="65" cy="70" r="2" fill="white" />
    <circle cx="50" cy="40" r="2" fill="white" />
  </svg>
);

export const CherrySticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 20Q65 5 80 45" fill="none" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" />
    <path d="M50 20Q35 5 20 45" fill="none" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" />
    <circle cx="20" cy="65" r="25" fill="#D32F2F" stroke="white" strokeWidth="3" />
    <circle cx="80" cy="65" r="25" fill="#D32F2F" stroke="white" strokeWidth="3" />
  </svg>
);

export const PeachSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 95C30 95 5 75 5 50C5 25 30 15 50 25C70 15 95 25 95 50C95 75 70 95 50 95Z" fill="#FFAB91" stroke="white" strokeWidth="4" />
    <path d="M50 25V10" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

export const MilkSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M25 35L30 15H70L75 35V95H25V35Z" fill="white" stroke="#2196F3" strokeWidth="4" />
    <text x="50" y="70" textAnchor="middle" fill="#2196F3" fontSize="18" fontWeight="900">MILK</text>
    <rect x="25" y="35" width="50" height="5" fill="#2196F3" />
  </svg>
);

// --- AESTHETIC ---
export const KawaiiCloud = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M20 70C10 70 10 55 20 55C20 40 45 40 50 50C55 40 80 40 80 55C90 55 90 70 80 70H20Z" fill="white" stroke="#E6E6FA" strokeWidth="4" />
  </svg>
);

export const PastelSparkle = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 5L58 42L95 50L58 58L50 95L42 58L5 50L42 42Z" fill="#FFF44F" stroke="white" strokeWidth="4" />
  </svg>
);

export const RainbowSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 60" className={cn("w-full h-full", className)}>
    <path d="M5 55C5 25 95 25 95 55" fill="none" stroke="#FF3399" strokeWidth="12" strokeLinecap="round" />
    <path d="M15 55C15 35 85 35 85 55" fill="none" stroke="#FFD1DC" strokeWidth="12" strokeLinecap="round" />
    <path d="M25 55C25 45 75 45 75 55" fill="none" stroke="#E6E6FA" strokeWidth="12" strokeLinecap="round" />
  </svg>
);

export const KawaiiStar = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 5L65 38L98 42L72 65L82 98L50 80L18 98L28 65L2 42L35 38Z" fill="#FFF176" stroke="white" strokeWidth="3" />
  </svg>
);

export const PlanetSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="50" r="35" fill="#CE93D8" stroke="white" strokeWidth="3" />
    <ellipse cx="50" cy="50" rx="55" ry="12" fill="none" stroke="white" strokeWidth="4" transform="rotate(-15 50 50)" />
  </svg>
);

export const CrystalSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 5L90 50L50 95L10 50Z" fill="#B2EBF2" stroke="white" strokeWidth="3" />
    <path d="M50 5V95M10 50H90" stroke="white" strokeWidth="1" opacity="0.5" />
  </svg>
);

export const MoonSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M75 25A45 45 0 1 0 75 85A35 35 0 1 1 75 25" fill="#FFF9C4" stroke="white" strokeWidth="3" />
  </svg>
);

export const FlowerSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="50" r="12" fill="#FFEB3B" />
    <circle cx="50" cy="25" r="18" fill="#F48FB1" stroke="white" strokeWidth="2" />
    <circle cx="75" cy="38" r="18" fill="#F48FB1" stroke="white" strokeWidth="2" />
    <circle cx="75" cy="62" r="18" fill="#F48FB1" stroke="white" strokeWidth="2" />
    <circle cx="50" cy="75" r="18" fill="#F48FB1" stroke="white" strokeWidth="2" />
    <circle cx="25" cy="62" r="18" fill="#F48FB1" stroke="white" strokeWidth="2" />
    <circle cx="25" cy="38" r="18" fill="#F48FB1" stroke="white" strokeWidth="2" />
  </svg>
);

export const CloverSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="35" r="18" fill="#81C784" stroke="white" strokeWidth="2" />
    <circle cx="68" cy="55" r="18" fill="#81C784" stroke="white" strokeWidth="2" />
    <circle cx="32" cy="55" r="18" fill="#81C784" stroke="white" strokeWidth="2" />
    <path d="M50 55V90" stroke="#4CAF50" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

export const SunSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="50" r="35" fill="#FFD54F" stroke="#F57F17" strokeWidth="3" />
    <path d="M50 5V15M50 85V95M5 50H15M85 50H95M20 20L28 28M72 72L80 80M20 80L28 72M72 28L80 20" stroke="#F57F17" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

// --- TEXT ---
export const SlayText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 140 70" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#FF3399" stroke="white" strokeWidth="5" paintOrder="stroke" style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '40px' }}>SLAY</text>
  </svg>
);

export const CutieText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 140 70" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#FFB7CE" stroke="white" strokeWidth="5" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '32px' }}>CUTIE</text>
  </svg>
);

export const BestiesText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 160 70" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#E6E6FA" stroke="white" strokeWidth="5" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '30px' }}>BESTIES</text>
  </svg>
);

export const LoveText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 140 70" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#F06292" stroke="white" strokeWidth="5" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '36px' }}>LOVE</text>
  </svg>
);

export const HappyText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 140 70" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#FFF176" stroke="#F57F17" strokeWidth="5" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '32px' }}>HAPPY</text>
  </svg>
);

export const SmileText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 140 70" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#4FC3F7" stroke="white" strokeWidth="5" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '32px' }}>SMILE</text>
  </svg>
);

export const WowText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 140 70" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#BA68C8" stroke="white" strokeWidth="5" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '40px' }}>WOW!</text>
  </svg>
);

export const HelloText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 140 70" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#81C784" stroke="white" strokeWidth="5" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '32px' }}>HELLO</text>
  </svg>
);

export const QueenText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 140 70" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#FFD54F" stroke="white" strokeWidth="5" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '36px' }}>QUEEN</text>
  </svg>
);

export const CoolText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 140 70" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#4DB6AC" stroke="white" strokeWidth="5" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '36px' }}>COOL</text>
  </svg>
);

// --- GENERIC SHAPES ---
export const CuteHeartIcon = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 85L10 45A25 25 0 0 1 50 20A25 25 0 0 1 90 45Z" fill="currentColor" stroke="white" strokeWidth="4" />
  </svg>
);

export const CuteStarIcon = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 10L65 40L95 45L70 70L80 95L50 80L20 95L30 70L5 45L35 40Z" fill="currentColor" stroke="white" strokeWidth="4" />
  </svg>
);
