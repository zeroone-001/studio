
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
};

export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - MAXIMIZED PRINTABLE AREA
  {
    id: "p50-l1",
    label: "LAYOUT A",
    package: 50,
    slots: [
      { x: 120, y: 100, w: 1360, h: 580 },
      { x: 120, y: 720, w: 1360, h: 580 },
      { x: 120, y: 1340, w: 1360, h: 580 },
    ],
    quotePosition: { x: 120, y: 1980, w: 1360, h: 180 }
  },
  {
    id: "p50-l2",
    label: "LAYOUT B",
    package: 50,
    slots: [
      { x: 60, y: 100, w: 1100, h: 550 },
      { x: 440, y: 700, w: 1100, h: 550 },
      { x: 60, y: 1300, w: 1100, h: 550 },
    ],
    quotePosition: { x: 60, y: 1940, w: 1480, h: 200 }
  },
  {
    id: "p50-l3",
    label: "LAYOUT C",
    package: 50,
    slots: [
      { x: 80, y: 100, w: 1000, h: 560 },
      { x: 80, y: 700, w: 1000, h: 560 },
      { x: 80, y: 1300, w: 1000, h: 560 },
    ],
    quotePosition: { x: 1140, y: 100, w: 380, h: 1760 }
  },
  {
    id: "p50-l4",
    label: "LAYOUT D",
    package: 50,
    slots: [
      { x: 80, y: 100, w: 700, h: 700 },
      { x: 820, y: 100, w: 700, h: 700 },
      { x: 80, y: 860, w: 1440, h: 900 },
    ],
    quotePosition: { x: 80, y: 1820, w: 1440, h: 150 }
  },
  {
    id: "p50-l5",
    label: "LAYOUT E",
    package: 50,
    slots: [
      { x: 200, y: 100, w: 1200, h: 650 },
      { x: 60, y: 810, w: 720, h: 650 },
      { x: 820, y: 810, w: 720, h: 650 },
    ],
    quotePosition: { x: 60, y: 1550, w: 1480, h: 200 }
  },

  // ₱100 PACKAGE (6 SHOTS)
  {
    id: "p100-l1",
    label: "LAYOUT A",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({ x: 100, y: 100 + i * 290, w: 1400, h: 260 })),
    quotePosition: { x: 100, y: 1880, w: 1400, h: 100 }
  },
  {
    id: "p100-l2",
    label: "LAYOUT B (2-COLUMN GRID)",
    package: 100,
    slots: [
      { x: 60, y: 80, w: 670, h: 520 },
      { x: 870, y: 80, w: 670, h: 520 },
      { x: 60, y: 660, w: 670, h: 520 },
      { x: 870, y: 660, w: 670, h: 520 },
      { x: 60, y: 1240, w: 670, h: 520 },
      { x: 870, y: 1240, w: 670, h: 520 },
    ],
    quotePosition: { x: 100, y: 1820, w: 1400, h: 60 }
  },
  {
    id: "p100-l3",
    label: "LAYOUT C",
    package: 100,
    slots: [
      { x: 60, y: 80, w: 1480, h: 550 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 60 + (i % 3) * 500,
        y: 680 + Math.floor(i / 3) * 450,
        w: 460,
        h: 400
      }))
    ],
    quotePosition: { x: 100, y: 1650, w: 1400, h: 100 }
  },
  {
    id: "p100-l4",
    label: "LAYOUT D",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({ x: 80, y: 100 + i * 280, w: 1440, h: 250 })),
    quotePosition: { x: 80, y: 1820, w: 1440, h: 100 }
  },
  {
    id: "p100-l5",
    label: "LAYOUT E",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 80 + (i % 2) * 740,
      y: 100 + Math.floor(i / 2) * 580,
      w: 700,
      h: 530
    })),
    quotePosition: { x: 80, y: 1880, w: 1440, h: 100 }
  },
  {
    id: "p100-l6",
    label: "LAYOUT F",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 60 : 840,
      y: 100 + i * 280,
      w: 700,
      h: 400
    })),
    quotePosition: { x: 60, y: 1900, w: 1480, h: 100 }
  },
  {
    id: "p100-l7",
    label: "LAYOUT G",
    package: 100,
    slots: [
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 60, y: 100 + i * 580, w: 800, h: 530 })),
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 920, y: 100 + i * 580, w: 620, h: 530 }))
    ],
    quotePosition: { x: 60, y: 1900, w: 1480, h: 100 }
  },
  {
    id: "p100-l8",
    label: "LAYOUT H",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 100 : 700,
      y: 100 + i * 300,
      w: 800,
      h: 450
    })),
    quotePosition: { x: 100, y: 1950, w: 1400, h: 100 }
  },
  {
    id: "p100-l9",
    label: "LAYOUT I",
    package: 100,
    slots: [
      ...Array.from({ length: 5 }).map((_, i) => ({ x: 80, y: 100 + i * 320, w: 700, h: 280 })),
      { x: 800, y: 100, w: 720, h: 1600 }
    ],
    quotePosition: { x: 80, y: 1750, w: 1440, h: 100 }
  },
  {
    id: "p100-l10",
    label: "LAYOUT J",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 80 + (i % 2) * 740,
      y: 100 + Math.floor(i / 2) * 450,
      w: 700,
      h: 400
    })),
    quotePosition: { x: 100, y: 1550, w: 1400, h: 300 }
  }
];
