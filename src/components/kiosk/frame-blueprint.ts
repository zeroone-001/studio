
export type PhotoSlot = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type FrameBlueprint = {
  id: string;
  label: string;
  package: 50 | 100;
  slots: PhotoSlot[];
  quotePosition?: { x: number; y: number; w: number; h: number };
  logoPosition?: { x: number; y: number };
  datePosition?: { x: number; y: number };
};

/**
 * Professional Studio Blueprints (Optimized for 4x6 / 2x6)
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer branding reserved at bottom (10% height = 240 units)
 */
const FOOTER_HEIGHT = 240;
const CANVAS_H = 2400;
const MAX_H = CANVAS_H - FOOTER_HEIGHT; // 2160 units for photos

export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - 2x6 STRIP (Internal Width is 800 for the strip itself)
  {
    id: "p50-l1",
    label: "CLASSIC",
    package: 50,
    slots: [
      { x: 20, y: 20, w: 1560, h: 690 },
      { x: 20, y: 730, w: 1560, h: 690 },
      { x: 20, y: 1440, w: 1560, h: 690 },
    ],
  },
  {
    id: "p50-l2",
    label: "HERO",
    package: 50,
    slots: [
      { x: 20, y: 20, w: 1560, h: 1040 },
      { x: 20, y: 1080, w: 770, h: 1050 },
      { x: 810, y: 1080, w: 770, h: 1050 },
    ],
  },
  {
    id: "p50-l3",
    label: "MODERN",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 710 },
      { x: 0, y: 720, w: 1600, h: 710 },
      { x: 0, y: 1440, w: 1600, h: 710 },
    ],
  },
  {
    id: "p50-l4",
    label: "SQUARE",
    package: 50,
    slots: [
      { x: 60, y: 40, w: 1480, h: 680 },
      { x: 60, y: 740, w: 1480, h: 680 },
      { x: 60, y: 1440, w: 1480, h: 680 },
    ],
  },
  {
    id: "p50-l5",
    label: "DYNAMIC",
    package: 50,
    slots: [
      { x: 20, y: 20, w: 770, h: 1050 },
      { x: 810, y: 20, w: 770, h: 1050 },
      { x: 20, y: 1090, w: 1560, h: 1040 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - 4x6 PHOTO (1600x2400)
  {
    id: "p100-l1",
    label: "GRID",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 770, h: 690 }, { x: 810, y: 20, w: 770, h: 690 },
      { x: 20, y: 730, w: 770, h: 690 }, { x: 810, y: 730, w: 770, h: 690 },
      { x: 20, y: 1440, w: 770, h: 690 }, { x: 810, y: 1440, w: 770, h: 690 },
    ],
  },
  {
    id: "p100-l2",
    label: "THE HERO",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 1560, h: 1100 },
      { x: 20, y: 1140, w: 505, h: 495 }, { x: 545, y: 1140, w: 505, h: 495 }, { x: 1070, y: 1140, w: 510, h: 495 },
      { x: 20, y: 1655, w: 770, h: 485 }, { x: 810, y: 1655, w: 770, h: 485 },
    ],
  },
  {
    id: "p100-l3",
    label: "STORY",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 20,
      y: 20 + i * 355,
      w: 1560,
      h: 335
    })),
  },
  {
    id: "p100-l4",
    label: "FILMSTRIP",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 0 : 805,
      y: Math.floor(i / 2) * 720,
      w: 795,
      h: 710
    })),
  },
  {
    id: "p100-l5",
    label: "MOSAIC",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 1000, h: 1000 },
      { x: 1040, y: 20, w: 540, h: 480 },
      { x: 1040, y: 520, w: 540, h: 500 },
      { x: 20, y: 1040, w: 500, h: 1080 },
      { x: 540, y: 1040, w: 1040, h: 520 },
      { x: 540, y: 1580, w: 1040, h: 540 },
    ],
  },
  {
    id: "p100-l6",
    label: "RHYTHM",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 770, h: 500 }, { x: 810, y: 20, w: 770, h: 500 },
      { x: 20, y: 540, w: 1560, h: 1040 },
      { x: 20, y: 1600, w: 505, h: 540 }, { x: 545, y: 1600, w: 505, h: 540 }, { x: 1070, y: 1600, w: 510, h: 540 },
    ],
  },
  {
    id: "p100-l7",
    label: "CINEMA",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 0,
      y: i * 360,
      w: 1600,
      h: 355
    })),
  },
  {
    id: "p100-l8",
    label: "FOCUS",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 505, h: 500 }, { x: 545, y: 20, w: 505, h: 500 }, { x: 1070, y: 20, w: 510, h: 500 },
      { x: 20, y: 540, w: 770, h: 500 }, { x: 810, y: 540, w: 770, h: 500 },
      { x: 20, y: 1060, w: 1560, h: 1080 },
    ],
  },
  {
    id: "p100-l9",
    label: "SPLIT",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 770, h: 1050 }, { x: 810, y: 20, w: 770, h: 1050 },
      { x: 20, y: 1090, w: 770, h: 525 }, { x: 810, y: 1090, w: 770, h: 525 },
      { x: 20, y: 1635, w: 770, h: 510 }, { x: 810, y: 1635, w: 770, h: 510 },
    ],
  },
  {
    id: "p100-l10",
    label: "CLEAN",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 720 }, { x: 800, y: 0, w: 800, h: 720 },
      { x: 0, y: 720, w: 800, h: 720 }, { x: 800, y: 720, w: 800, h: 720 },
      { x: 0, y: 1440, w: 800, h: 720 }, { x: 800, y: 1440, w: 800, h: 720 },
    ],
  }
];
