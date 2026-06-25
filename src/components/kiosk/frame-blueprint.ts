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
 * JNL Studio Blueprints - Zero Gap Optimization
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer starts at Y=2220 (approx 7.5% height)
 * Recalibrated for ZERO vertical gap below the last photo.
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - Optimized for Zero Gap
  {
    id: "p50-l1",
    label: "STACKED",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 740 },
      { x: 0, y: 740, w: 1600, h: 740 },
      { x: 0, y: 1480, w: 1600, h: 740 },
    ],
  },
  {
    id: "p50-l2",
    label: "TOP-HEAVY",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1110 },
      { x: 0, y: 1110, w: 800, h: 1110 },
      { x: 800, y: 1110, w: 800, h: 1110 },
    ],
  },
  {
    id: "p50-l3",
    label: "BALANCED",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 800, h: 1110 },
      { x: 800, y: 0, w: 800, h: 1110 },
      { x: 0, y: 1110, w: 1600, h: 1110 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - Optimized for Zero Gap
  {
    id: "p100-l1",
    label: "CLASSIC 2X3",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 740 }, { x: 800, y: 0, w: 800, h: 740 },
      { x: 0, y: 740, w: 800, h: 740 }, { x: 800, y: 740, w: 800, h: 740 },
      { x: 0, y: 1480, w: 800, h: 740 }, { x: 800, y: 1480, w: 800, h: 740 },
    ],
  },
  {
    id: "p100-l2",
    label: "WIDE 3X2",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 1110 }, { x: 533, y: 0, w: 534, h: 1110 }, { x: 1067, y: 0, w: 533, h: 1110 },
      { x: 0, y: 1110, w: 533, h: 1110 }, { x: 533, y: 1110, w: 534, h: 1110 }, { x: 1067, y: 1110, w: 533, h: 1110 },
    ],
  },
  {
    id: "p100-l3",
    label: "MOSAIC",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1067, h: 1110 },
      { x: 1067, y: 0, w: 533, h: 555 },
      { x: 1067, y: 555, w: 533, h: 555 },
      { x: 0, y: 1110, w: 533, h: 1110 },
      { x: 533, y: 1110, w: 534, h: 1110 },
      { x: 1067, y: 1110, w: 533, h: 1110 },
    ],
  },
  {
    id: "p100-l4",
    label: "MODERN GRID",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 1110 }, { x: 800, y: 0, w: 800, h: 1110 },
      { x: 0, y: 1110, w: 400, h: 1110 }, { x: 400, y: 1110, w: 400, h: 1110 },
      { x: 800, y: 1110, w: 400, h: 1110 }, { x: 1200, y: 1110, w: 400, h: 1110 },
    ],
  },
  {
    id: "p100-l5",
    label: "GALLERY",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1110 },
      { x: 0, y: 1110, w: 320, h: 1110 },
      { x: 320, y: 1110, w: 320, h: 1110 },
      { x: 640, y: 1110, w: 320, h: 1110 },
      { x: 960, y: 1110, w: 320, h: 1110 },
      { x: 1280, y: 1110, w: 320, h: 1110 },
    ],
  },
  {
    id: "p100-l6",
    label: "CINEMATIC",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1600, h: 440 },
      { x: 0, y: 440, w: 800, h: 890 }, { x: 800, y: 440, w: 800, h: 890 },
      { x: 0, y: 1330, w: 533, h: 890 }, { x: 533, y: 1330, w: 534, h: 890 }, { x: 1067, y: 1330, w: 533, h: 890 },
    ],
  }
];