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
 * BEAUTY FILTERS - TIKTOK & KOREAN STYLE
 * Optimized for skin-tone preservation and soft lighting.
 */
export const FILTERS = [
  // 50 PESOS PACKAGE BASE (First 5)
  { id: "natural", label: "NATURAL BEAUTY", class: "brightness-105 contrast-[1.02] saturate-[1.05]" },
  { id: "smooth", label: "SMOOTH SKIN", class: "brightness-110 contrast-[0.98] saturate-[1.05] blur-[0.3px]" },
  { id: "bright", label: "BRIGHT SKIN", class: "brightness-115 contrast-[1.05] saturate-[1.1]" },
  { id: "soft", label: "SOFT GLOW", class: "brightness-110 contrast-[0.95] saturate-[1.1] opacity-[0.95] blur-[0.5px]" },
  { id: "tiktok", label: "TIKTOK STYLE", class: "brightness-112 contrast-[1.1] saturate-[1.2] sepia-[0.05]" },
  
  // 100 PESOS PACKAGE ADDITIONAL (Next 5)
  { id: "cute", label: "CUTE FILTER", class: "saturate-[1.3] contrast-[1.1] hue-rotate-[5deg] brightness-[1.08]" },
  { id: "korean", label: "KOREAN BEAUTY", class: "brightness-115 contrast-[0.9] saturate-[0.8] blur-[0.2px] sepia-[0.02]" },
  { id: "fresh", label: "FRESH LOOK", class: "hue-rotate-[10deg] saturate-[0.9] brightness-[1.1] contrast-[1.05]" },
  { id: "portrait", label: "PORTRAIT ENHANCE", class: "contrast-[1.2] brightness-[1.05] saturate-[1.15]" },
  { id: "clear", label: "CLEAR SKIN", class: "contrast-[1.1] brightness-[1.08] saturate-[1.02] sharpen-[1.1]" },
];

export const QUOTES = [
  { id: "q1", label: "LIMITLESS", text: "Your potential is limitless." },
  { id: "q2", label: "SHINE", text: "Shine like the star you are." },
  { id: "q3", label: "MAGIC", text: "Create magic in every moment." },
  { id: "q4", label: "DREAMER", text: "Dream big, stay focused." },
  { id: "q5", label: "STAY TRUE", text: "Stay true to your soul." },
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
