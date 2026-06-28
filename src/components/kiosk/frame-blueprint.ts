
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
 * JNL Studio Blueprints - LANDSCAPE OPTIMIZED
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer begins at Y=2200 to provide space for quotes and JNL branding.
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS)
  {
    id: "p50-balanced-trio",
    label: "BALANCED TRIO",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1100 }, 
      { x: 0, y: 1100, w: 800, h: 1100 },
      { x: 800, y: 1100, w: 800, h: 1100 },
    ],
  },
  {
    id: "p50-portrait-stack",
    label: "PORTRAIT STACK",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 733 },
      { x: 0, y: 733, w: 1600, h: 733 },
      { x: 0, y: 1466, w: 1600, h: 734 },
    ],
  },
  {
    id: "p50-modern-split",
    label: "MODERN SPLIT",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1067, h: 1100 },
      { x: 1067, y: 0, w: 533, h: 1100 },
      { x: 0, y: 1100, w: 1600, h: 1100 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS)
  {
    id: "p100-vertical-six",
    label: "PORTRAIT SIX",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 1100 }, { x: 533, y: 0, w: 534, h: 1100 }, { x: 1067, y: 0, w: 533, h: 1100 },
      { x: 0, y: 1100, w: 533, h: 1100 }, { x: 533, y: 1100, w: 534, h: 1100 }, { x: 1067, y: 1100, w: 533, h: 1100 },
    ],
  },
  {
    id: "p100-mosaic-hero",
    label: "MOSAIC HERO",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1067, h: 1466 },
      { x: 1067, y: 0, w: 533, h: 733 },
      { x: 1067, y: 733, w: 533, h: 733 },
      { x: 0, y: 1466, w: 533, h: 734 },
      { x: 533, y: 1466, w: 534, h: 734 },
      { x: 1067, y: 1466, w: 533, h: 734 },
    ],
  },
  {
    id: "p100-classic-grid",
    label: "CLASSIC GRID",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 733 }, { x: 800, y: 0, w: 800, h: 733 },
      { x: 0, y: 733, w: 800, h: 733 }, { x: 800, y: 733, w: 800, h: 733 },
      { x: 0, y: 1466, w: 800, h: 734 }, { x: 800, y: 1466, w: 800, h: 734 },
    ],
  },
  {
    id: "p100-staggered-zip",
    label: "STAGGERED ZIP",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1067, h: 733 }, { x: 1067, y: 0, w: 533, h: 733 },
      { x: 0, y: 733, w: 533, h: 733 }, { x: 533, y: 733, w: 1067, h: 733 },
      { x: 0, y: 1466, w: 1067, h: 734 }, { x: 1067, y: 1466, w: 533, h: 734 },
    ],
  },
  {
    id: "p100-modern-mix",
    label: "MODERN MIX",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 1100 }, { x: 800, y: 0, w: 800, h: 1100 },
      { x: 0, y: 1100, w: 800, h: 550 }, { x: 800, y: 1100, w: 800, h: 550 },
      { x: 0, y: 1650, w: 800, h: 550 }, { x: 800, y: 1650, w: 800, h: 550 },
    ],
  },
  {
    id: "p100-asymmetric-vibe",
    label: "ASYMMETRIC VIBE",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 733 }, { x: 533, y: 0, w: 1067, h: 733 },
      { x: 0, y: 733, w: 1067, h: 733 }, { x: 1067, y: 733, w: 533, h: 733 },
      { x: 0, y: 1466, w: 533, h: 734 }, { x: 533, y: 1466, w: 534, h: 734 }, { x: 1067, y: 1466, w: 533, h: 734 },
    ],
  }
];
