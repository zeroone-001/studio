
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
 * Footer branding minimized to 8% (192 units) to maximize photo area and remove free space.
 */
const CANVAS_W = 1600;
const CANVAS_H = 2400;
const FOOTER_H = 192; 
const CONTENT_H = CANVAS_H - FOOTER_H; // 2208 units for photos

export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - 2x6 STRIP (Unique Layouts)
  {
    id: "p50-l1",
    label: "CLASSIC",
    package: 50,
    slots: [
      { x: 20, y: 20, w: 1560, h: 710 },
      { x: 20, y: 745, w: 1560, h: 710 },
      { x: 20, y: 1470, w: 1560, h: 710 },
    ],
  },
  {
    id: "p50-l2",
    label: "HERO",
    package: 50,
    slots: [
      { x: 20, y: 20, w: 1560, h: 1080 },
      { x: 20, y: 1120, w: 770, h: 1060 },
      { x: 810, y: 1120, w: 770, h: 1060 },
    ],
  },
  {
    id: "p50-l3",
    label: "MODERN",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 735 },
      { x: 0, y: 735, w: 1600, h: 735 },
      { x: 0, y: 1470, w: 1600, h: 735 },
    ],
  },
  {
    id: "p50-l4",
    label: "SQUARE",
    package: 50,
    slots: [
      { x: 80, y: 60, w: 1440, h: 680 },
      { x: 80, y: 760, w: 1440, h: 680 },
      { x: 80, y: 1460, w: 1440, h: 680 },
    ],
  },
  {
    id: "p50-l5",
    label: "DYNAMIC",
    package: 50,
    slots: [
      { x: 20, y: 20, w: 770, h: 1100 },
      { x: 810, y: 20, w: 770, h: 1100 },
      { x: 20, y: 1140, w: 1560, h: 1060 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - 4x6 PHOTO (1600x2400)
  {
    id: "p100-l1",
    label: "GRID",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 770, h: 710 }, { x: 810, y: 20, w: 770, h: 710 },
      { x: 20, y: 745, w: 770, h: 710 }, { x: 810, y: 745, w: 770, h: 710 },
      { x: 20, y: 1470, w: 770, h: 710 }, { x: 810, y: 1470, w: 770, h: 710 },
    ],
  },
  {
    id: "p100-l2",
    label: "TOP HERO",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 1560, h: 1100 },
      { x: 20, y: 1140, w: 505, h: 520 }, { x: 545, y: 1140, w: 505, h: 520 }, { x: 1070, y: 1140, w: 510, h: 520 },
      { x: 20, y: 1680, w: 770, h: 520 }, { x: 810, y: 1680, w: 770, h: 520 },
    ],
  },
  {
    id: "p100-l3",
    label: "STORY",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 20,
      y: 20 + i * 365,
      w: 1560,
      h: 345
    })),
  },
  {
    id: "p100-l4",
    label: "FILMSTRIP",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 0 : 805,
      y: Math.floor(i / 2) * 735,
      w: 795,
      h: 730
    })),
  },
  {
    id: "p100-l5",
    label: "MOSAIC",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 1040, h: 1040 },
      { x: 1080, y: 20, w: 500, h: 510 },
      { x: 1080, y: 550, w: 500, h: 510 },
      { x: 20, y: 1080, w: 520, h: 1120 },
      { x: 560, y: 1080, w: 1020, h: 550 },
      { x: 560, y: 1650, w: 1020, h: 550 },
    ],
  },
  {
    id: "p100-l6",
    label: "RHYTHM",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 770, h: 530 }, { x: 810, y: 20, w: 770, h: 530 },
      { x: 20, y: 570, w: 1560, h: 1060 },
      { x: 20, y: 1650, w: 505, h: 550 }, { x: 545, y: 1650, w: 505, h: 550 }, { x: 1070, y: 1650, w: 510, h: 550 },
    ],
  },
  {
    id: "p100-l7",
    label: "CINEMA",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 0,
      y: i * 368,
      w: 1600,
      h: 366
    })),
  },
  {
    id: "p100-l8",
    label: "FOCUS",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 505, h: 530 }, { x: 545, y: 20, w: 505, h: 530 }, { x: 1070, y: 20, w: 510, h: 530 },
      { x: 20, y: 570, w: 770, h: 530 }, { x: 810, y: 570, w: 770, h: 530 },
      { x: 20, y: 1120, w: 1560, h: 1080 },
    ],
  },
  {
    id: "p100-l9",
    label: "SPLIT",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 770, h: 1100 }, { x: 810, y: 20, w: 770, h: 1100 },
      { x: 20, y: 1140, w: 770, h: 530 }, { x: 810, y: 1140, w: 770, h: 530 },
      { x: 20, y: 1690, w: 770, h: 510 }, { x: 810, y: 1690, w: 770, h: 510 },
    ],
  },
  {
    id: "p100-l10",
    label: "CLEAN",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 736 }, { x: 800, y: 0, w: 800, h: 736 },
      { x: 0, y: 736, w: 800, h: 736 }, { x: 800, y: 736, w: 800, h: 736 },
      { x: 0, y: 1472, w: 800, h: 736 }, { x: 800, y: 1472, w: 800, h: 736 },
    ],
  }
];
