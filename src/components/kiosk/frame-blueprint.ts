
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
  // ₱50 PACKAGE (3 SHOTS) - EXACT REQUIREMENTS
  {
    id: "p50-l1",
    label: "LAYOUT 1",
    package: 50,
    slots: [
      { x: 200, y: 180, w: 1200, h: 500 },
      { x: 200, y: 770, w: 1200, h: 500 },
      { x: 200, y: 1360, w: 1200, h: 500 },
    ],
    quotePosition: { x: 180, y: 1980, w: 1240, h: 220 },
    logoPosition: { x: 220, y: 2280 },
    datePosition: { x: 1180, y: 2280 }
  },
  {
    id: "p50-l2",
    label: "LAYOUT 2",
    package: 50,
    slots: [
      { x: 140, y: 180, w: 1000, h: 450 },
      { x: 460, y: 760, w: 1000, h: 450 },
      { x: 140, y: 1340, w: 1000, h: 450 },
    ],
    quotePosition: { x: 180, y: 1940, w: 1240, h: 260 },
    logoPosition: { x: 140, y: 2350 },
    datePosition: { x: 1300, y: 2350 }
  },
  {
    id: "p50-l3",
    label: "LAYOUT 3",
    package: 50,
    slots: [
      { x: 120, y: 220, w: 900, h: 480 },
      { x: 120, y: 820, w: 900, h: 480 },
      { x: 120, y: 1420, w: 900, h: 480 },
    ],
    quotePosition: { x: 1080, y: 220, w: 300, h: 1680 },
    logoPosition: { x: 120, y: 2350 },
    datePosition: { x: 1300, y: 2350 }
  },
  {
    id: "p50-l4",
    label: "LAYOUT 4",
    package: 50,
    slots: [
      { x: 120, y: 220, w: 620, h: 620 },
      { x: 860, y: 220, w: 620, h: 620 },
      { x: 250, y: 980, w: 1100, h: 620 },
    ],
    quotePosition: { x: 60, y: 1820, w: 1480, h: 150 },
    logoPosition: { x: 120, y: 2350 },
    datePosition: { x: 1300, y: 2350 }
  },
  {
    id: "p50-l5",
    label: "LAYOUT 5",
    package: 50,
    slots: [
      { x: 400, y: 180, w: 800, h: 500 },
      { x: 120, y: 850, w: 620, h: 500 },
      { x: 860, y: 850, w: 620, h: 500 },
    ],
    quotePosition: { x: 60, y: 1700, w: 1480, h: 200 },
    logoPosition: { x: 120, y: 2350 },
    datePosition: { x: 1300, y: 2350 }
  },

  // ₱100 PACKAGE (6 SHOTS) - MAXIMIZED GRID
  {
    id: "p100-l1",
    label: "STRIP",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({ x: 220, y: 80 + i * 300, w: 1160, h: 240 })),
    quotePosition: { x: 220, y: 1950, w: 1160, h: 100 }
  },
  {
    id: "p100-l2",
    label: "GRID 2X3",
    package: 100,
    slots: [
      { x: 60, y: 80, w: 670, h: 520 },
      { x: 870, y: 80, w: 670, h: 520 },
      { x: 60, y: 660, w: 670, h: 520 },
      { x: 870, y: 660, w: 670, h: 520 },
      { x: 60, y: 1240, w: 670, h: 520 },
      { x: 870, y: 1240, w: 670, h: 520 },
    ],
    quotePosition: { x: 60, y: 1880, w: 1480, h: 60 }
  },
  {
    id: "p100-l3",
    label: "HERO",
    package: 100,
    slots: [
      { x: 180, y: 180, w: 1240, h: 500 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 60 + (i % 3) * 505,
        y: 720 + Math.floor(i / 3) * 450,
        w: 470,
        h: 420
      }))
    ],
    quotePosition: { x: 60, y: 1650, w: 1480, h: 100 }
  },
  {
    id: "p100-l4",
    label: "FILM",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({ x: 260, y: 80 + i * 265, w: 1080, h: 210 })),
    quotePosition: { x: 60, y: 1800, w: 1480, h: 100 }
  },
  {
    id: "p100-l5",
    label: "COMPACT",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 350 + (i % 2) * 450,
      y: 80 + Math.floor(i / 2) * 450,
      w: 400,
      h: 420
    })),
    quotePosition: { x: 60, y: 1500, w: 1480, h: 100 }
  },
  {
    id: "p100-l6",
    label: "ZIGZAG",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 100 : 800,
      y: 80 + i * 280,
      w: 700,
      h: 240
    })),
    quotePosition: { x: 60, y: 1800, w: 1480, h: 100 }
  },
  {
    id: "p100-l7",
    label: "COLUMNS",
    package: 100,
    slots: [
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 60, y: 80 + i * 600, w: 850, h: 570 })),
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 940, y: 80 + i * 600, w: 600, h: 570 }))
    ],
    quotePosition: { x: 60, y: 1900, w: 1480, h: 100 }
  },
  {
    id: "p100-l8",
    label: "SPINE",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 100 : 700,
      y: 80 + i * 300,
      w: 800,
      h: 260
    })),
    quotePosition: { x: 60, y: 1950, w: 1480, h: 100 }
  },
  {
    id: "p100-l9",
    label: "STREAK",
    package: 100,
    slots: [
      ...Array.from({ length: 5 }).map((_, i) => ({ x: 60, y: 80 + i * 300, w: 730, h: 260 })),
      { x: 810, y: 80, w: 730, h: 1620 }
    ],
    quotePosition: { x: 60, y: 1750, w: 1480, h: 100 }
  },
  {
    id: "p100-l10",
    label: "EMPHASIS",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 60 + (i % 2) * 750,
      y: 80 + Math.floor(i / 2) * 450,
      w: 730,
      h: 420
    })),
    quotePosition: { x: 60, y: 1550, w: 1480, h: 300 }
  }
];
