
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
 * JNL Studio Blueprints - ZERO GAP & BODY-SAFE OPTIMIZATION
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer begins at Y=2304 (4% height)
 * Total height: 2304 (slots) + 96 (footer) = 2400px
 * 
 * Optimized Aspect Ratios (Portrait Emphasis):
 * 1067x2304 = 0.46 (Perfect for Body)
 * 800x1152 = 0.69 (Portrait)
 * 533x1152 = 0.46 (Portrait)
 * 1600x1152 = 1.38 (Wide)
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - Body-safe Vertical Layouts
  {
    id: "p50-hero-body",
    label: "HERO BODY",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1067, h: 2304 },
      { x: 1067, y: 0, w: 533, h: 1152 },
      { x: 1067, y: 1152, w: 533, h: 1152 },
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
  {
    id: "p50-vertical-trio",
    label: "VERTICAL TRIO",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 533, h: 2304 },
      { x: 533, y: 0, w: 534, h: 2304 },
      { x: 1067, y: 0, w: 533, h: 2304 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - Diverse grids with portrait emphasis
  {
    id: "p100-classic-grid",
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
    label: "VERTICAL 3X2",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 1152 }, { x: 533, y: 0, w: 534, h: 1152 }, { x: 1067, y: 0, w: 533, h: 1152 },
      { x: 0, y: 1152, w: 533, h: 1152 }, { x: 533, y: 1152, w: 534, h: 1152 }, { x: 1067, y: 1152, w: 533, h: 1152 },
    ],
  },
  {
    id: "p100-mosaic",
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
    id: "p100-split-hero",
    label: "SPLIT HERO",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1000 },
      { x: 0, y: 1000, w: 533, h: 652 }, { x: 533, y: 1000, w: 534, h: 652 }, { x: 1067, y: 1000, w: 533, h: 652 },
      { x: 0, y: 1652, w: 800, h: 652 }, { x: 800, y: 1652, w: 800, h: 652 },
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
    id: "p100-portrait-stack",
    label: "PORTRAIT STACK",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1600, h: 768 },
      { x: 0, y: 768, w: 800, h: 768 }, { x: 800, y: 768, w: 800, h: 768 },
      { x: 0, y: 1536, w: 533, h: 768 }, { x: 533, y: 1536, w: 534, h: 768 }, { x: 1067, y: 1536, w: 533, h: 768 },
    ],
  }
];
