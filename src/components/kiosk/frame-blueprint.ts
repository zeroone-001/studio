
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
  // Coordinates are relative to a 1600 wide sheet. Each strip is 800 units wide.
  // We use max available width (approx 700 units per 800 unit strip)
  {
    id: "p50-l1",
    label: "CLASSIC STRIP",
    package: 50,
    slots: [
      { x: 80, y: 80, w: 1440, h: 630 },
      { x: 80, y: 730, w: 1440, h: 630 },
      { x: 80, y: 1380, w: 1440, h: 630 },
    ],
  },
  {
    id: "p50-l2",
    label: "MODERN STRIP",
    package: 50,
    slots: [
      { x: 40, y: 60, w: 1520, h: 640 },
      { x: 40, y: 720, w: 1520, h: 640 },
      { x: 40, y: 1380, w: 1520, h: 640 },
    ],
  },
  {
    id: "p50-l3",
    label: "SQUARE STRIP",
    package: 50,
    slots: [
      { x: 100, y: 100, w: 1400, h: 620 },
      { x: 100, y: 740, w: 1400, h: 620 },
      { x: 100, y: 1380, w: 1400, h: 620 },
    ],
  },
  {
    id: "p50-l4",
    label: "HERO STRIP",
    package: 50,
    slots: [
      { x: 60, y: 60, w: 1480, h: 1050 },
      { x: 60, y: 1140, w: 720, h: 880 },
      { x: 820, y: 1140, w: 720, h: 880 },
    ],
  },
  {
    id: "p50-l5",
    label: "MINIMAL STRIP",
    package: 50,
    slots: [
      { x: 150, y: 150, w: 1300, h: 580 },
      { x: 150, y: 770, w: 1300, h: 580 },
      { x: 150, y: 1390, w: 1300, h: 580 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - 4x6 PHOTO (Internal units 1600x2400)
  {
    id: "p100-l1",
    label: "GRID 2x3",
    package: 100,
    slots: [
      { x: 50, y: 60, w: 730, h: 650 },
      { x: 820, y: 60, w: 730, h: 650 },
      { x: 50, y: 730, w: 730, h: 650 },
      { x: 820, y: 730, w: 730, h: 650 },
      { x: 50, y: 1400, w: 730, h: 650 },
      { x: 820, y: 1400, w: 730, h: 650 },
    ],
  },
  {
    id: "p100-l2",
    label: "STORYBOARD",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 60,
      y: 60 + i * 335,
      w: 1480,
      h: 300
    })),
  },
  {
    id: "p100-l3",
    label: "CENTER HERO",
    package: 100,
    slots: [
      { x: 50, y: 50, w: 1500, h: 1000 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 40 + (i % 3) * 520,
        y: 1080 + Math.floor(i / 3) * 480,
        w: 480,
        h: 440
      }))
    ],
  },
  {
    id: "p100-l4",
    label: "FILM ROLL",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 60 : 840,
      y: 60 + Math.floor(i / 2) * 660,
      w: 700,
      h: 620
    })),
  },
  {
    id: "p100-l5",
    label: "SCATTER",
    package: 100,
    slots: [
      { x: 50, y: 50, w: 750, h: 750 },
      { x: 850, y: 100, w: 700, h: 700 },
      { x: 40, y: 850, w: 650, h: 650 },
      { x: 740, y: 850, w: 820, h: 650 },
      { x: 50, y: 1550, w: 700, h: 550 },
      { x: 800, y: 1550, w: 750, h: 550 },
    ],
  },
  {
    id: "p100-l6",
    label: "VERTICAL SPLIT",
    package: 100,
    slots: [
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 60, y: 60 + i * 680, w: 720, h: 650 })),
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 820, y: 60 + i * 680, w: 720, h: 650 })),
    ],
  },
  {
    id: "p100-l7",
    label: "MOSAIC",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1050, h: 1050 },
      { x: 1120, y: 40, w: 440, h: 440 },
      { x: 1120, y: 510, w: 440, h: 580 },
      { x: 40, y: 1120, w: 480, h: 960 },
      { x: 550, y: 1120, w: 1010, h: 460 },
      { x: 550, y: 1610, w: 1010, h: 470 },
    ],
  },
  {
    id: "p100-l8",
    label: "STRIP DOUBLE",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i < 3 ? 60 : 840,
      y: 60 + (i % 3) * 680,
      w: 700,
      h: 640
    })),
  },
  {
    id: "p100-l9",
    label: "DIAGONAL",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 40 + i * 200,
      y: 40 + i * 330,
      w: 480,
      h: 480
    })),
  },
  {
    id: "p100-l10",
    label: "ULTIMATE",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 900 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 40 + i * 310,
        y: 980,
        w: 290,
        h: 1100
      }))
    ],
  }
];
