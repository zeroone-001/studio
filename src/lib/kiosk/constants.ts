
import * as Kawaii from "@/components/kiosk/kawaii-stickers";

export type SessionState = 
  | "welcome" 
  | "payment" 
  | "setup" 
  | "test-camera"
  | "capturing" 
  | "review" 
  | "decorating" 
  | "final-preview"
  | "consent" 
  | "printing" 
  | "thankyou";

export interface PlacedSticker {
  id: string;
  type: string;
  x: number; 
  y: number; 
  size: number;
  rotation: number;
}

/**
 * BEAUTY FILTERS - ENHANCED QUALITY
 * Optimized for Honor Pad X10 camera and skin-tone preservation.
 * Strictly maintains 5 filters for ₱50 and 10 for ₱100.
 * Added 'filter' property for direct CSS application to Video and Canvas.
 */
export const FILTERS = [
  // BASE 5 FILTERS (₱50 Package)
  { 
    id: "natural", 
    label: "NATURAL BEAUTY", 
    class: "brightness-105 contrast-[1.02] saturate-[1.05]",
    filter: "brightness(1.05) contrast(1.02) saturate(1.05)"
  },
  { 
    id: "soft", 
    label: "SOFT SKIN", 
    class: "brightness-110 contrast-[0.9] saturate-[1.05] blur-[1.2px]",
    filter: "brightness(1.1) contrast(0.9) saturate(1.05) blur(1.2px)"
  },
  { 
    id: "bright", 
    label: "BRIGHT GLOW", 
    class: "brightness-135 contrast-[1.05] saturate-[1.1]",
    filter: "brightness(1.35) contrast(1.05) saturate(1.1)"
  },
  { 
    id: "tiktok", 
    label: "TIKTOK BEAUTY", 
    class: "brightness-110 contrast-[1.1] saturate-[1.5]",
    filter: "brightness(1.1) contrast(1.1) saturate(1.5) hue-rotate(-5deg)"
  },
  { 
    id: "warm", 
    label: "WARM TONE", 
    class: "sepia-[0.35] brightness-[1.1] saturate-[1.25]",
    filter: "sepia(0.35) brightness(1.1) saturate(1.25) contrast(1.05)"
  },
  
  // ADDITIONAL 5 FILTERS (Total 10 for ₱100 Package)
  { 
    id: "cool", 
    label: "COOL TONE", 
    class: "hue-rotate-[-25deg] saturate-[1.15] brightness-[1.1]",
    filter: "hue-rotate(-25deg) saturate(1.15) brightness(1.1) contrast(1.05)"
  },
  { 
    id: "clean", 
    label: "CLEAN LOOK", 
    class: "contrast-[1.45] brightness-[1.2] saturate-[0.7]",
    filter: "contrast(1.45) brightness(1.2) saturate(0.7) blur(0.2px)"
  },
  { 
    id: "glow", 
    label: "STUDIO GLOW", 
    class: "brightness-130 contrast-[1.1] saturate-[1.2]",
    filter: "brightness(1.3) contrast(1.1) saturate(1.2) opacity(0.98)"
  },
  { 
    id: "fresh", 
    label: "FRESH LOOK", 
    class: "hue-rotate-[15deg] saturate-[1.35] brightness-[1.15]",
    filter: "hue-rotate(15deg) saturate(1.35) brightness(1.15) contrast(1.05)"
  },
  { 
    id: "classic", 
    label: "PORTRAIT ENHANCE", 
    class: "contrast-[1.55] brightness-[1.05] saturate-[1.15]",
    filter: "contrast(1.55) brightness(1.05) saturate(1.15) blur(0.1px)"
  },
];

/**
 * 50 SHORT INSPIRATIONAL QUOTES
 */
