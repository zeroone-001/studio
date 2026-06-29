
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface KawaiiProps {
  className?: string;
}

// --- HEARTS ---
export const PuffyHeart = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 88C50 88 10 65 10 38C10 20 28 10 42 22C45 25 48 30 50 32C52 30 55 25 58 22C72 10 90 20 90 38C90 65 50 88 50 88Z" fill="currentColor" stroke="white" strokeWidth="4" />
  </svg>
);

export const RibbonHeart = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 85C50 85 15 65 15 40C15 25 30 15 42 25C45 28 48 32 50 35C52 32 55 28 58 25C70 15 85 25 85 40C85 65 50 85 50 85Z" fill="currentColor" stroke="white" strokeWidth="4" />
    <path d="M35 55L65 55M40 50L60 60" stroke="white" strokeWidth="2" opacity="0.5" />
  </svg>
);

export const DoubleHeart = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M40 70C40 70 10 55 10 35C10 20 25 15 35 25C40 30 40 70 40 70Z" fill="currentColor" opacity="0.6" />
    <path d="M60 80C60 80 20 60 20 35C20 15 45 10 55 25C60 30 60 80 60 80Z" fill="currentColor" stroke="white" strokeWidth="3" />
  </svg>
);

export const SparkleHeart = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 80C50 80 15 60 15 35C15 20 30 15 42 25C50 30 50 80 50 80Z" fill="currentColor" />
    <path d="M50 80C50 80 85 60 85 35C85 20 70 15 58 25C50 30 50 80 50 80Z" fill="currentColor" opacity="0.8" />
    <circle cx="25" cy="25" r="3" fill="white" />
    <circle cx="75" cy="40" r="2" fill="white" />
  </svg>
);

export const WingedHeart = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 120 80" className={cn("w-full h-full", className)}>
    <path d="M20 40Q0 20 20 10T40 40" fill="white" opacity="0.4" />
    <path d="M100 40Q120 20 100 10T80 40" fill="white" opacity="0.4" />
    <path d="M60 70C60 70 30 55 30 35C30 20 45 15 55 25C60 30 60 70 60 70C60 70 65 30 70 25C80 15 95 20 95 35C95 55 60 70 60 70Z" fill="currentColor" stroke="white" strokeWidth="3" />
  </svg>
);

// --- ANIMALS ---
export const KawaiiBunny = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <ellipse cx="35" cy="25" rx="8" ry="18" fill="white" transform="rotate(-10 35 25)" />
    <ellipse cx="65" cy="25" rx="8" ry="18" fill="white" transform="rotate(10 65 25)" />
    <circle cx="50" cy="65" r="30" fill="white" stroke="currentColor" strokeWidth="2" />
    <circle cx="40" cy="60" r="3" fill="#333" />
    <circle cx="60" cy="60" r="3" fill="#333" />
    <path d="M48 72Q50 75 52 72" fill="none" stroke="#333" strokeWidth="2" />
  </svg>
);

export const TeddyBear = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="25" cy="30" r="10" fill="currentColor" />
    <circle cx="75" cy="30" r="10" fill="currentColor" />
    <circle cx="50" cy="60" r="35" fill="currentColor" stroke="white" strokeWidth="3" />
    <circle cx="40" cy="55" r="2.5" fill="black" />
    <circle cx="60" cy="55" r="2.5" fill="black" />
    <ellipse cx="50" cy="65" rx="8" ry="6" fill="white" opacity="0.4" />
  </svg>
);

export const KawaiiPanda = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="25" cy="30" r="12" fill="#333" />
    <circle cx="75" cy="30" r="12" fill="#333" />
    <circle cx="50" cy="60" r="35" fill="white" stroke="#333" strokeWidth="4" />
    <ellipse cx="38" cy="55" rx="8" ry="10" fill="#333" />
    <ellipse cx="62" cy="55" rx="8" ry="10" fill="#333" />
    <circle cx="38" cy="53" r="2" fill="white" />
    <circle cx="62" cy="53" r="2" fill="white" />
  </svg>
);

export const KawaiiCat = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M20 40L35 20L45 40Z" fill="currentColor" />
    <path d="M80 40L65 20L55 40Z" fill="currentColor" />
    <circle cx="50" cy="60" r="35" fill="currentColor" stroke="white" strokeWidth="3" />
    <circle cx="38" cy="55" r="3" fill="white" />
    <circle cx="62" cy="55" r="3" fill="white" />
    <path d="M30 65H40M70 65H60" stroke="white" strokeWidth="2" />
  </svg>
);

export const KawaiiFrog = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="30" cy="35" r="15" fill="currentColor" />
    <circle cx="70" cy="35" r="15" fill="currentColor" />
    <ellipse cx="50" cy="65" rx="40" ry="30" fill="currentColor" />
    <circle cx="30" cy="35" r="5" fill="black" />
    <circle cx="70" cy="35" r="5" fill="black" />
    <path d="M40 75Q50 85 60 75" fill="none" stroke="black" strokeWidth="3" />
  </svg>
);

