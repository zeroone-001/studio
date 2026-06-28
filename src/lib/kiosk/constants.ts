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

export const FILTERS = [
  { id: "glowup", label: "GLOW UP", sub: "TIKTOK SKIN", class: "brightness-110 contrast-[1.05] saturate-[1.15] sepia-[0.05] drop-shadow-md" },
  { id: "retro", label: "RETRO", sub: "WARM VIBE", class: "sepia-[0.35] contrast-[1.1] brightness-[1.05] saturate-[1.3] hue-rotate-[-5deg]" },
  { id: "icey", label: "ICEY", sub: "COOL TONES", class: "hue-rotate-[10deg] saturate-[0.8] brightness-[1.1] contrast-[1.1] opacity-[0.95]" },
  { id: "indie", label: "INDIE", sub: "VIBRANT", class: "saturate-[1.6] contrast-[1.2] brightness-[1.05] sepia-[0.05]" },
  { id: "bwpro", label: "B&W PRO", sub: "CINEMATIC", class: "grayscale contrast-[1.6] brightness-[1.1]" },
  { id: "candy", label: "CANDY", sub: "POP VIBE", class: "saturate-[1.8] contrast-[1.25] brightness-[1.1] hue-rotate-[5deg]" },
  { id: "velvet", label: "VELVET", sub: "WARM PINK", class: "sepia-[0.1] saturate-[1.4] contrast-[1.1] hue-rotate-[-10deg] brightness-[1.05]" },
  { id: "sunset", label: "SUNSET", sub: "GOLDEN HOUR", class: "sepia-[0.4] saturate-[1.7] brightness-[1.1] contrast-[1.1] hue-rotate-[-15deg]" },
  { id: "dream", label: "DREAM", sub: "SOFT GLOW", class: "brightness-[1.2] contrast-[0.9] saturate-[1.1] blur-[0.5px]" },
  { id: "film", label: "FILM", sub: "VINTAGE", class: "grayscale-[0.2] sepia-[0.15] contrast-[1.3] brightness-[0.95] saturate-[1.2]" },
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
