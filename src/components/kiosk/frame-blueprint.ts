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
 * Slots re-proportioned to Vertical (3:4) and Square ratios to avoid cutting off faces.
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - 2x6 STRIP
  {
    id: "p50-l1",
    label: "TRIO",
    package: 50,
    slots: [
      { x: 60, y: 60, w: 1480, h: 680 },
      { x: 60, y: 780, w: 1480, h: 680 },
      { x: 60, y: 1500, w: 1480, h: 680 },
    ],
  },
  {
    id: "p50-l2",
    label: "STACK",
    package: 50,
    slots: [
      { x: 60, y: 60, w: 1480, h: 1000 },
      { x: 60, y: 1100, w: 720, h: 1080 },
      { x: 820, y: 1100, w: 720, h: 1080 },
    ],
  },
  {
    id: "p50-l3",
    label: "COLUMNS",
    package: 50,
    slots: [
      { x: 60, y: 60, w: 460, h: 2100 },
      { x: 570, y: 60, w: 460, h: 2100 },
      { x: 1080, y: 60, w: 460, h: 2100 },
    ],
  },
  {
    id: "p50-l4",
    label: "PORTRAIT+",
    package: 50,
    slots: [
      { x: 60, y: 60, w: 1480, h: 800 },
      { x: 60, y: 900, w: 1480, h: 600 },
      { x: 60, y: 1540, w: 1480, h: 600 },
    ],
  },
  {
    id: "p50-l5",
    label: "CLASSIC",
    package: 50,
    slots: [
      { x: 140, y: 100, w: 1320, h: 640 },
      { x: 140, y: 800, w: 1320, h: 640 },
      { x: 140, y: 1500, w: 1320, h: 640 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - 4x6 PHOTO (1600x2400)
  {
    id: "p100-l1",
    label: "GRID 6",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 720, h: 680 }, { x: 820, y: 60, w: 720, h: 680 },
      { x: 60, y: 780, w: 720, h: 680 }, { x: 820, y: 780, w: 720, h: 680 },
      { x: 60, y: 1500, w: 720, h: 680 }, { x: 820, y: 1500, w: 720, h: 680 },
    ],
  },
  {
    id: "p100-l2",
    label: "STUDIO",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 1480, h: 900 },
      { x: 60, y: 1000, w: 460, h: 540 }, { x: 570, y: 1000, w: 460, h: 540 }, { x: 1080, y: 1000, w: 460, h: 540 },
      { x: 60, y: 1580, w: 720, h: 580 }, { x: 820, y: 1580, w: 720, h: 580 },
    ],
  },
  {
    id: "p100-l3",
    label: "SIX-STACK",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 460, h: 1000 }, { x: 570, y: 60, w: 460, h: 1000 }, { x: 1080, y: 60, w: 460, h: 1000 },
      { x: 60, y: 1100, w: 460, h: 1000 }, { x: 570, y: 1100, w: 460, h: 1000 }, { x: 1080, y: 1100, w: 460, h: 1000 },
    ],
  },
  {
    id: "p100-l4",
    label: "COLLEGE",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 960, h: 960 }, { x: 1060, y: 60, w: 480, h: 460 }, { x: 1060, y: 560, w: 480, h: 460 },
      { x: 60, y: 1060, w: 460, h: 1100 }, { x: 570, y: 1060, w: 460, h: 1100 }, { x: 1080, y: 1060, w: 460, h: 1100 },
    ],
  },
  {
    id: "p100-l5",
    label: "STORY",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 720, h: 1000 }, { x: 820, y: 60, w: 720, h: 1000 },
      { x: 60, y: 1100, w: 460, h: 1100 }, { x: 570, y: 1100, w: 460, h: 1100 }, { x: 1080, y: 1100, w: 460, h: 1100 },
      { x: 60, y: 2230, w: 1480, h: 10 },
    ],
  },
  {
    id: "p100-l6",
    label: "CUBE",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 720, h: 720 }, { x: 820, y: 60, w: 720, h: 720 },
      { x: 60, y: 820, w: 1480, h: 600 },
      { x: 60, y: 1460, w: 460, h: 720 }, { x: 570, y: 1460, w: 460, h: 720 }, { x: 1080, y: 1460, w: 460, h: 720 },
    ],
  },
  {
    id: "p100-l7",
    label: "DRAMA",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 1480, h: 320 },
      { x: 60, y: 420, w: 1480, h: 320 },
      { x: 60, y: 780, w: 1480, h: 320 },
      { x: 60, y: 1140, w: 1480, h: 320 },
      { x: 60, y: 1500, w: 1480, h: 320 },
      { x: 60, y: 1860, w: 1480, h: 320 },
    ],
  },
  {
    id: "p100-l8",
    label: "ECHO",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 720, h: 640 }, { x: 820, y: 60, w: 720, h: 640 },
      { x: 60, y: 760, w: 720, h: 680 }, { x: 820, y: 760, w: 720, h: 680 },
      { x: 60, y: 1480, w: 720, h: 680 }, { x: 820, y: 1480, w: 720, h: 680 },
    ],
  },
  {
    id: "p100-l9",
    label: "PIN-UP",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 720, h: 1000 }, { x: 820, y: 60, w: 720, h: 1000 },
      { x: 60, y: 1100, w: 460, h: 500 }, { x: 570, y: 1100, w: 460, h: 500 }, { x: 1080, y: 1100, w: 460, h: 500 },
      { x: 60, y: 1640, w: 1480, h: 540 }
    ],
  },
  {
    id: "p100-l10",
    label: "MUSEUM",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 1480, h: 1300 },
      { x: 60, y: 1400, w: 260, h: 780 }, { x: 360, y: 1400, w: 260, h: 780 }, { x: 660, y: 1400, w: 260, h: 780 },
      { x: 960, y: 1400, w: 260, h: 780 }, { x: 1260, y: 1400, w: 280, h: 780 },
    ],
  }
];