
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
  // ₱50 PACKAGE (3 SHOTS) - MAXIMIZED PRINTABLE AREA (60px margins)
  {
    id: "p50-l1",
    label: "LAYOUT A",
    package: 50,
    slots: [
      { x: 60, y: 80, w: 1480, h: 580 },
      { x: 60, y: 700, w: 1480, h: 580 },
      { x: 60, y: 1320, w: 1480, h: 580 },
    ],
    quotePosition: { x: 60, y: 1980, w: 1480, h: 180 }
  },
  {
    id: "p50-l2",
    label: "LAYOUT B",
    package: 50,
    slots: [
      { x: 60, y: 80, w: 1100, h: 550 },
      { x: 440, y: 680, w: 1100, h: 550 },
      { x: 60, y: 1280, w: 1100, h: 550 },
    ],
    quotePosition: { x: 60, y: 1940, w: 1480, h: 200 }
  },
  {
    id: "p50-l3",
    label: "LAYOUT C",
    package: 50,
    slots: [
      { x: 60, y: 80, w: 1050, h: 560 },
      { x: 60, y: 680, w: 1050, h: 560 },
      { x: 60, y: 1280, w: 1050, h: 560 },
    ],
    quotePosition: { x: 1160, y: 80, w: 380, h: 1760 }
  },
  {
    id: "p50-l4",
    label: "LAYOUT D",
    package: 50,
    slots: [
      { x: 60, y: 80, w: 730, h: 730 },
      { x: 810, y: 80, w: 730, h: 730 },
      { x: 60, y: 850, w: 1480, h: 900 },
    ],
    quotePosition: { x: 60, y: 1820, w: 1480, h: 150 }
  },
  {
    id: "p50-l5",
    label: "LAYOUT E",
    package: 50,
    slots: [
      { x: 60, y: 80, w: 1480, h: 680 },
      { x: 60, y: 800, w: 720, h: 720 },
      { x: 820, y: 800, w: 720, h: 720 },
    ],
    quotePosition: { x: 60, y: 1580, w: 1480, h: 200 }
  },

  // ₱100 PACKAGE (6 SHOTS) - MAXIMIZED GRID
  {
    id: "p100-l1",
    label: "LAYOUT A",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({ x: 60, y: 80 + i * 300, w: 1480, h: 270 })),
    quotePosition: { x: 60, y: 1900, w: 1480, h: 100 }
  },
  {
    id: "p100-l2",
    label: "LAYOUT B",
    package: 100,
    slots: [
      { x: 60, y: 80, w: 730, h: 580 },
      { x: 810, y: 80, w: 730, h: 580 },
      { x: 60, y: 680, w: 730, h: 580 },
      { x: 810, y: 680, w: 730, h: 580 },
      { x: 60, y: 1280, w: 730, h: 580 },
      { x: 810, y: 1280, w: 730, h: 580 },
    ],
    quotePosition: { x: 60, y: 1880, w: 1480, h: 60 }
  },
  {
    id: "p100-l3",
    label: "LAYOUT C",
    package: 100,
    slots: [
      { x: 60, y: 80, w: 1480, h: 550 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 60 + (i % 3) * 505,
        y: 680 + Math.floor(i / 3) * 450,
        w: 470,
        h: 420
      }))
    ],
    quotePosition: { x: 60, y: 1650, w: 1480, h: 100 }
  },
  {
    id: "p100-l4",
    label: "LAYOUT D",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({ x: 60, y: 80 + i * 300, w: 1480, h: 280 })),
    quotePosition: { x: 60, y: 1900, w: 1480, h: 100 }
  },
  {
    id: "p100-l5",
    label: "LAYOUT E",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 60 + (i % 2) * 750,
      y: 80 + Math.floor(i / 2) * 600,
      w: 730,
      h: 570
    })),
    quotePosition: { x: 60, y: 1900, w: 1480, h: 100 }
  },
  {
    id: "p100-l6",
    label: "LAYOUT F",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 60 : 810,
      y: 80 + i * 300,
      w: 730,
      h: 420
    })),
    quotePosition: { x: 60, y: 1900, w: 1480, h: 100 }
  },
  {
    id: "p100-l7",
    label: "LAYOUT G",
    package: 100,
    slots: [
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 60, y: 80 + i * 600, w: 850, h: 570 })),
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 940, y: 80 + i * 600, w: 600, h: 570 }))
    ],
    quotePosition: { x: 60, y: 1900, w: 1480, h: 100 }
  },
  {
    id: "p100-l8",
    label: "LAYOUT H",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 60 : 700,
      y: 80 + i * 300,
      w: 840,
      h: 450
    })),
    quotePosition: { x: 60, y: 1950, w: 1480, h: 100 }
  },
  {
    id: "p100-l9",
    label: "LAYOUT I",
    package: 100,
    slots: [
      ...Array.from({ length: 5 }).map((_, i) => ({ x: 60, y: 80 + i * 330, w: 730, h: 300 })),
      { x: 810, y: 80, w: 730, h: 1620 }
    ],
    quotePosition: { x: 60, y: 1750, w: 1480, h: 100 }
  },
  {
    id: "p100-l10",
    label: "LAYOUT J",
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
