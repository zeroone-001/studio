
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

export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - 2x6 STRIP (Internal units scaled to 1600x2400 sheet)
  // Each strip is 800 units wide. Coordinates are relative to a 1600 wide sheet.
  // Y + H must not exceed 2040 (leaving 15% for footer).
  {
    id: "p50-l1",
    label: "CLASSIC STRIP",
    package: 50,
    slots: [
      { x: 150, y: 100, w: 1300, h: 600 },
      { x: 150, y: 750, w: 1300, h: 600 },
      { x: 150, y: 1400, w: 1300, h: 600 },
    ],
  },
  {
    id: "p50-l2",
    label: "MODERN STRIP",
    package: 50,
    slots: [
      { x: 100, y: 150, w: 1400, h: 550 },
      { x: 100, y: 750, w: 1400, h: 550 },
      { x: 100, y: 1350, w: 1400, h: 550 },
    ],
  },
  {
    id: "p50-l3",
    label: "SQUARE STRIP",
    package: 50,
    slots: [
      { x: 200, y: 100, w: 1200, h: 600 },
      { x: 200, y: 750, w: 1200, h: 600 },
      { x: 200, y: 1400, w: 1200, h: 600 },
    ],
  },
  {
    id: "p50-l4",
    label: "HERO STRIP",
    package: 50,
    slots: [
      { x: 100, y: 100, w: 1400, h: 1000 },
      { x: 100, y: 1150, w: 650, h: 600 },
      { x: 850, y: 1150, w: 650, h: 600 },
    ],
  },
  {
    id: "p50-l5",
    label: "MINIMAL STRIP",
    package: 50,
    slots: [
      { x: 300, y: 200, w: 1000, h: 500 },
      { x: 300, y: 750, w: 1000, h: 500 },
      { x: 300, y: 1300, w: 1000, h: 500 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - 4x6 PHOTO (Internal units 1600x2400)
  {
    id: "p100-l1",
    label: "GRID 2x3",
    package: 100,
    slots: [
      { x: 75, y: 100, w: 700, h: 600 },
      { x: 825, y: 100, w: 700, h: 600 },
      { x: 75, y: 750, w: 700, h: 600 },
      { x: 825, y: 750, w: 700, h: 600 },
      { x: 75, y: 1400, w: 700, h: 600 },
      { x: 825, y: 1400, w: 700, h: 600 },
    ],
  },
  {
    id: "p100-l2",
    label: "STORYBOARD",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 100,
      y: 80 + i * 320,
      w: 1400,
      h: 280
    })),
  },
  {
    id: "p100-l3",
    label: "CENTER HERO",
    package: 100,
    slots: [
      { x: 100, y: 100, w: 1400, h: 900 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 60 + (i % 3) * 510,
        y: 1050 + Math.floor(i / 3) * 550,
        w: 460,
        h: 500
      }))
    ],
  },
  {
    id: "p100-l4",
    label: "FILM ROLL",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 100 : 850,
      y: 100 + Math.floor(i / 2) * 650,
      w: 650,
      h: 600
    })),
  },
  {
    id: "p100-l5",
    label: "SCATTER",
    package: 100,
    slots: [
      { x: 100, y: 100, w: 700, h: 700 },
      { x: 850, y: 200, w: 650, h: 600 },
      { x: 50, y: 850, w: 600, h: 650 },
      { x: 700, y: 850, w: 850, h: 650 },
      { x: 100, y: 1550, w: 600, h: 650 },
      { x: 750, y: 1550, w: 750, h: 650 },
    ],
  },
  {
    id: "p100-l6",
    label: "VERTICAL SPLIT",
    package: 100,
    slots: [
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 100, y: 100 + i * 650, w: 650, h: 600 })),
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 850, y: 100 + i * 650, w: 650, h: 600 })),
    ],
  },
  {
    id: "p100-l7",
    label: "MOSAIC",
    package: 100,
    slots: [
      { x: 50, y: 50, w: 1000, h: 1000 },
      { x: 1100, y: 50, w: 450, h: 450 },
      { x: 1100, y: 550, w: 450, h: 500 },
      { x: 50, y: 1100, w: 450, h: 1000 },
      { x: 550, y: 1100, w: 1000, h: 480 },
      { x: 550, y: 1620, w: 1000, h: 480 },
    ],
  },
  {
    id: "p100-l8",
    label: "STRIP DOUBLE",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i < 3 ? 100 : 850,
      y: 100 + (i % 3) * 650,
      w: 650,
      h: 600
    })),
  },
  {
    id: "p100-l9",
    label: "DIAGONAL",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 50 + i * 180,
      y: 50 + i * 320,
      w: 450,
      h: 450
    })),
  },
  {
    id: "p100-l10",
    label: "ULTIMATE",
    package: 100,
    slots: [
      { x: 50, y: 50, w: 1500, h: 800 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 50 + i * 300,
        y: 900,
        w: 280,
        h: 1000
      }))
    ],
  }
];