export const QUOTES = [
  { id: "q1", label: "STORY", text: "Every picture tells a story." },
  { id: "q2", label: "MEMORIES", text: "Memories made today." },
  { id: "q3", label: "SMILE", text: "Smile, create, remember." },
  { id: "q4", label: "MAGIC", text: "Magic in every moment." },
  { id: "q5", label: "BLESSED", text: "Blessed and grateful." },
  { id: "q6", label: "JOY", text: "Choose joy every day." },
  { id: "q7", label: "MOON", text: "Stay wild, moon child." },
  { id: "q8", label: "SUNSHINE", text: "Be your own sunshine." },
  { id: "q9", label: "BEAUTIFUL", text: "Life is beautiful." },
  { id: "q10", label: "LOVE", text: "Do small things with love." },
  { id: "q11", label: "AMAZING", text: "You are simply amazing." },
  { id: "q12", label: "HEART", text: "Follow your heart." },
  { id: "q13", label: "SPARKLE", text: "Sparkle from within." },
  { id: "q14", label: "SOUL", text: "Happy soul, happy life." },
  { id: "q15", label: "VIBES", text: "Good vibes only." },
  { id: "q16", label: "HUMBLE", text: "Dream big, stay humble." },
  { id: "q17", label: "MOMENT", text: "Live in the moment." },
  { id: "q18", label: "KEEP", text: "Keep on smiling." },
  { id: "q19", label: "WINGS", text: "Spread your wings." },
  { id: "q20", label: "WORK", text: "Love what you do." },
  { id: "q21", label: "JOURNEY", text: "Find joy in the journey." },
  { id: "q22", label: "CHANGE", text: "Be the change." },
  { id: "q23", label: "BELIEVE", text: "Believe in yourself." },
  { id: "q24", label: "DAY", text: "Today is a good day." },
  { id: "q25", label: "HAPPY", text: "Capture the happy." },
  { id: "q26", label: "SHINE", text: "Shine bright." },
  { id: "q27", label: "YOU", text: "Just be you." },
  { id: "q28", label: "GRATEFUL", text: "Forever grateful." },
  { id: "q29", label: "ADVENTURE", text: "Adventure awaits." },
  { id: "q30", label: "KINDNESS", text: "Kindness is magic." },
  { id: "q31", label: "INSPIRED", text: "Stay inspired." },
  { id: "q32", label: "LESS", text: "Love more, worry less." },
  { id: "q33", label: "GOT", text: "You got this." },
  { id: "q34", label: "HAPPEN", text: "Make it happen." },
  { id: "q35", label: "PATH", text: "Create your own path." },
  { id: "q36", label: "SWEETEST", text: "Sweetest memories." },
  { id: "q37", label: "PURE", text: "Pure happiness." },
  { id: "q38", label: "BETTER", text: "Better together." },
  { id: "q39", label: "BEST", text: "Best day ever." },
  { id: "q40", label: "CHERISH", text: "Cherish every second." },
  { id: "q41", label: "GIFT", text: "Life is a gift." },
  { id: "q42", label: "REAL", text: "Keep it real." },
  { id: "q43", label: "CURIOUS", text: "Stay curious." },
  { id: "q44", label: "DO", text: "Dream it, do it." },
  { id: "q45", label: "SIMPLY", text: "Simply blessed." },
  { id: "q46", label: "RADIATE", text: "Radiate positivity." },
  { id: "q47", label: "HELLO", text: "Hello sunshine." },
  { id: "q48", label: "BRAVE", text: "Be brave, be bold." },
  { id: "q49", label: "GOOD", text: "Focus on the good." },
  { id: "q50", label: "MEMORIES2", text: "Beautiful memories." },
];

