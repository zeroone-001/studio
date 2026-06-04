
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
  // ₱50 PACKAGE (3 SHOTS) - MAXIMIZED FOR LESS SPACE
  {
    id: "p50-l1",
    label: "LAYOUT 1",
    package: 50,
    slots: [
      { x: 100, y: 100, w: 1400, h: 740 },
      { x: 100, y: 860, w: 1400, h: 740 },
      { x: 100, y: 1620, w: 1400, h: 740 },
    ],
  },
  {
    id: "p50-l2",
    label: "LAYOUT 2",
    package: 50,
    slots: [
      { x: 80, y: 100, w: 1100, h: 700 },
      { x: 420, y: 840, w: 1100, h: 700 },
      { x: 80, y: 1580, w: 1100, h: 700 },
    ],
  },
  {
    id: "p50-l3",
    label: "LAYOUT 3",
    package: 50,
    slots: [
      { x: 100, y: 100, w: 1000, h: 730 },
      { x: 100, y: 860, w: 1000, h: 730 },
      { x: 100, y: 1620, w: 1000, h: 730 },
    ],
  },
  {
    id: "p50-l4",
    label: "LAYOUT 4",
    package: 50,
    slots: [
      { x: 100, y: 100, w: 680, h: 680 },
      { x: 820, y: 100, w: 680, h: 680 },
      { x: 100, y: 840, w: 1400, h: 1520 },
    ],
  },
  {
    id: "p50-l5",
    label: "LAYOUT 5",
    package: 50,
    slots: [
      { x: 300, y: 100, w: 1000, h: 740 },
      { x: 100, y: 880, w: 680, h: 1480 },
      { x: 820, y: 880, w: 680, h: 1480 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - MAXIMIZED GRID
  {
    id: "p100-l1",
    label: "STRIP",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({ x: 150, y: 80 + i * 380, w: 1300, h: 350 })),
  },
  {
    id: "p100-l2",
    label: "GRID 2X3",
    package: 100,
    slots: [
      { x: 60, y: 80, w: 710, h: 740 },
      { x: 830, y: 80, w: 710, h: 740 },
      { x: 60, y: 860, w: 710, h: 740 },
      { x: 830, y: 860, w: 710, h: 740 },
      { x: 60, y: 1640, w: 710, h: 740 },
      { x: 830, y: 1640, w: 710, h: 740 },
    ],
  },
  {
    id: "p100-l3",
    label: "HERO",
    package: 100,
    slots: [
      { x: 100, y: 100, w: 1400, h: 800 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 60 + (i % 3) * 510,
        y: 950 + Math.floor(i / 3) * 700,
        w: 480,
        h: 650
      }))
    ],
  },
  {
    id: "p100-l4",
    label: "FILM",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({ x: 200, y: 80 + i * 385, w: 1200, h: 360 })),
  },
  {
    id: "p100-l5",
    label: "COMPACT",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 100 + (i % 2) * 720,
      y: 100 + Math.floor(i / 2) * 750,
      w: 680,
      h: 700
    })),
  },
  {
    id: "p100-l6",
    label: "ZIGZAG",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 80 : 820,
      y: 80 + i * 380,
      w: 700,
      h: 350
    })),
  },
  {
    id: "p100-l7",
    label: "COLUMNS",
    package: 100,
    slots: [
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 80, y: 100 + i * 760, w: 800, h: 720 })),
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 920, y: 100 + i * 760, w: 600, h: 720 }))
    ],
  },
  {
    id: "p100-l8",
    label: "SPINE",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 80 : 720,
      y: 80 + i * 380,
      w: 800,
      h: 350
    })),
  },
  {
    id: "p100-l9",
    label: "STREAK",
    package: 100,
    slots: [
      ...Array.from({ length: 5 }).map((_, i) => ({ x: 80, y: 80 + i * 460, w: 700, h: 430 })),
      { x: 820, y: 80, w: 700, h: 2280 }
    ],
  },
  {
    id: "p100-l10",
    label: "EMPHASIS",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 80 + (i % 2) * 740,
      y: 100 + Math.floor(i / 2) * 750,
      w: 700,
      h: 720
    })),
  }
];