export const KawaiiChick = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="60" r="35" fill="#FFEB3B" stroke="white" strokeWidth="2" />
    <circle cx="40" cy="55" r="3" fill="black" />
    <circle cx="60" cy="55" r="3" fill="black" />
    <path d="M45 65L50 70L55 65Z" fill="#FF9800" />
    <ellipse cx="30" cy="65" rx="5" ry="3" fill="#FFCDD2" />
    <ellipse cx="70" cy="65" rx="5" ry="3" fill="#FFCDD2" />
  </svg>
);

export const KawaiiPenguin = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <ellipse cx="50" cy="60" rx="35" ry="38" fill="#212121" />
    <ellipse cx="50" cy="65" rx="25" ry="28" fill="white" />
    <circle cx="40" cy="45" r="3" fill="white" />
    <circle cx="60" cy="45" r="3" fill="white" />
    <path d="M47 55L50 60L53 55Z" fill="#FF9800" />
  </svg>
);

export const KawaiiFox = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M15 40L30 10L50 40Z" fill="#FF7043" />
    <path d="M85 40L70 10L50 40Z" fill="#FF7043" />
    <circle cx="50" cy="60" r="35" fill="#FF7043" />
    <ellipse cx="50" cy="70" rx="20" ry="15" fill="white" />
    <circle cx="40" cy="55" r="2.5" fill="black" />
    <circle cx="60" cy="55" r="2.5" fill="black" />
  </svg>
);

export const KawaiiKoala = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="20" cy="40" r="15" fill="#9E9E9E" />
    <circle cx="80" cy="40" r="15" fill="#9E9E9E" />
    <circle cx="50" cy="60" r="35" fill="#9E9E9E" />
    <ellipse cx="50" cy="60" rx="8" ry="12" fill="#424242" />
    <circle cx="35" cy="50" r="2.5" fill="black" />
    <circle cx="65" cy="50" r="2.5" fill="black" />
  </svg>
);

export const KawaiiPig = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="60" r="35" fill="#F8BBD0" />
    <ellipse cx="50" cy="65" rx="12" ry="8" fill="#F48FB1" />
    <circle cx="46" cy="65" r="2" fill="#880E4F" />
    <circle cx="54" cy="65" r="2" fill="#880E4F" />
    <circle cx="35" cy="50" r="3" fill="black" />
    <circle cx="65" cy="50" r="3" fill="black" />
  </svg>
);

// --- FOOD ---
export const SushiSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <rect x="20" y="50" width="60" height="30" rx="10" fill="white" stroke="#333" strokeWidth="4" />
    <rect x="20" y="40" width="60" height="15" rx="5" fill="#FF6347" stroke="#333" strokeWidth="3" />
    <circle cx="40" cy="65" r="2" fill="#333" />
    <circle cx="60" cy="65" r="2" fill="#333" />
  </svg>
);

export const IceCreamSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 90L30 60H70L50 90Z" fill="#DEB887" />
    <circle cx="50" cy="45" r="22" fill="#FFB7CE" stroke="white" strokeWidth="2" />
    <circle cx="45" cy="40" r="2" fill="#333" />
    <circle cx="55" cy="40" r="2" fill="#333" />
  </svg>
);

export const BobaSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <rect x="30" y="30" width="40" height="60" rx="5" fill="#E1F5FE" stroke="#333" strokeWidth="2" />
    <rect x="35" y="10" width="5" height="40" fill="#FF4081" />
    <circle cx="40" cy="75" r="4" fill="#333" />
    <circle cx="50" cy="80" r="4" fill="#333" />
    <circle cx="60" cy="75" r="4" fill="#333" />
    <rect x="30" y="25" width="40" height="8" rx="2" fill="#333" />
  </svg>
);

export const DonutSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="50" r="40" fill="#FF8A65" stroke="#D84315" strokeWidth="2" />
    <circle cx="50" cy="50" r="15" fill="white" stroke="#D84315" strokeWidth="2" />
    <path d="M25 40L30 35M70 45L75 40M40 70L45 75" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const CupcakeSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M30 60L35 90H65L70 60" fill="#BCAAA4" />
    <path d="M25 60C25 40 75 40 75 60Z" fill="#F48FB1" />
    <circle cx="50" cy="35" r="8" fill="#F44336" />
  </svg>
);

export const PizzaSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 10L10 80H90L50 10Z" fill="#FFF176" stroke="#F57F17" strokeWidth="3" />
    <circle cx="45" cy="40" r="5" fill="#E53935" />
    <circle cx="60" cy="60" r="5" fill="#E53935" />
    <circle cx="35" cy="70" r="5" fill="#E53935" />
  </svg>
);

export const StrawberrySticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 90C30 90 20 70 20 50C20 30 50 20 50 20C50 20 80 30 80 50C80 70 70 90 50 90Z" fill="#E91E63" />
    <path d="M40 25L50 10L60 25" fill="#4CAF50" />
    <circle cx="40" cy="50" r="1" fill="white" />
    <circle cx="60" cy="60" r="1" fill="white" />
  </svg>
);