export const STICKER_DEFS = [
  // --- HEARTS ---
  { id: "heart_puffy", label: "Puffy", icon: Kawaii.PuffyHeart, color: "text-pink-400" },
  { id: "heart_ribbon", label: "Ribbon", icon: Kawaii.RibbonHeart, color: "text-pink-300" },
  { id: "heart_double", label: "Double", icon: Kawaii.DoubleHeart, color: "text-red-300" },
  { id: "heart_sparkle", label: "Sparkle", icon: Kawaii.SparkleHeart, color: "text-pink-500" },
  { id: "heart_winged", label: "Winged", icon: Kawaii.WingedHeart, color: "text-pink-200" },
  { id: "heart_simple1", label: "Soft", icon: Kawaii.CuteHeartIcon, color: "text-rose-300" },
  { id: "heart_simple2", label: "Rose", icon: Kawaii.CuteHeartIcon, color: "text-rose-400" },
  { id: "heart_simple3", label: "Ruby", icon: Kawaii.CuteHeartIcon, color: "text-red-500" },

  // --- ANIMALS ---
  { id: "ani_bunny", label: "Bunny", icon: Kawaii.KawaiiBunny, color: "text-zinc-400" },
  { id: "ani_bear", label: "Teddy", icon: Kawaii.TeddyBear, color: "text-amber-700" },
  { id: "ani_panda", label: "Panda", icon: Kawaii.KawaiiPanda, color: "text-zinc-800" },
  { id: "ani_cat", label: "Cat", icon: Kawaii.KawaiiCat, color: "text-zinc-500" },
  { id: "ani_frog", label: "Frog", icon: Kawaii.KawaiiFrog, color: "text-green-400" },
  { id: "ani_chick", label: "Chick", icon: Kawaii.KawaiiChick, color: "text-yellow-400" },
  { id: "ani_penguin", label: "Pengu", icon: Kawaii.KawaiiPenguin, color: "text-zinc-900" },
  { id: "ani_fox", label: "Fox", icon: Kawaii.KawaiiFox, color: "text-orange-500" },
  { id: "ani_koala", label: "Koala", icon: Kawaii.KawaiiKoala, color: "text-slate-400" },
  { id: "ani_pig", label: "Piggy", icon: Kawaii.KawaiiPig, color: "text-pink-200" },

  // --- FOOD ---
  { id: "food_sushi", label: "Sushi", icon: Kawaii.SushiSticker, color: "" },
  { id: "food_icecream", label: "Cone", icon: Kawaii.IceCreamSticker, color: "" },
  { id: "food_boba", label: "Boba", icon: Kawaii.BobaSticker, color: "" },
  { id: "food_donut", label: "Donut", icon: Kawaii.DonutSticker, color: "" },
  { id: "food_cupcake", label: "Cake", icon: Kawaii.CupcakeSticker, color: "" },
  { id: "food_pizza", label: "Pizza", icon: Kawaii.PizzaSticker, color: "" },
  { id: "food_strawberry", label: "Berry", icon: Kawaii.StrawberrySticker, color: "" },
  { id: "food_cherry", label: "Cherry", icon: Kawaii.CherrySticker, color: "" },
  { id: "food_peach", label: "Peach", icon: Kawaii.PeachSticker, color: "" },
  { id: "food_milk", label: "Milk", icon: Kawaii.MilkSticker, color: "" },

  // --- AESTHETIC ---
  { id: "aes_cloud", label: "Cloud", icon: Kawaii.KawaiiCloud, color: "text-blue-50" },
  { id: "aes_sparkle", label: "Sparkle", icon: Kawaii.PastelSparkle, color: "text-yellow-300" },
  { id: "aes_rainbow", label: "Rainbow", icon: Kawaii.RainbowSticker, color: "" },
  { id: "aes_star", label: "Star", icon: Kawaii.KawaiiStar, color: "text-yellow-400" },
  { id: "aes_star2", label: "Star2", icon: Kawaii.CuteStarIcon, color: "text-amber-300" },
  { id: "aes_planet", label: "Planet", icon: Kawaii.PlanetSticker, color: "text-purple-300" },
  { id: "aes_crystal", label: "Crystal", icon: Kawaii.CrystalSticker, color: "text-cyan-200" },
  { id: "aes_moon", label: "Moon", icon: Kawaii.MoonSticker, color: "text-yellow-100" },
  { id: "aes_flower", label: "Flower", icon: Kawaii.FlowerSticker, color: "" },
  { id: "aes_clover", label: "Clover", icon: Kawaii.CloverSticker, color: "" },
  { id: "aes_sun", label: "Sun", icon: Kawaii.SunSticker, color: "" },

  // --- TEXT ---
  { id: "txt_slay", label: "Slay", icon: Kawaii.SlayText, color: "" },
  { id: "txt_cutie", label: "Cutie", icon: Kawaii.CutieText, color: "" },
  { id: "txt_besties", label: "Besties", icon: Kawaii.BestiesText, color: "" },
  { id: "txt_love", label: "Love", icon: Kawaii.LoveText, color: "" },
  { id: "txt_happy", label: "Happy", icon: Kawaii.HappyText, color: "" },
  { id: "txt_smile", label: "Smile", icon: Kawaii.SmileText, color: "" },
  { id: "txt_wow", label: "Wow", icon: Kawaii.WowText, color: "" },
  { id: "txt_hello", label: "Hello", icon: Kawaii.HelloText, color: "" },
  { id: "txt_queen", label: "Queen", icon: Kawaii.QueenText, color: "" },
  { id: "txt_cool", label: "Cool", icon: Kawaii.CoolText, color: "" },
];
