
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
  // Each strip is 800 units wide. Slots maximize the 800w x 2400h area.
  {
    id: "p50-l1",
    label: "CLASSIC STRIP",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 660 },
      { x: 40, y: 720, w: 1520, h: 660 },
      { x: 40, y: 1400, w: 1520, h: 660 },
    ],
  },
  {
    id: "p50-l2",
    label: "MODERN STRIP",
    package: 50,
    slots: [
      { x: 20, y: 40, w: 1560, h: 670 },
      { x: 20, y: 730, w: 1560, h: 670 },
      { x: 20, y: 1420, w: 1560, h: 670 },
    ],
  },
  {
    id: "p50-l3",
    label: "SQUARE STRIP",
    package: 50,
    slots: [
      { x: 60, y: 60, w: 1480, h: 650 },
      { x: 60, y: 730, w: 1480, h: 650 },
      { x: 60, y: 1400, w: 1480, h: 650 },
    ],
  },
  {
    id: "p50-l4",
    label: "HERO STRIP",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1000 },
      { x: 40, y: 1060, w: 750, h: 1020 },
      { x: 810, y: 1060, w: 750, h: 1020 },
    ],
  },
  {
    id: "p50-l5",
    label: "MINIMAL STRIP",
    package: 50,
    slots: [
      { x: 100, y: 80, w: 1400, h: 640 },
      { x: 100, y: 740, w: 1400, h: 640 },
      { x: 100, y: 1400, w: 1400, h: 640 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - 4x6 PHOTO (Internal units 1600x2400)
  {
    id: "p100-l1",
    label: "GRID 2x3",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 750, h: 670 },
      { x: 810, y: 40, w: 750, h: 670 },
      { x: 40, y: 730, w: 750, h: 670 },
      { x: 810, y: 730, w: 750, h: 670 },
      { x: 40, y: 1420, w: 750, h: 670 },
      { x: 810, y: 1420, w: 750, h: 670 },
    ],
  },
  {
    id: "p100-l2",
    label: "STORYBOARD",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 40,
      y: 40 + i * 345,
      w: 1520,
      h: 325
    })),
  },
  {
    id: "p100-l3",
    label: "CENTER HERO",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1050 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 40 + (i % 3) * 515,
        y: 1110 + Math.floor(i / 3) * 490,
        w: 490,
        h: 470
      }))
    ],
  },
  {
    id: "p100-l4",
    label: "FILM ROLL",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 40 : 820,
      y: 40 + Math.floor(i / 2) * 685,
      w: 740,
      h: 665
    })),
  },
  {
    id: "p100-l5",
    label: "SCATTER",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 760, h: 760 },
      { x: 820, y: 80, w: 740, h: 740 },
      { x: 40, y: 840, w: 700, h: 700 },
      { x: 760, y: 840, w: 800, h: 700 },
      { x: 40, y: 1560, w: 740, h: 580 },
      { x: 820, y: 1560, w: 740, h: 580 },
    ],
  },
  {
    id: "p100-l6",
    label: "VERTICAL SPLIT",
    package: 100,
    slots: [
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 40, y: 40 + i * 700, w: 750, h: 680 })),
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 810, y: 40 + i * 700, w: 750, h: 680 })),
    ],
  },
  {
    id: "p100-l7",
    label: "MOSAIC",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1060, h: 1060 },
      { x: 1120, y: 40, w: 440, h: 440 },
      { x: 1120, y: 500, w: 440, h: 600 },
      { x: 40, y: 1120, w: 500, h: 1000 },
      { x: 560, y: 1120, w: 1000, h: 480 },
      { x: 560, y: 1620, w: 1000, h: 500 },
    ],
  },
  {
    id: "p100-l8",
    label: "STRIP DOUBLE",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i < 3 ? 40 : 820,
      y: 40 + (i % 3) * 700,
      w: 740,
      h: 680
    })),
  },
  {
    id: "p100-l9",
    label: "DIAGONAL",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 40 + i * 215,
      y: 40 + i * 350,
      w: 520,
      h: 520
    })),
  },
  {
    id: "p100-l10",
    label: "ULTIMATE",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 950 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 40 + i * 310,
        y: 1010,
        w: 290,
        h: 1120
      }))
    ],
  }
];
