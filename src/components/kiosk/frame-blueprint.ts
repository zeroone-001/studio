
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
};

/**
 * JNL Studio Blueprints - ZERO GAP & FULL BODY OPTIMIZATION
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer begins at Y=2304 (4% height)
 * Total height: 2304 (slots) + 96 (footer) = 2400px
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - Optimized for full body/face visibility
  {
    id: "p50-stacked",
    label: "STACKED",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 768 },
      { x: 0, y: 768, w: 1600, h: 768 },
      { x: 0, y: 1536, w: 1600, h: 768 },
    ],
  },
  {
    id: "p50-hero-body",
    label: "HERO BODY",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1000, h: 2304 },
      { x: 1000, y: 0, w: 600, h: 1152 },
      { x: 1000, y: 1152, w: 600, h: 1152 },
    ],
  },
  {
    id: "p50-balanced",
    label: "BALANCED",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1152 },
      { x: 0, y: 1152, w: 800, h: 1152 },
      { x: 800, y: 1152, w: 800, h: 1152 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - Diverse, body-safe grids
  {
    id: "p100-classic",
    label: "CLASSIC 2X3",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 768 }, { x: 800, y: 0, w: 800, h: 768 },
      { x: 0, y: 768, w: 800, h: 768 }, { x: 800, y: 768, w: 800, h: 768 },
      { x: 0, y: 1536, w: 800, h: 768 }, { x: 800, y: 1536, w: 800, h: 768 },
    ],
  },
  {
    id: "p100-vertical-six",
    label: "VERTICAL SIX",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 1152 }, { x: 533, y: 0, w: 534, h: 1152 }, { x: 1067, y: 0, w: 533, h: 1152 },
      { x: 0, y: 1152, w: 533, h: 1152 }, { x: 533, y: 1152, w: 534, h: 1152 }, { x: 1067, y: 1152, w: 533, h: 1152 },
    ],
  },
  {
    id: "p100-mosaic-hero",
    label: "MOSAIC HERO",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1067, h: 1536 },
      { x: 1067, y: 0, w: 533, h: 768 },
      { x: 1067, y: 768, w: 533, h: 768 },
      { x: 0, y: 1536, w: 533, h: 768 },
      { x: 533, y: 1536, w: 534, h: 768 },
      { x: 1067, y: 1536, w: 533, h: 768 },
    ],
  },
  {
    id: "p100-staggered",
    label: "STAGGERED",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 1152 }, { x: 800, y: 0, w: 800, h: 576 },
      { x: 800, y: 576, w: 800, h: 576 },
      { x: 0, y: 1152, w: 800, h: 576 }, { x: 0, y: 1728, w: 800, h: 576 },
      { x: 800, y: 1152, w: 800, h: 1152 },
    ],
  },
  {
    id: "p100-cinema",
    label: "CINEMA WIDE",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1600, h: 384 },
      { x: 0, y: 384, w: 800, h: 768 }, { x: 800, y: 384, w: 800, h: 768 },
      { x: 0, y: 1152, w: 1600, h: 768 },
      { x: 0, y: 1920, w: 800, h: 384 }, { x: 800, y: 1920, w: 800, h: 384 },
    ],
  },
  {
    id: "p100-split-vertical",
    label: "SPLIT VERTICAL",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 2304 },
      { x: 533, y: 0, w: 534, h: 1152 }, { x: 1067, y: 0, w: 533, h: 1152 },
      { x: 533, y: 1152, w: 1067, h: 576 },
      { x: 533, y: 1728, w: 534, h: 576 }, { x: 1067, y: 1728, w: 533, h: 576 },
    ],
  }
];
