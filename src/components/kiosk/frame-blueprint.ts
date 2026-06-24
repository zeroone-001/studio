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
 * Simplified JNL Studio Blueprints
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer area starts at ~9.2% (approx Y=2180)
 * All slots optimized for portrait-friendly framing (Faces fully visible)
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - Optimized for 2x6 Strips
  {
    id: "p50-layout-a",
    label: "STACKED",
    package: 50,
    slots: [
      { x: 180, y: 80, w: 1240, h: 660 },
      { x: 180, y: 780, w: 1240, h: 660 },
      { x: 180, y: 1480, w: 1240, h: 660 },
    ],
  },
  {
    id: "p50-layout-b",
    label: "TOP-HEAVY",
    package: 50,
    slots: [
      { x: 120, y: 80, w: 1360, h: 1000 },
      { x: 120, y: 1120, w: 650, h: 1020 },
      { x: 830, y: 1120, w: 650, h: 1020 },
    ],
  },
  {
    id: "p50-layout-c",
    label: "BALANCED",
    package: 50,
    slots: [
      { x: 120, y: 80, w: 650, h: 1040 },
      { x: 830, y: 80, w: 650, h: 1040 },
      { x: 120, y: 1160, w: 1360, h: 980 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - Optimized for 4x6 Photo
  {
    id: "p100-layout-1",
    label: "CLASSIC GRID",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 720, h: 680 }, { x: 820, y: 60, w: 720, h: 680 },
      { x: 60, y: 780, w: 720, h: 680 }, { x: 820, y: 780, w: 720, h: 680 },
      { x: 60, y: 1500, w: 720, h: 680 }, { x: 820, y: 1500, w: 720, h: 680 },
    ],
  },
  {
    id: "p100-layout-2",
    label: "MODERN THREE",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 460, h: 1040 }, { x: 570, y: 60, w: 460, h: 1040 }, { x: 1080, y: 60, w: 460, h: 1040 },
      { x: 60, y: 1140, w: 460, h: 1040 }, { x: 570, y: 1140, w: 460, h: 1040 }, { x: 1080, y: 1140, w: 460, h: 1040 },
    ],
  },
  {
    id: "p100-layout-3",
    label: "FEATURE DUO",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 720, h: 1000 }, { x: 820, y: 60, w: 720, h: 1000 },
      { x: 60, y: 1100, w: 340, h: 1080 }, { x: 440, y: 1100, w: 340, h: 1080 },
      { x: 820, y: 1100, w: 340, h: 1080 }, { x: 1200, y: 1100, w: 340, h: 1080 },
    ],
  },
  {
    id: "p100-layout-4",
    label: "MOSAIC",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 1000, h: 1040 },
      { x: 1120, y: 60, w: 420, h: 500 },
      { x: 1120, y: 600, w: 420, h: 500 },
      { x: 60, y: 1140, w: 460, h: 1040 },
      { x: 570, y: 1140, w: 460, h: 1040 },
      { x: 1080, y: 1140, w: 460, h: 1040 },
    ],
  },
  {
    id: "p100-layout-5",
    label: "PORTRAIT GRID",
    package: 100,
    slots: [
      { x: 60, y: 60, w: 720, h: 1040 }, { x: 820, y: 60, w: 720, h: 1040 },
      { x: 60, y: 1140, w: 340, h: 1040 }, { x: 440, y: 1140, w: 340, h: 1040 },
      { x: 820, y: 1140, w: 340, h: 1040 }, { x: 1200, y: 1140, w: 340, h: 1040 },
    ],
  },
  {
    id: "p100-layout-6",
    label: "PREMIUM EVENT",
    package: 100,
    slots: [
      { x: 100, y: 60, w: 680, h: 680 }, { x: 820, y: 60, w: 680, h: 680 },
      { x: 100, y: 780, w: 680, h: 680 }, { x: 820, y: 780, w: 680, h: 680 },
      { x: 100, y: 1500, w: 680, h: 680 }, { x: 820, y: 1500, w: 680, h: 680 },
    ],
  }
];