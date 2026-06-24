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
 * Footer branding minimized to 8% (192 units) to maximize photo area.
 */
const CANVAS_W = 1600;
const CANVAS_H = 2400;
const FOOTER_H = 192; 

export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - 2x6 STRIP (STRICT 5 UNIQUE LAYOUTS)
  {
    id: "p50-l1",
    label: "CLASSIC",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 700 },
      { x: 40, y: 760, w: 1520, h: 700 },
      { x: 40, y: 1480, w: 1520, h: 700 },
    ],
  },
  {
    id: "p50-l2",
    label: "HERO",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1080 },
      { x: 40, y: 1140, w: 740, h: 1060 },
      { x: 820, y: 1140, w: 740, h: 1060 },
    ],
  },
  {
    id: "p50-l3",
    label: "MODERN",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 740 },
      { x: 0, y: 740, w: 1600, h: 740 },
      { x: 0, y: 1480, w: 1600, h: 740 },
    ],
  },
  {
    id: "p50-l4",
    label: "SQUARE",
    package: 50,
    slots: [
      { x: 100, y: 80, w: 1400, h: 680 },
      { x: 100, y: 800, w: 1400, h: 680 },
      { x: 100, y: 1520, w: 1400, h: 680 },
    ],
  },
  {
    id: "p50-l5",
    label: "DYNAMIC",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 750, h: 1100 },
      { x: 810, y: 40, w: 750, h: 1100 },
      { x: 40, y: 1160, w: 1520, h: 1040 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - 4x6 PHOTO (1600x2400) (10 UNIQUE LAYOUTS)
  {
    id: "p100-l1",
    label: "GRID",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 740, h: 700 }, { x: 820, y: 40, w: 740, h: 700 },
      { x: 40, y: 760, w: 740, h: 700 }, { x: 820, y: 760, w: 740, h: 700 },
      { x: 40, y: 1480, w: 740, h: 700 }, { x: 820, y: 1480, w: 740, h: 700 },
    ],
  },
  {
    id: "p100-l2",
    label: "TOP HERO",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1100 },
      { x: 40, y: 1160, w: 485, h: 510 }, { x: 555, y: 1160, w: 485, h: 510 }, { x: 1070, y: 1160, w: 490, h: 510 },
      { x: 40, y: 1690, w: 750, h: 520 }, { x: 810, y: 1690, w: 750, h: 520 },
    ],
  },
  {
    id: "p100-l3",
    label: "STORY",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 40, y: 40 + i * 365, w: 1520, h: 345
    })),
  },
  {
    id: "p100-l4",
    label: "FILMSTRIP",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 0 : 805, y: Math.floor(i / 2) * 740, w: 795, h: 735
    })),
  },
  {
    id: "p100-l5",
    label: "MOSAIC",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1020, h: 1020 },
      { x: 1080, y: 40, w: 480, h: 500 },
      { x: 1080, y: 560, w: 480, h: 500 },
      { x: 40, y: 1080, w: 500, h: 1120 },
      { x: 560, y: 1080, w: 1000, h: 550 },
      { x: 560, y: 1650, w: 1000, h: 550 },
    ],
  },
  {
    id: "p100-l6",
    label: "RHYTHM",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 750, h: 530 }, { x: 810, y: 40, w: 750, h: 530 },
      { x: 40, y: 590, w: 1520, h: 1050 },
      { x: 40, y: 1660, w: 485, h: 550 }, { x: 555, y: 1660, w: 485, h: 550 }, { x: 1070, y: 1660, w: 490, h: 550 },
    ],
  },
  {
    id: "p100-l7",
    label: "CINEMA",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 0, y: i * 370, w: 1600, h: 368
    })),
  },
  {
    id: "p100-l8",
    label: "FOCUS",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 485, h: 520 }, { x: 555, y: 40, w: 485, h: 520 }, { x: 1070, y: 40, w: 490, h: 520 },
      { x: 40, y: 580, w: 750, h: 540 }, { x: 810, y: 580, w: 750, h: 540 },
      { x: 40, y: 1140, w: 1520, h: 1080 },
    ],
  },
  {
    id: "p100-l9",
    label: "SPLIT",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 740, h: 1100 }, { x: 820, y: 40, w: 740, h: 1100 },
      { x: 40, y: 1160, w: 740, h: 520 }, { x: 820, y: 1160, w: 740, h: 520 },
      { x: 40, y: 1700, w: 740, h: 520 }, { x: 820, y: 1700, w: 740, h: 520 },
    ],
  },
  {
    id: "p100-l10",
    label: "CLEAN",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 740 }, { x: 800, y: 0, w: 800, h: 740 },
      { x: 0, y: 740, w: 800, h: 740 }, { x: 800, y: 740, w: 800, h: 740 },
      { x: 0, y: 1480, w: 800, h: 740 }, { x: 800, y: 1480, w: 800, h: 740 },
    ],
  }
];
