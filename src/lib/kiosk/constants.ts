
import * as Kawaii from "@/components/kiosk/kawaii-stickers";

export type SessionState = 
  | "welcome" 
  | "payment" 
  | "package-selection"
  | "package-preview"
  | "setup" 
  | "test-camera"
  | "capturing" 
  | "review" 
  | "decorating" 
  | "final-preview"
  | "printing" 
  | "thankyou";

export interface PlacedSticker {
  id: string;
  type: string;
  x: number; 
  y: number; 
  size: number;
  rotation: number;
  flipX?: boolean;
  flipY?: boolean;
  zIndex: number;
}

/**
 * BEAUTY FILTERS - ENHANCED QUALITY
 */
export const FILTERS = [
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
  { id: "q1", label: "MOMENT", text: "Every moment matters." },
  { id: "q2", label: "SPARKLE", text: "Sparkle every day." },
  { id: "q3", label: "DREAM", text: "Dream big dreams." },
  { id: "q4", label: "HAPPY", text: "Happiness looks good on you." },
  { id: "q5", label: "MAGIC", text: "Create your own magic." },
  { id: "q6", label: "KIND", text: "Choose kind words." },
  { id: "q7", label: "WILD", text: "Stay wonderfully wild." },
  { id: "q8", label: "SMILE", text: "Smile at everything." },
  { id: "q9", label: "LIFE", text: "Love your beautiful life." },
  { id: "q10", label: "LIGHT", text: "Be your own light." },
  { id: "q11", label: "SHINE", text: "Shine from within." },
  { id: "q12", label: "ADVENTURE", text: "Adventure is out there." },
  { id: "q13", label: "JOY", text: "Joy is a choice." },
  { id: "q14", label: "BELIEVE", text: "Believe in magic." },
  { id: "q15", label: "SIMPLE", text: "Simply be happy." },
  { id: "q16", label: "BLISS", text: "Follow your bliss." },
  { id: "q17", label: "COUNT", text: "Make today count." },
  { id: "q18", label: "VIBES", text: "Radiate good vibes." },
  { id: "q19", label: "SWEET", text: "Life is sweet." },
  { id: "q20", label: "FORWARD", text: "Keep moving forward." },
  { id: "q21", label: "GOLDEN", text: "Stay golden always." },
  { id: "q22", label: "MATTER", text: "Love what matters." },
  { id: "q23", label: "FOCUS", text: "Focus on joy." },
  { id: "q24", label: "ENOUGH", text: "You are enough." },
  { id: "q25", label: "BRAVE", text: "Brave and beautiful." },
  { id: "q26", label: "SOUL", text: "Forever young soul." },
  { id: "q27", label: "PEACE", text: "Peace and love." },
  { id: "q28", label: "GRATEFUL", text: "Grateful for today." },
  { id: "q29", label: "WORLD", text: "Hello beautiful world." },
  { id: "q30", label: "LIFE_MAGIC", text: "Magic in every life." },
  { id: "q31", label: "INSPIRED", text: "Stay inspired daily." },
  { id: "q32", label: "WINS", text: "Love wins always." },
  { id: "q33", label: "LOUD", text: "Live loud and clear." },
  { id: "q34", label: "JOYS", text: "Simple life joys." },
  { id: "q35", label: "PURE", text: "Pure heart only." },
  { id: "q36", label: "DAYS", text: "Better days ahead." },
  { id: "q37", label: "VERSION", text: "Best version ever." },
  { id: "q38", label: "NOW", text: "Cherish the now." },
  { id: "q39", label: "GIFT", text: "Gift of today." },
  { id: "q40", label: "REAL", text: "Keep it real." },
  { id: "q41", label: "FREE", text: "Curious and free." },
  { id: "q42", label: "ANYWAY", text: "Do it anyway." },
  { id: "q43", label: "BLESSED", text: "Simply blessed life." },
  { id: "q44", label: "POSITIVE", text: "Positive mind only." },
  { id: "q45", label: "SUNSHINE", text: "Sunshine in your soul." },
  { id: "q46", label: "BOLD", text: "Bold and brave." },
  { id: "q47", label: "GOOD", text: "Focus on the good." },
  { id: "q48", label: "INSIDE", text: "Beautiful soul inside." },
  { id: "q49", label: "GRAND", text: "Life is grand." },
  { id: "q50", label: "CAPTURE", text: "Capture the joy." },
];