export const CherrySticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 20Q60 10 70 40" fill="none" stroke="#4CAF50" strokeWidth="3" />
    <path d="M50 20Q40 10 30 40" fill="none" stroke="#4CAF50" strokeWidth="3" />
    <circle cx="30" cy="60" r="20" fill="#D32F2F" />
    <circle cx="70" cy="60" r="20" fill="#D32F2F" />
  </svg>
);

export const PeachSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 90C30 90 10 70 10 50C10 30 30 15 50 30C70 15 90 30 90 50C90 70 70 90 50 90Z" fill="#FFAB91" />
    <path d="M50 30V15" stroke="#4CAF50" strokeWidth="4" />
  </svg>
);

export const MilkSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M30 30L35 15H65L70 30V90H30V30Z" fill="white" stroke="#2196F3" strokeWidth="3" />
    <text x="50" y="65" textAnchor="middle" fill="#2196F3" fontSize="16" fontWeight="900">MILK</text>
  </svg>
);

// --- AESTHETIC ---
export const KawaiiCloud = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M25 65C15 65 15 50 25 50C25 35 45 35 50 45C55 35 75 35 75 50C85 50 85 65 75 65H25Z" fill="white" stroke="#E6E6FA" strokeWidth="4" />
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

export const KawaiiStar = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 5L63 35L95 38L70 60L78 92L50 75L22 92L30 60L5 38L37 35Z" fill="#FFF176" stroke="white" strokeWidth="2" />
  </svg>
);

export const PlanetSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="50" r="30" fill="#CE93D8" />
    <ellipse cx="50" cy="50" rx="45" ry="10" fill="none" stroke="white" strokeWidth="3" transform="rotate(-15 50 50)" />
  </svg>
);

export const CrystalSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 10L80 50L50 90L20 50Z" fill="#B2EBF2" stroke="white" strokeWidth="2" />
    <path d="M50 10V90" stroke="white" strokeWidth="1" opacity="0.5" />
  </svg>
);

export const MoonSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M70 20A40 40 0 1 0 70 80A30 30 0 1 1 70 20" fill="#FFF9C4" stroke="white" strokeWidth="2" />
  </svg>
);

export const FlowerSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="50" r="10" fill="#FFEB3B" />
    <circle cx="50" cy="30" r="15" fill="#F48FB1" />
    <circle cx="70" cy="40" r="15" fill="#F48FB1" />
    <circle cx="70" cy="60" r="15" fill="#F48FB1" />
    <circle cx="50" cy="70" r="15" fill="#F48FB1" />
    <circle cx="30" cy="60" r="15" fill="#F48FB1" />
    <circle cx="30" cy="40" r="15" fill="#F48FB1" />
  </svg>
);

export const CloverSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="40" r="15" fill="#81C784" />
    <circle cx="65" cy="55" r="15" fill="#81C784" />
    <circle cx="35" cy="55" r="15" fill="#81C784" />
    <path d="M50 55V85" stroke="#4CAF50" strokeWidth="5" />
  </svg>
);

export const SunSticker = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <circle cx="50" cy="50" r="30" fill="#FFD54F" stroke="#F57F17" strokeWidth="2" />
    <path d="M50 10V20M50 80V90M10 50H20M80 50H90" stroke="#F57F17" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// --- TEXT ---
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

export const LoveText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 120 60" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#F06292" stroke="white" strokeWidth="4" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '32px' }}>LOVE</text>
  </svg>
);

export const HappyText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 120 60" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#FFF176" stroke="#F57F17" strokeWidth="4" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '28px' }}>HAPPY</text>
  </svg>
);

export const SmileText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 120 60" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#4FC3F7" stroke="white" strokeWidth="4" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '28px' }}>SMILE</text>
  </svg>
);

export const WowText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 120 60" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#BA68C8" stroke="white" strokeWidth="4" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '36px' }}>WOW!</text>
  </svg>
);

export const HelloText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 120 60" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#81C784" stroke="white" strokeWidth="4" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '28px' }}>HELLO</text>
  </svg>
);

export const QueenText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 120 60" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#FFD54F" stroke="white" strokeWidth="4" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '30px' }}>QUEEN</text>
  </svg>
);

export const CoolText = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 120 60" className={cn("w-full h-full", className)}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#4DB6AC" stroke="white" strokeWidth="4" paintOrder="stroke" style={{ fontWeight: 900, fontSize: '30px' }}>COOL</text>
  </svg>
);

// --- GENERIC SHAPES ---
export const CuteHeartIcon = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 80L15 45A20 20 0 0 1 50 20A20 20 0 0 1 85 45Z" fill="currentColor" stroke="white" strokeWidth="3" />
  </svg>
);

export const CuteStarIcon = ({ className }: KawaiiProps) => (
  <svg viewBox="0 0 100 100" className={cn("w-full h-full", className)}>
    <path d="M50 10L65 40L95 45L70 70L80 95L50 80L20 95L30 70L5 45L35 40Z" fill="currentColor" stroke="white" strokeWidth="3" />
  </svg>
);
