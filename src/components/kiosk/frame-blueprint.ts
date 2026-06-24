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
 * Footer branding minimized to 8.5% to maximize photo area.
 * Redesigned for PORTRAIT aspect ratio shots (avoiding wide landscape cuts).
 */
const CANVAS_W = 1600;
const CANVAS_H = 2400;

export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - 2x6 STRIP (STRICT 5 UNIQUE LAYOUTS)
  {
    id: "p50-l1",
    label: "TRIO",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 680 },
      { x: 40, y: 740, w: 1520, h: 680 },
      { x: 40, y: 1440, w: 1520, h: 680 },
    ],
  },
  {
    id: "p50-l2",
    label: "PORTRAIT",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1000 },
      { x: 40, y: 1060, w: 740, h: 1080 },
      { x: 820, y: 1060, w: 740, h: 1080 },
    ],
  },
  {
    id: "p50-l3",
    label: "VERTICAL",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 480, h: 2100 },
      { x: 560, y: 40, w: 480, h: 2100 },
      { x: 1080, y: 40, w: 480, h: 2100 },
    ],
  },
  {
    id: "p50-l4",
    label: "STAIRS",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 650 },
      { x: 40, y: 730, w: 1000, h: 1410 },
      { x: 1080, y: 730, w: 480, h: 1410 },
    ],
  },
  {
    id: "p50-l5",
    label: "CLASSIC",
    package: 50,
    slots: [
      { x: 100, y: 100, w: 1400, h: 600 },
      { x: 100, y: 750, w: 1400, h: 600 },
      { x: 100, y: 1400, w: 1400, h: 600 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - 4x6 PHOTO (1600x2400) (10 UNIQUE LAYOUTS)
  {
    id: "p100-l1",
    label: "GRID 6",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 740, h: 680 }, { x: 820, y: 40, w: 740, h: 680 },
      { x: 40, y: 740, w: 740, h: 680 }, { x: 820, y: 740, w: 740, h: 680 },
      { x: 40, y: 1440, w: 740, h: 680 }, { x: 820, y: 1440, w: 740, h: 680 },
    ],
  },
  {
    id: "p100-l2",
    label: "TOWER",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 900 },
      { x: 40, y: 980, w: 480, h: 600 }, { x: 560, y: 980, w: 480, h: 600 }, { x: 1080, y: 980, w: 480, h: 600 },
      { x: 40, y: 1620, w: 740, h: 520 }, { x: 820, y: 1620, w: 740, h: 520 },
    ],
  },
  {
    id: "p100-l3",
    label: "CINEMATIC",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 500, h: 1050 }, { x: 560, y: 40, w: 1000, h: 500 }, { x: 560, y: 560, w: 1000, h: 500 },
      { x: 40, y: 1120, w: 1000, h: 500 }, { x: 40, y: 1640, w: 1000, h: 500 }, { x: 1080, y: 1120, w: 480, h: 1020 },
    ],
  },
  {
    id: "p100-l4",
    label: "STRIPS",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 740, h: 1050 }, { x: 820, y: 40, w: 740, h: 1050 },
      { x: 40, y: 1130, w: 480, h: 1000 }, { x: 560, y: 1130, w: 480, h: 1000 }, { x: 1080, y: 1130, w: 480, h: 1000 },
      { x: 40, y: 40, w: 0, h: 0 }, // Unused 6th slot for specific design
    ].map((s, i) => i === 5 ? { x: 40, y: 2150, w: 1520, h: 20 } : s), // Dummy tiny slot
  },
  {
    id: "p100-l5",
    label: "MUSEUM",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 500 },
      { x: 40, y: 560, w: 740, h: 700 }, { x: 820, y: 560, w: 740, h: 700 },
      { x: 40, y: 1280, w: 480, h: 860 }, { x: 560, y: 1280, w: 480, h: 860 }, { x: 1080, y: 1280, w: 480, h: 860 },
    ],
  },
  {
    id: "p100-l6",
    label: "FOCUS",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1000 },
      { x: 40, y: 1080, w: 740, h: 500 }, { x: 820, y: 1080, w: 740, h: 500 },
      { x: 40, y: 1620, w: 480, h: 520 }, { x: 560, y: 1620, w: 480, h: 520 }, { x: 1080, y: 1620, w: 480, h: 520 },
    ],
  },
  {
    id: "p100-l7",
    label: "ECHO",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 40 : 820, y: 40 + Math.floor(i / 2) * 700, w: 740, h: 660
    })),
  },
  {
    id: "p100-l8",
    label: "MODERN",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1000, h: 1000 }, { x: 1080, y: 40, w: 480, h: 480 }, { x: 1080, y: 560, w: 480, h: 480 },
      { x: 40, y: 1080, w: 480, h: 1080 }, { x: 560, y: 1080, w: 480, h: 1080 }, { x: 1080, y: 1080, w: 480, h: 1080 },
    ],
  },
  {
    id: "p100-l9",
    label: "PANEL",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 330 },
      { x: 40, y: 400, w: 1520, h: 330 },
      { x: 40, y: 760, w: 1520, h: 330 },
      { x: 40, y: 1120, w: 1520, h: 330 },
      { x: 40, y: 1480, w: 1520, h: 330 },
      { x: 40, y: 1840, w: 1520, h: 330 },
    ],
  },
  {
    id: "p100-l10",
    label: "STUDIO",
    package: 100,
    slots: [
      { x: 100, y: 100, w: 650, h: 950 }, { x: 850, y: 100, w: 650, h: 950 },
      { x: 100, y: 1100, w: 650, h: 950 }, { x: 850, y: 1100, w: 650, h: 950 },
      { x: 100, y: 2080, w: 650, h: 100 }, { x: 850, y: 2080, w: 650, h: 100 }, // Minimal footer spacers
    ],
  }
];
