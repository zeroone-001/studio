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
 * JNL Studio Blueprints - Zero Gap & Portrait Visibility Optimization
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer begins at Y=2220 (7.5% height)
 * All slots calibrated to end exactly at Y=2220 to remove free space.
 * Layouts prioritized for vertical space to capture whole bodies and faces.
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - Diverse Portrait Designs
  {
    id: "p50-stacked",
    label: "STACKED",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 740 },
      { x: 0, y: 740, w: 1600, h: 740 },
      { x: 0, y: 1480, w: 1600, h: 740 },
    ],
  },
  {
    id: "p50-topheavy",
    label: "TOP-HEAVY",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1110 },
      { x: 0, y: 1110, w: 800, h: 1110 },
      { x: 800, y: 1110, w: 800, h: 1110 },
    ],
  },
  {
    id: "p50-side-hero",
    label: "SIDE HERO",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 800, h: 2220 },
      { x: 800, y: 0, w: 800, h: 1110 },
      { x: 800, y: 1110, w: 800, h: 1110 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - Diverse Grid & Hero Options
  {
    id: "p100-classic",
    label: "CLASSIC 2X3",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 740 }, { x: 800, y: 0, w: 800, h: 740 },
      { x: 0, y: 740, w: 800, h: 740 }, { x: 800, y: 740, w: 800, h: 740 },
      { x: 0, y: 1480, w: 800, h: 740 }, { x: 800, y: 1480, w: 800, h: 740 },
    ],
  },
  {
    id: "p100-vertical",
    label: "VERTICAL 3X2",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 1110 }, { x: 533, y: 0, w: 534, h: 1110 }, { x: 1067, y: 0, w: 533, h: 1110 },
      { x: 0, y: 1110, w: 533, h: 1110 }, { x: 533, y: 1110, w: 534, h: 1110 }, { x: 1067, y: 1110, w: 533, h: 1110 },
    ],
  },
  {
    id: "p100-mosaic",
    label: "MOSAIC HERO",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1067, h: 1480 },
      { x: 1067, y: 0, w: 533, h: 740 },
      { x: 1067, y: 740, w: 533, h: 740 },
      { x: 0, y: 1480, w: 533, h: 740 },
      { x: 533, y: 1480, w: 534, h: 740 },
      { x: 1067, y: 1480, w: 533, h: 740 },
    ],
  },
  {
    id: "p100-staggered",
    label: "STAGGERED",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 1110 },
      { x: 800, y: 0, w: 800, h: 740 },
      { x: 800, y: 740, w: 800, h: 740 },
      { x: 0, y: 1110, w: 800, h: 1110 },
      { x: 800, y: 1480, w: 400, h: 740 },
      { x: 1200, y: 1480, w: 400, h: 740 },
    ],
  },
  {
    id: "p100-triple-split",
    label: "TRIPLE SPLIT",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 740 }, { x: 533, y: 0, w: 534, h: 740 }, { x: 1067, y: 0, w: 533, h: 740 },
      { x: 0, y: 740, w: 1600, h: 740 },
      { x: 0, y: 1480, w: 800, h: 740 }, { x: 800, y: 1480, w: 800, h: 740 },
    ],
  },
  {
    id: "p100-portrait-focus",
    label: "PORTRAIT FOCUS",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1110 },
      { x: 0, y: 1110, w: 400, h: 1110 },
      { x: 400, y: 1110, w: 400, h: 1110 },
      { x: 800, y: 1110, w: 400, h: 1110 },
      { x: 1200, y: 1110, w: 400, h: 1110 },
      { x: 0, y: 0, w: 0, h: 0 }, // Unused slot for design symmetry
    ],
  }
];
