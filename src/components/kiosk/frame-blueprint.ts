
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
 * Footer branding reserved at the bottom (approx 10-12%)
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - 2x6 STRIP (Scaled for 1600x2400 sheet, but logic handles 800w strips)
  {
    id: "p50-l1",
    label: "CLASSIC STRIP",
    package: 50,
    slots: [
      { x: 20, y: 20, w: 1560, h: 680 },
      { x: 20, y: 720, w: 1560, h: 680 },
      { x: 20, y: 1420, w: 1560, h: 680 },
    ],
  },
  {
    id: "p50-l2",
    label: "HERO STRIP",
    package: 50,
    slots: [
      { x: 20, y: 20, w: 1560, h: 1040 },
      { x: 20, y: 1080, w: 770, h: 1020 },
      { x: 810, y: 1080, w: 770, h: 1020 },
    ],
  },
  {
    id: "p50-l3",
    label: "MODERN STRIP",
    package: 50,
    slots: [
      { x: 10, y: 10, w: 1580, h: 690 },
      { x: 10, y: 710, w: 1580, h: 690 },
      { x: 10, y: 1410, w: 1580, h: 690 },
    ],
  },
  {
    id: "p50-l4",
    label: "SQUARE STRIP",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 660 },
      { x: 40, y: 730, w: 1520, h: 660 },
      { x: 40, y: 1420, w: 1520, h: 660 },
    ],
  },
  {
    id: "p50-l5",
    label: "EDGELESS STRIP",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 700 },
      { x: 0, y: 710, w: 1600, h: 700 },
      { x: 0, y: 1420, w: 1600, h: 700 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - 4x6 PHOTO (1600x2400)
  {
    id: "p100-l1",
    label: "GRID 2x3",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 770, h: 690 },
      { x: 810, y: 20, w: 770, h: 690 },
      { x: 20, y: 730, w: 770, h: 690 },
      { x: 810, y: 730, w: 770, h: 690 },
      { x: 20, y: 1440, w: 770, h: 690 },
      { x: 810, y: 1440, w: 770, h: 690 },
    ],
  },
  {
    id: "p100-l2",
    label: "CENTER HERO",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 1560, h: 1100 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 20 + (i % 3) * 525,
        y: 1140 + Math.floor(i / 3) * 500,
        w: 510,
        h: 480
      }))
    ],
  },
  {
    id: "p100-l3",
    label: "STORYBOARD",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 20,
      y: 20 + i * 350,
      w: 1560,
      h: 330
    })),
  },
  {
    id: "p100-l4",
    label: "FILM ROLL",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 20 : 810,
      y: 20 + Math.floor(i / 2) * 710,
      w: 770,
      h: 690
    })),
  },
  {
    id: "p100-l5",
    label: "SCATTER",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 780, h: 780 },
      { x: 810, y: 50, w: 770, h: 770 },
      { x: 20, y: 820, w: 720, h: 720 },
      { x: 760, y: 820, w: 820, h: 720 },
      { x: 20, y: 1560, w: 770, h: 600 },
      { x: 810, y: 1560, w: 770, h: 600 },
    ],
  },
  {
    id: "p100-l6",
    label: "MOSAIC",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 1080, h: 1080 },
      { x: 1120, y: 20, w: 460, h: 460 },
      { x: 1120, y: 500, w: 460, h: 600 },
      { x: 20, y: 1120, w: 520, h: 1040 },
      { x: 560, y: 1120, w: 1020, h: 500 },
      { x: 560, y: 1640, w: 1020, h: 520 },
    ],
  },
  {
    id: "p100-l7",
    label: "ULTIMATE HERO",
    package: 100,
    slots: [
      { x: 20, y: 20, w: 1560, h: 1000 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 20 + i * 315,
        y: 1040,
        w: 300,
        h: 1120
      }))
    ],
  },
  {
    id: "p100-l8",
    label: "VERTICAL SPLIT",
    package: 100,
    slots: [
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 20, y: 20 + i * 710, w: 775, h: 690 })),
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 805, y: 20 + i * 710, w: 775, h: 690 })),
    ],
  },
  {
    id: "p100-l9",
    label: "SQUARE GRID",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 40 : 820,
      y: 40 + Math.floor(i / 2) * 700,
      w: 740,
      h: 680
    })),
  },
  {
    id: "p100-l10",
    label: "CLEAN 6",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 0 : 800,
      y: Math.floor(i / 2) * 720,
      w: 800,
      h: 720
    })),
  }
];
