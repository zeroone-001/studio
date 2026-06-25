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
 * JNL Studio Blueprints - Zero Gap & Face-Safe Optimization
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer starts at Y=2220 (Compact 7.5% height)
 * Recalibrated for equal sizing in PHP 100 package to prevent face cropping.
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - Optimized Vertical Grids
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
    label: "TRIO GRID",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 800, h: 1110 },
      { x: 800, y: 0, w: 800, h: 1110 },
      { x: 0, y: 1110, w: 1600, h: 1110 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - Equal Sizing for Face/Body Visibility
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
    label: "BALANCED 3X2",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 1110 }, { x: 533, y: 0, w: 534, h: 1110 }, { x: 1067, y: 0, w: 533, h: 1110 },
      { x: 0, y: 1110, w: 533, h: 1110 }, { x: 533, y: 1110, w: 534, h: 1110 }, { x: 1067, y: 1110, w: 533, h: 1110 },
    ],
  },
  {
    id: "p100-l3",
    label: "SYMMETRIC",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 740 }, { x: 800, y: 0, w: 800, h: 740 },
      { x: 0, y: 740, w: 800, h: 740 }, { x: 800, y: 740, w: 800, h: 740 },
      { x: 0, y: 1480, w: 800, h: 740 }, { x: 800, y: 1480, w: 800, h: 740 },
    ],
  },
  {
    id: "p100-l4",
    label: "PORTRAIT GRID",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 1110 }, { x: 533, y: 0, w: 534, h: 1110 }, { x: 1067, y: 0, w: 533, h: 1110 },
      { x: 0, y: 1110, w: 533, h: 1110 }, { x: 533, y: 1110, w: 534, h: 1110 }, { x: 1067, y: 1110, w: 533, h: 1110 },
    ],
  },
  {
    id: "p100-l5",
    label: "DUAL COLUMN",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 740 }, { x: 800, y: 0, w: 800, h: 740 },
      { x: 0, y: 740, w: 800, h: 740 }, { x: 800, y: 740, w: 800, h: 740 },
      { x: 0, y: 1480, w: 800, h: 740 }, { x: 800, y: 1480, w: 800, h: 740 },
    ],
  },
  {
    id: "p100-l6",
    label: "MODERN 3X2",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 1110 }, { x: 533, y: 0, w: 534, h: 1110 }, { x: 1067, y: 0, w: 533, h: 1110 },
      { x: 0, y: 1110, w: 533, h: 1110 }, { x: 533, y: 1110, w: 534, h: 1110 }, { x: 1067, y: 1110, w: 533, h: 1110 },
    ],
  }
];