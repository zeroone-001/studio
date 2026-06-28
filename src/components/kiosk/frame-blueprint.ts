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
 * JNL Studio Blueprints - BODY-SAFE & ZERO-GAP CALIBRATION
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer begins at Y=2304 (exactly 4% height for sentential quote space)
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - RECALIBRATED FOR ZERO-CUT PORTRAITS
  {
    id: "p50-balanced-trio",
    label: "BALANCED TRIO",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1152 }, 
      { x: 0, y: 1152, w: 800, h: 1152 },
      { x: 800, y: 1152, w: 800, h: 1152 },
    ],
  },
  {
    id: "p50-body-hero",
    label: "SPLIT PORTRAIT",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1152 }, // Large Face-Safe Frame
      { x: 0, y: 1152, w: 800, h: 1152 }, // Body Safe Left
      { x: 800, y: 1152, w: 800, h: 1152 }, // Body Safe Right
    ],
  },
  {
    id: "p50-portrait-stack",
    label: "PORTRAIT STACK",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 768 },
      { x: 0, y: 768, w: 1600, h: 768 },
      { x: 0, y: 1536, w: 1600, h: 768 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - DIVERSE FACE-SAFE LAYOUTS
  {
    id: "p100-vertical-six",
    label: "PORTRAIT SIX",
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
    id: "p100-staggered-zip",
    label: "STAGGERED ZIP",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1067, h: 768 }, { x: 1067, y: 0, w: 533, h: 768 },
      { x: 0, y: 768, w: 533, h: 768 }, { x: 533, y: 768, w: 1067, h: 768 },
      { x: 0, y: 1536, w: 1067, h: 768 }, { x: 1067, y: 1536, w: 533, h: 768 },
    ],
  },
  {
    id: "p100-classic-grid",
    label: "CLASSIC GRID",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 768 }, { x: 800, y: 0, w: 800, h: 768 },
      { x: 0, y: 768, w: 800, h: 768 }, { x: 800, y: 768, w: 800, h: 768 },
      { x: 0, y: 1536, w: 800, h: 768 }, { x: 800, y: 1536, w: 800, h: 768 },
    ],
  },
  {
    id: "p100-modern-mix",
    label: "MODERN MIX",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 1152 }, { x: 800, y: 0, w: 800, h: 1152 },
      { x: 0, y: 1152, w: 800, h: 576 }, { x: 800, y: 1152, w: 800, h: 576 },
      { x: 0, y: 1728, w: 800, h: 576 }, { x: 800, y: 1728, w: 800, h: 576 },
    ],
  },
  {
    id: "p100-asymmetric-vibe",
    label: "ASYMMETRIC VIBE",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 768 }, { x: 533, y: 0, w: 1067, h: 768 },
      { x: 0, y: 768, w: 1067, h: 768 }, { x: 1067, y: 768, w: 533, h: 768 },
      { x: 0, y: 1536, w: 533, h: 768 }, { x: 533, y: 1536, w: 534, h: 768 }, { x: 1067, y: 1536, w: 533, h: 768 },
    ],
  }
];