
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
 * Footer branding reduced to 8% (192 units) to maximize photo area
 */
const FOOTER_HEIGHT = 192;
const CANVAS_H = 2400;
const MAX_H = CANVAS_H - FOOTER_HEIGHT; // 2208 units for photos

export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - 2x6 STRIP (Unique Layouts)
  {
    id: "p50-l1",
    label: "CLASSIC",
    package: 50,
    slots: [
      { x: 20, y: 20, w: 1560, h: 710 },
      { x: 20, y: 750, w: 1560, h: 710 },
      { x: 20, y: 1480, w: 1560, h: 710 },
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
      { x: 0, y: 0, w: 1600, h: 730 },
      { x: 0, y: 735, w: 1600, h: 730 },
      { x: 0, y: 1470, w: 1600, h: 730 },
    ],
  },
  {
    id: "p50-l4",
    label: "SQUARE",
    package: 50,
    slots: [
      { x: 60, y: 40, w: 1480, h: 700 },
      { x: 60, y: 760, w: 1480, h: 700 },
      { x: 60, y: 1480, w: 1480, h: 700 },
    ],
  },
  {
    id: "p50-l5",
    label: "DYNAMIC",
    package: 50,
    slots: [
      { x: 20, y: 20, w: 770, h: 1100 },
      { x: 810, y: 20, w: 770, h: 1100 },
      { x: 20, y: 1140, w: 1560, h: 1040 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - 4x6 PHOTO (1600x2400)
  {
    id: "p100-l1",
    label: "GRID",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 770, h: 710 }, { x: 810, y: 20, w: 770, h: 710 },
      { x: 20, y: 750, w: 770, h: 710 }, { x: 810, y: 750, w: 770, h: 710 },
      { x: 20, y: 1480, w: 770, h: 710 }, { x: 810, y: 1480, w: 770, h: 710 },
    ],
  },
  {
    id: "p100-l2",
    label: "THE HERO",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 1560, h: 1140 },
      { x: 20, y: 1180, w: 505, h: 500 }, { x: 545, y: 1180, w: 505, h: 500 }, { x: 1070, y: 1180, w: 510, h: 500 },
      { x: 20, y: 1700, w: 770, h: 490 }, { x: 810, y: 1700, w: 770, h: 490 },
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
      h: 725
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
      { x: 20, y: 1080, w: 520, h: 1110 },
      { x: 560, y: 1080, w: 1020, h: 545 },
      { x: 560, y: 1645, w: 1020, h: 545 },
    ],
  },
  {
    id: "p100-l6",
    label: "RHYTHM",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 770, h: 520 }, { x: 810, y: 20, w: 770, h: 520 },
      { x: 20, y: 560, w: 1560, h: 1080 },
      { x: 20, y: 1660, w: 505, h: 530 }, { x: 545, y: 1660, w: 505, h: 530 }, { x: 1070, y: 1660, w: 510, h: 530 },
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
      h: 360
    })),
  },
  {
    id: "p100-l8",
    label: "FOCUS",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 505, h: 520 }, { x: 545, y: 20, w: 505, h: 520 }, { x: 1070, y: 20, w: 510, h: 520 },
      { x: 20, y: 560, w: 770, h: 520 }, { x: 810, y: 560, w: 770, h: 520 },
      { x: 20, y: 1100, w: 1560, h: 1090 },
    ],
  },
  {
    id: "p100-l9",
    label: "SPLIT",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 770, h: 1080 }, { x: 810, y: 20, w: 770, h: 1080 },
      { x: 20, y: 1120, w: 770, h: 535 }, { x: 810, y: 1120, w: 770, h: 535 },
      { x: 20, y: 1675, w: 770, h: 515 }, { x: 810, y: 1675, w: 770, h: 515 },
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
