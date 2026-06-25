
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
 * JNL Studio Blueprints - ZERO GAP & FULL BODY OPTIMIZATION
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer begins at Y=2280 (5% height)
 * Total height: 2280 (slots) + 120 (footer) = 2400px
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - Optimized for full body/face visibility
  {
    id: "p50-stacked",
    label: "STACKED",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 760 },
      { x: 0, y: 760, w: 1600, h: 760 },
      { x: 0, y: 1520, w: 1600, h: 760 },
    ],
  },
  {
    id: "p50-body-hero",
    label: "BODY HERO",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 800, h: 2280 },
      { x: 800, y: 0, w: 800, h: 1140 },
      { x: 800, y: 1140, w: 800, h: 1140 },
    ],
  },
  {
    id: "p50-balanced",
    label: "BALANCED",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1140 },
      { x: 0, y: 1140, w: 800, h: 1140 },
      { x: 800, y: 1140, w: 800, h: 1140 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - Diverse, body-safe grids
  {
    id: "p100-classic",
    label: "CLASSIC 2X3",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 760 }, { x: 800, y: 0, w: 800, h: 760 },
      { x: 0, y: 760, w: 800, h: 760 }, { x: 800, y: 760, w: 800, h: 760 },
      { x: 0, y: 1520, w: 800, h: 760 }, { x: 800, y: 1520, w: 800, h: 760 },
    ],
  },
  {
    id: "p100-vertical-hero",
    label: "VERTICAL HERO",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 1140 }, { x: 533, y: 0, w: 534, h: 1140 }, { x: 1067, y: 0, w: 533, h: 1140 },
      { x: 0, y: 1140, w: 533, h: 1140 }, { x: 533, y: 1140, w: 534, h: 1140 }, { x: 1067, y: 1140, w: 533, h: 1140 },
    ],
  },
  {
    id: "p100-mosaic",
    label: "MOSAIC 1+5",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1067, h: 1520 },
      { x: 1067, y: 0, w: 533, h: 760 },
      { x: 1067, y: 760, w: 533, h: 760 },
      { x: 0, y: 1520, w: 533, h: 760 },
      { x: 533, y: 1520, w: 534, h: 760 },
      { x: 1067, y: 1520, w: 533, h: 760 },
    ],
  },
  {
    id: "p100-cinema",
    label: "CINEMA 6",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1600, h: 380 },
      { x: 0, y: 380, w: 800, h: 760 }, { x: 800, y: 380, w: 800, h: 760 },
      { x: 0, y: 1140, w: 1600, h: 760 },
      { x: 0, y: 1900, w: 800, h: 380 }, { x: 800, y: 1900, w: 800, h: 380 },
    ],
  },
  {
    id: "p100-split-hero",
    label: "SPLIT HERO",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 1520 }, { x: 800, y: 0, w: 800, h: 1520 },
      { x: 0, y: 1520, w: 400, h: 760 }, { x: 400, y: 1520, w: 400, h: 760 },
      { x: 800, y: 1520, w: 400, h: 760 }, { x: 1200, y: 1520, w: 400, h: 760 },
    ],
  },
  {
    id: "p100-edge-grid",
    label: "EDGE GRID",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 760 }, { x: 533, y: 0, w: 534, h: 760 }, { x: 1067, y: 0, w: 533, h: 760 },
      { x: 0, y: 760, w: 533, h: 760 }, { x: 533, y: 760, w: 534, h: 760 }, { x: 1067, y: 760, w: 533, h: 760 },
      { x: 0, y: 1520, w: 533, h: 760 }, { x: 533, y: 1520, w: 534, h: 760 }, { x: 1067, y: 1520, w: 533, h: 760 },
    ],
  }
];
