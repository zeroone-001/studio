import * as Kawaii from "@/components/kiosk/kawaii-stickers";

export type SessionState = "welcome" | "payment" | "setup" | "capturing" | "review" | "decorating" | "consent" | "printing" | "thankyou" | "test-camera";

export interface PlacedSticker {
  id: string;
  type: string;
  x: number; 
  y: number; 
  size: number;
  rotation: number;
}

/**
 * SOCIAL MEDIA BEAUTY FILTERS
 * Optimized for modern social media aesthetics and skin-tone preservation.
 */
export const FILTERS = [
  // 50 PESOS PACKAGE BASE (5 Filters)
  { id: "natural", label: "NATURAL BEAUTY", class: "brightness-105 contrast-[1.02] saturate-[1.05]" },
  { id: "soft", label: "SOFT SKIN", class: "brightness-110 contrast-[0.98] saturate-[1.05] blur-[0.4px]" },
  { id: "bright", label: "BRIGHT", class: "brightness-118 contrast-[1.02] saturate-[1.05]" },
  { id: "warm", label: "WARM", class: "sepia-[0.15] brightness-[1.05] saturate-[1.2] contrast-[1.05]" },
  { id: "cool", label: "COOL", class: "hue-rotate-[-10deg] saturate-[0.9] brightness-[1.08] contrast-[1.05]" },
  
  // 100 PESOS PACKAGE ADDITIONAL (Total 10)
  { id: "tiktok", label: "TIKTOK BEAUTY", class: "brightness-112 contrast-[1.1] saturate-[1.2] sepia-[0.05]" },
  { id: "clean", label: "CLEAN LOOK", class: "contrast-[1.1] brightness-[1.1] saturate-[0.95] blur-[0.2px]" },
  { id: "glow", label: "GLOW", class: "brightness-115 contrast-[1.05] saturate-[1.2] drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" },
  { id: "fresh", label: "FRESH", class: "hue-rotate-[5deg] saturate-[1.1] brightness-[1.1] contrast-[1.02]" },
  { id: "classic", label: "CLASSIC", class: "contrast-[1.15] brightness-[1.05] saturate-[1.05]" },
];

export const QUOTES = [
  { id: "q1", label: "STORY", text: "Every Picture Tells A Story" },
  { id: "q2", label: "MEMORIES", text: "Memories Made Today" },
  { id: "q3", label: "SMILE", text: "Smile, Create, Remember" },
  { id: "q4", label: "MAGIC", text: "Magic in Every Moment" },
  { id: "q5", label: "BLESSED", text: "Blessed and Grateful" },
];

export const STICKER_DEFS = [
  { id: "heart1", label: "Puffy Heart", icon: Kawaii.PuffyHeart, color: "text-pink-400" },
  { id: "heart2", label: "Ribbon Heart", icon: Kawaii.RibbonHeart, color: "text-pink-300" },
  { id: "bunny", label: "Bunny", icon: Kawaii.KawaiiBunny, color: "text-zinc-400" },
  { id: "bear", label: "Teddy", icon: Kawaii.TeddyBear, color: "text-amber-700" },
  { id: "panda", label: "Panda", icon: Kawaii.KawaiiPanda, color: "text-zinc-800" },
  { id: "sushi", label: "Sushi", icon: Kawaii.SushiSticker, color: "text-zinc-800" },
  { id: "icecream", label: "Ice Cream", icon: Kawaii.IceCreamSticker, color: "text-pink-200" },
  { id: "cloud", label: "Cloud", icon: Kawaii.KawaiiCloud, color: "text-blue-100" },
  { id: "sparkle", label: "Sparkle", icon: Kawaii.PastelSparkle, color: "text-yellow-400" },
  { id: "rainbow", label: "Rainbow", icon: Kawaii.RainbowSticker, color: "" },
  { id: "slay", label: "Slay", icon: Kawaii.SlayText, color: "" },
  { id: "cutie", label: "Cutie", icon: Kawaii.CutieText, color: "" },
  { id: "besties", label: "Besties", icon: Kawaii.BestiesText, color: "" },
];