export const STICKER_DEFS = [
  // --- HEARTS (1-10) ---
  { id: "heart_puffy", label: "Puffy", icon: Kawaii.PuffyHeart, color: "text-pink-400" },
  { id: "heart_ribbon", label: "Ribbon", icon: Kawaii.RibbonHeart, color: "text-pink-300" },
  { id: "heart_double", label: "Double", icon: Kawaii.DoubleHeart, color: "text-red-300" },
  { id: "heart_sparkle", label: "Sparkle", icon: Kawaii.SparkleHeart, color: "text-pink-500" },
  { id: "heart_winged", label: "Winged", icon: Kawaii.WingedHeart, color: "text-pink-200" },
  { id: "heart_jelly", label: "Jelly", icon: Kawaii.CuteHeartIcon, color: "text-rose-300" },
  { id: "heart_glass", label: "Glass", icon: Kawaii.CuteHeartIcon, color: "text-rose-400" },
  { id: "heart_glow", label: "Glow", icon: Kawaii.CuteHeartIcon, color: "text-red-500" },
  { id: "heart_pearl", label: "Pearl", icon: Kawaii.CuteHeartIcon, color: "text-pink-50" },
  { id: "heart_aura", label: "Aura", icon: Kawaii.CuteHeartIcon, color: "text-indigo-300" },

  // --- BOWS & COQUETTE (11-20) ---
  { id: "bow_pink", label: "Pink Bow", icon: Kawaii.CoquetteBow, color: "text-pink-300" },
  { id: "bow_red", label: "Red Bow", icon: Kawaii.CoquetteBow, color: "text-red-500" },
  { id: "bow_white", label: "White Bow", icon: Kawaii.CoquetteBow, color: "text-white" },
  { id: "bow_lace", label: "Lace Bow", icon: Kawaii.CoquetteBow, color: "text-pink-100" },
  { id: "bow_velvet", label: "Velvet Bow", icon: Kawaii.CoquetteBow, color: "text-rose-900" },
  { id: "ribbon_swirl", label: "Swirl", icon: Kawaii.RibbonHeart, color: "text-pink-400" },
  { id: "lace_trim", label: "Lace", icon: Kawaii.PuffyHeart, color: "text-white/40" },
  { id: "bow_satin", label: "Satin", icon: Kawaii.CoquetteBow, color: "text-amber-100" },
  { id: "bow_mint", label: "Mint", icon: Kawaii.CoquetteBow, color: "text-emerald-100" },
  { id: "bow_lilac", label: "Lilac", icon: Kawaii.CoquetteBow, color: "text-purple-200" },

  // --- ANIMALS: BUNNY & TEDDY (21-35) ---
  { id: "ani_bunny_hi", label: "Hi Bunny", icon: Kawaii.KawaiiBunny, color: "text-zinc-100" },
  { id: "ani_bunny_love", label: "Love Bunny", icon: Kawaii.KawaiiBunny, color: "text-pink-100" },
  { id: "ani_bear_cuddle", label: "Cuddle Bear", icon: Kawaii.TeddyBear, color: "text-amber-200" },
  { id: "ani_bear_sleepy", label: "Sleepy Bear", icon: Kawaii.TeddyBear, color: "text-amber-700" },
  { id: "ani_panda_puffy", label: "Panda", icon: Kawaii.KawaiiPanda, color: "text-zinc-800" },
  { id: "ani_cat_kawaii", label: "Kawaii Cat", icon: Kawaii.KawaiiCat, color: "text-zinc-100" },
  { id: "ani_cat_black", label: "Black Cat", icon: Kawaii.KawaiiCat, color: "text-zinc-900" },
  { id: "ani_frog_hop", label: "Froggie", icon: Kawaii.KawaiiFrog, color: "text-green-300" },
  { id: "ani_chick_egg", label: "Chick", icon: Kawaii.KawaiiChick, color: "text-yellow-200" },
  { id: "ani_pengu_ice", label: "Penguin", icon: Kawaii.KawaiiPenguin, color: "text-blue-900" },
  { id: "ani_fox_tail", label: "Fox", icon: Kawaii.KawaiiFox, color: "text-orange-400" },
  { id: "ani_koala_leaf", label: "Koala", icon: Kawaii.KawaiiKoala, color: "text-slate-300" },
  { id: "ani_piggy_pink", label: "Piggy", icon: Kawaii.KawaiiPig, color: "text-pink-100" },
  { id: "ani_ducky", label: "Ducky", icon: Kawaii.KawaiiChick, color: "text-yellow-400" },
  { id: "ani_puppy", label: "Puppy", icon: Kawaii.TeddyBear, color: "text-stone-300" },

  // --- NATURE: STARS & CLOUDS (36-50) ---
  { id: "aes_cloud_soft", label: "Soft Cloud", icon: Kawaii.KawaiiCloud, color: "text-white" },
  { id: "aes_cloud_pink", label: "Pink Cloud", icon: Kawaii.KawaiiCloud, color: "text-pink-50" },
  { id: "aes_sparkle_gold", label: "Gold Star", icon: Kawaii.PastelSparkle, color: "text-yellow-200" },
  { id: "aes_sparkle_white", label: "Sparkle", icon: Kawaii.PastelSparkle, color: "text-white" },
  { id: "aes_star_twinkle", label: "Twinkle", icon: Kawaii.KawaiiStar, color: "text-yellow-100" },
  { id: "aes_star_puffy", label: "Puffy Star", icon: Kawaii.CuteStarIcon, color: "text-amber-200" },
  { id: "aes_moon_dream", label: "Moon", icon: Kawaii.MoonSticker, color: "text-yellow-50" },
  { id: "aes_planet_cute", label: "Saturn", icon: Kawaii.PlanetSticker, color: "text-purple-200" },
  { id: "aes_rainbow_pastel", label: "Rainbow", icon: Kawaii.RainbowSticker, color: "" },
  { id: "aes_crystal_ice", label: "Crystal", icon: Kawaii.CrystalSticker, color: "text-cyan-100" },
  { id: "aes_flower_daisy", label: "Daisy", icon: Kawaii.FlowerSticker, color: "text-white" },
  { id: "aes_flower_sakura", label: "Sakura", icon: Kawaii.FlowerSticker, color: "text-pink-200" },
  { id: "aes_clover_lucky", label: "Clover", icon: Kawaii.CloverSticker, color: "text-green-400" },
  { id: "aes_sun_bright", label: "Sun", icon: Kawaii.SunSticker, color: "text-orange-200" },
  { id: "aes_butterfly", label: "Butterfly", icon: Kawaii.WingedHeart, color: "text-indigo-200" },

  // --- FOOD & DRINK (51-70) ---
  { id: "food_boba_milk", label: "Boba", icon: Kawaii.BobaSticker, color: "" },
  { id: "food_strawberry_red", label: "Berry", icon: Kawaii.StrawberrySticker, color: "" },
  { id: "food_cake_slice", label: "Cake", icon: Kawaii.CupcakeSticker, color: "" },
  { id: "food_donut_glaze", label: "Donut", icon: Kawaii.DonutSticker, color: "" },
  { id: "food_icecream_pink", label: "Ice Cream", icon: Kawaii.IceCreamSticker, color: "" },
  { id: "food_sushi_tuna", label: "Sushi", icon: Kawaii.SushiSticker, color: "" },
  { id: "food_pizza_slice", label: "Pizza", icon: Kawaii.PizzaSticker, color: "" },
  { id: "food_cherry_twin", label: "Cherry", icon: Kawaii.CherrySticker, color: "" },
  { id: "food_peach_soft", label: "Peach", icon: Kawaii.PeachSticker, color: "" },
  { id: "food_milk_carton", label: "Milk", icon: Kawaii.MilkSticker, color: "" },
  { id: "food_coffee_cup", label: "Coffee", icon: Kawaii.BobaSticker, color: "text-amber-800" },
  { id: "food_cookie", label: "Cookie", icon: Kawaii.DonutSticker, color: "text-amber-600" },
  { id: "food_bread", label: "Bread", icon: Kawaii.TeddyBear, color: "text-orange-200" },
  { id: "food_juice", label: "Juice", icon: Kawaii.MilkSticker, color: "text-orange-300" },
  { id: "food_honey", label: "Honey", icon: Kawaii.KawaiiStar, color: "text-amber-500" },
  { id: "food_pancake", label: "Pancake", icon: Kawaii.DonutSticker, color: "text-amber-200" },
  { id: "food_croissant", label: "Croissant", icon: Kawaii.KawaiiCloud, color: "text-orange-200" },
  { id: "food_ramen", label: "Ramen", icon: Kawaii.SushiSticker, color: "text-yellow-100" },
  { id: "food_dango", label: "Dango", icon: Kawaii.FlowerSticker, color: "text-green-100" },
  { id: "food_melon", label: "Melon", icon: Kawaii.KawaiiFrog, color: "text-green-200" },

  // --- KOREAN TEXT & SLANG (71-90) ---
  { id: "txt_slay_kr", label: "Slay", icon: Kawaii.SlayText, color: "" },
  { id: "txt_cutie_kr", label: "Cutie", icon: Kawaii.CutieText, color: "" },
  { id: "txt_besties_kr", label: "Besties", icon: Kawaii.BestiesText, color: "" },
  { id: "txt_love_kr", label: "Love", icon: Kawaii.LoveText, color: "" },
  { id: "txt_happy_kr", label: "Happy", icon: Kawaii.HappyText, color: "" },
  { id: "txt_smile_kr", label: "Smile", icon: Kawaii.SmileText, color: "" },
  { id: "txt_wow_kr", label: "Wow", icon: Kawaii.WowText, color: "" },
  { id: "txt_hello_kr", label: "Hello", icon: Kawaii.HelloText, color: "" },
  { id: "txt_queen_kr", label: "Queen", icon: Kawaii.QueenText, color: "" },
  { id: "txt_cool_kr", label: "Cool", icon: Kawaii.CoolText, color: "" },
  { id: "txt_kitsch", label: "Kitsch", icon: Kawaii.SlayText, color: "text-purple-400" },
  { id: "txt_mood", label: "Mood", icon: Kawaii.CutieText, color: "text-blue-400" },
  { id: "txt_vibes", label: "Vibes", icon: Kawaii.BestiesText, color: "text-emerald-400" },
  { id: "txt_daily", label: "Daily", icon: Kawaii.HelloText, color: "text-stone-400" },
  { id: "txt_xoxo", label: "XOXO", icon: Kawaii.LoveText, color: "text-rose-400" },
  { id: "txt_swag", label: "Swag", icon: Kawaii.QueenText, color: "text-black" },
  { id: "txt_pretty", label: "Pretty", icon: Kawaii.CutieText, color: "text-pink-400" },
  { id: "txt_angel", label: "Angel", icon: Kawaii.WowText, color: "text-blue-100" },
  { id: "txt_glow", label: "Glow", icon: Kawaii.SmileText, color: "text-yellow-400" },
  { id: "txt_lucky", label: "Lucky", icon: Kawaii.HappyText, color: "text-green-500" },

  // --- ACCESSORIES: WINGS, CROWN, CAMERA (91-100) ---
  { id: "acc_wings_angel", label: "Angel Wings", icon: Kawaii.WingedHeart, color: "text-white" },
  { id: "acc_wings_devil", label: "Devil Wings", icon: Kawaii.WingedHeart, color: "text-red-900" },
  { id: "acc_crown_gold", label: "Gold Crown", icon: Kawaii.QueenText, color: "text-yellow-500" },
  { id: "acc_polaroid", label: "Polaroid", icon: Kawaii.CrystalSticker, color: "text-white" },
  { id: "acc_camera", label: "Camera", icon: Kawaii.CrystalSticker, color: "text-zinc-400" },
  { id: "acc_glasses", label: "Glass", icon: Kawaii.DoubleHeart, color: "text-black" },
  { id: "acc_sparkles", label: "Stars", icon: Kawaii.PastelSparkle, color: "text-white" },
  { id: "acc_notes", label: "Music", icon: Kawaii.KawaiiStar, color: "text-indigo-400" },
  { id: "acc_heart_ring", label: "Ring", icon: Kawaii.DoubleHeart, color: "text-amber-400" },
  { id: "acc_bday_hat", label: "Bday", icon: Kawaii.KawaiiCloud, color: "text-pink-300" },
];
