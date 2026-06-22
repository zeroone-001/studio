
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
 * Footer branding minimized to 8.5% (204 units) to maximize photo area.
 */
const CANVAS_W = 1600;
const CANVAS_H = 2400;
const FOOTER_H = 204; 

export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - 2x6 STRIP (10 UNIQUE LAYOUTS)
  {
    id: "p50-l1",
    label: "CLASSIC",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 690 },
      { x: 40, y: 760, w: 1520, h: 690 },
      { x: 40, y: 1480, w: 1520, h: 690 },
    ],
  },
  {
    id: "p50-l2",
    label: "HERO",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1060 },
      { x: 40, y: 1120, w: 740, h: 1050 },
      { x: 820, y: 1120, w: 740, h: 1050 },
    ],
  },
  {
    id: "p50-l3",
    label: "MODERN",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 730 },
      { x: 0, y: 730, w: 1600, h: 730 },
      { x: 0, y: 1460, w: 1600, h: 730 },
    ],
  },
  {
    id: "p50-l4",
    label: "SQUARE",
    package: 50,
    slots: [
      { x: 100, y: 80, w: 1400, h: 660 },
      { x: 100, y: 780, w: 1400, h: 660 },
      { x: 100, y: 1480, w: 1400, h: 660 },
    ],
  },
  {
    id: "p50-l5",
    label: "DYNAMIC",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 750, h: 1080 },
      { x: 810, y: 40, w: 750, h: 1080 },
      { x: 40, y: 1140, w: 1520, h: 1050 },
    ],
  },
  {
    id: "p50-l6",
    label: "STAGGER",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 500 },
      { x: 40, y: 560, w: 1520, h: 1080 },
      { x: 40, y: 1660, w: 1520, h: 500 },
    ],
  },
  {
    id: "p50-l7",
    label: "POLAROID",
    package: 50,
    slots: [
      { x: 120, y: 120, w: 1360, h: 630 },
      { x: 120, y: 800, w: 1360, h: 630 },
      { x: 120, y: 1480, w: 1360, h: 630 },
    ],
  },
  {
    id: "p50-l8",
    label: "TRIO",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1000 },
      { x: 40, y: 1060, w: 1520, h: 560 },
      { x: 40, y: 1640, w: 1520, h: 540 },
    ],
  },
  {
    id: "p50-l9",
    label: "PANORAMA",
    package: 50,
    slots: [
      { x: 0, y: 40, w: 1600, h: 480 },
      { x: 0, y: 560, w: 1600, h: 1080 },
      { x: 0, y: 1680, w: 1600, h: 480 },
    ],
  },
  {
    id: "p50-l10",
    label: "MINIMAL",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 733 },
      { x: 0, y: 733, w: 1600, h: 733 },
      { x: 0, y: 1466, w: 1600, h: 734 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - 4x6 PHOTO (1600x2400) (10 UNIQUE LAYOUTS)
  {
    id: "p100-l1",
    label: "GRID",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 740, h: 690 }, { x: 820, y: 40, w: 740, h: 690 },
      { x: 40, y: 760, w: 740, h: 690 }, { x: 820, y: 760, w: 740, h: 690 },
      { x: 40, y: 1480, w: 740, h: 690 }, { x: 820, y: 1480, w: 740, h: 690 },
    ],
  },
  {
    id: "p100-l2",
    label: "TOP HERO",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1080 },
      { x: 40, y: 1140, w: 485, h: 500 }, { x: 555, y: 1140, w: 485, h: 500 }, { x: 1070, y: 1140, w: 490, h: 500 },
      { x: 40, y: 1670, w: 750, h: 510 }, { x: 810, y: 1670, w: 750, h: 510 },
    ],
  },
  {
    id: "p100-l3",
    label: "STORY",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 40,
      y: 40 + i * 360,
      w: 1520,
      h: 340
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
      { x: 40, y: 40, w: 1020, h: 1020 },
      { x: 1080, y: 40, w: 480, h: 490 },
      { x: 1080, y: 550, w: 480, h: 510 },
      { x: 40, y: 1080, w: 500, h: 1100 },
      { x: 560, y: 1080, w: 1000, h: 540 },
      { x: 560, y: 1640, w: 1000, h: 540 },
    ],
  },
  {
    id: "p100-l6",
    label: "RHYTHM",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 750, h: 520 }, { x: 810, y: 40, w: 750, h: 520 },
      { x: 40, y: 580, w: 1520, h: 1040 },
      { x: 40, y: 1640, w: 485, h: 540 }, { x: 555, y: 1640, w: 485, h: 540 }, { x: 1070, y: 1640, w: 490, h: 540 },
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
      { x: 40, y: 40, w: 485, h: 510 }, { x: 555, y: 40, w: 485, h: 510 }, { x: 1070, y: 40, w: 490, h: 510 },
      { x: 40, y: 570, w: 750, h: 530 }, { x: 810, y: 570, w: 750, h: 530 },
      { x: 40, y: 1120, w: 1520, h: 1060 },
    ],
  },
  {
    id: "p100-l9",
    label: "SPLIT",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 740, h: 1080 }, { x: 820, y: 40, w: 740, h: 1080 },
      { x: 40, y: 1140, w: 740, h: 510 }, { x: 820, y: 1140, w: 740, h: 510 },
      { x: 40, y: 1670, w: 740, h: 510 }, { x: 820, y: 1670, w: 740, h: 510 },
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
