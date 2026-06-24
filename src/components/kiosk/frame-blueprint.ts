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
 * Footer branding minimized to 7.2% to maximize photo area.
 * Redesigned with PORTRAIT and SQUARE ratios to avoid cutting off faces.
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - 2x6 STRIP (STRICT 5 UNIQUE LAYOUTS)
  {
    id: "p50-l1",
    label: "TRIO",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 720 },
      { x: 40, y: 780, w: 1520, h: 720 },
      { x: 40, y: 1520, w: 1520, h: 720 },
    ],
  },
  {
    id: "p50-l2",
    label: "STACK",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1050 },
      { x: 40, y: 1110, w: 750, h: 1110 },
      { x: 810, y: 1110, w: 750, h: 1110 },
    ],
  },
  {
    id: "p50-l3",
    label: "COLUMNS",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 480, h: 2200 },
      { x: 560, y: 40, w: 480, h: 2200 },
      { x: 1080, y: 40, w: 480, h: 2200 },
    ],
  },
  {
    id: "p50-l4",
    label: "PORTRAIT+",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 900 },
      { x: 40, y: 960, w: 1520, h: 630 },
      { x: 40, y: 1610, w: 1520, h: 630 },
    ],
  },
  {
    id: "p50-l5",
    label: "CLASSIC",
    package: 50,
    slots: [
      { x: 120, y: 80, w: 1360, h: 680 },
      { x: 120, y: 800, w: 1360, h: 680 },
      { x: 120, y: 1520, w: 1360, h: 680 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - 4x6 PHOTO (1600x2400) (10 UNIQUE LAYOUTS)
  {
    id: "p100-l1",
    label: "GRID 6",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 740, h: 720 }, { x: 820, y: 40, w: 740, h: 720 },
      { x: 40, y: 780, w: 740, h: 720 }, { x: 820, y: 780, w: 740, h: 720 },
      { x: 40, y: 1520, w: 740, h: 720 }, { x: 820, y: 1520, w: 740, h: 720 },
    ],
  },
  {
    id: "p100-l2",
    label: "STUDIO",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1000 },
      { x: 40, y: 1060, w: 480, h: 580 }, { x: 560, y: 1060, w: 480, h: 580 }, { x: 1080, y: 1060, w: 480, h: 580 },
      { x: 40, y: 1660, w: 740, h: 580 }, { x: 820, y: 1660, w: 740, h: 580 },
    ],
  },
  {
    id: "p100-l3",
    label: "NINE-UP",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 480, h: 500 }, { x: 560, y: 40, w: 480, h: 500 }, { x: 1080, y: 40, w: 480, h: 500 },
      { x: 40, y: 560, w: 480, h: 500 }, { x: 560, y: 560, w: 480, h: 500 }, { x: 1080, y: 560, w: 480, h: 500 },
      { x: 40, y: 1080, w: 1520, h: 1150 },
    ],
  },
  {
    id: "p100-l4",
    label: "COLLEGE",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1000, h: 1000 }, { x: 1080, y: 40, w: 480, h: 480 }, { x: 1080, y: 560, w: 480, h: 480 },
      { x: 40, y: 1080, w: 480, h: 1150 }, { x: 560, y: 1080, w: 480, h: 1150 }, { x: 1080, y: 1080, w: 480, h: 1150 },
    ],
  },
  {
    id: "p100-l5",
    label: "STORY",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 740, h: 1050 }, { x: 820, y: 40, w: 740, h: 1050 },
      { x: 40, y: 1120, w: 480, h: 1110 }, { x: 560, y: 1120, w: 480, h: 1110 }, { x: 1080, y: 1120, w: 480, h: 1110 },
      { x: 40, y: 2230, w: 1520, h: 10 }, // Hidden spacer
    ],
  },
  {
    id: "p100-l6",
    label: "CUBE",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 740, h: 740 }, { x: 820, y: 40, w: 740, h: 740 },
      { x: 40, y: 820, w: 1520, h: 640 },
      { x: 40, y: 1500, w: 480, h: 730 }, { x: 560, y: 1500, w: 480, h: 730 }, { x: 1080, y: 1500, w: 480, h: 730 },
    ],
  },
  {
    id: "p100-l7",
    label: "DRAMA",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 350 },
      { x: 40, y: 410, w: 1520, h: 350 },
      { x: 40, y: 780, w: 1520, h: 350 },
      { x: 40, y: 1150, w: 1520, h: 350 },
      { x: 40, y: 1520, w: 1520, h: 350 },
      { x: 40, y: 1890, w: 1520, h: 350 },
    ],
  },
  {
    id: "p100-l8",
    label: "ECHO",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 740, h: 680 }, { x: 820, y: 40, w: 740, h: 680 },
      { x: 40, y: 760, w: 740, h: 720 }, { x: 820, y: 760, w: 740, h: 720 },
      { x: 40, y: 1520, w: 740, h: 720 }, { x: 820, y: 1520, w: 740, h: 720 },
    ],
  },
  {
    id: "p100-l9",
    label: "PIN-UP",
    package: 100,
    slots: [
      { x: 100, y: 60, w: 650, h: 1050 }, { x: 850, y: 60, w: 650, h: 1050 },
      { x: 100, y: 1150, w: 650, h: 1050 }, { x: 850, y: 1150, w: 650, h: 1050 },
      { x: 40, y: 40, w: 0, h: 0 }, { x: 40, y: 40, w: 0, h: 0 }
    ],
  },
  {
    id: "p100-l10",
    label: "MUSEUM",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1400 },
      { x: 40, y: 1480, w: 270, h: 750 }, { x: 350, y: 1480, w: 270, h: 750 }, { x: 660, y: 1480, w: 270, h: 750 },
      { x: 970, y: 1480, w: 270, h: 750 }, { x: 1280, y: 1480, w: 280, h: 750 },
    ],
  }
];
