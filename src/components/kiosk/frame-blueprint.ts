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
 * Footer begins at Y=2304 (exactly 4% height)
 * 
 * Optimized for 3:4 Portrait Camera (Aspect Ratio 0.75):
 * Slots with Aspect Ratio <= 0.75 ensure NO cutting of the face or body sides.
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS)
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
    id: "p50-modern-split",
    label: "MODERN SPLIT",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 800, h: 1536 },
      { x: 800, y: 0, w: 800, h: 1536 },
      { x: 0, y: 1536, w: 1600, h: 768 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS)
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
    id: "p100-strip-pair",
    label: "DUAL STRIPS",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 400, h: 1152 }, { x: 400, y: 0, w: 400, h: 1152 },
      { x: 800, y: 0, w: 400, h: 1152 }, { x: 1200, y: 0, w: 400, h: 1152 },
      { x: 0, y: 1152, w: 800, h: 1152 }, { x: 800, y: 1152, w: 800, h: 1152 },
    ],
  },
  {
    id: "p100-cinema",
    label: "CINEMA STACK",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1600, h: 600 },
      { x: 0, y: 600, w: 533, h: 852 }, { x: 533, y: 600, w: 534, h: 852 }, { x: 1067, y: 600, w: 533, h: 852 },
      { x: 0, y: 1452, w: 800, h: 852 }, { x: 800, y: 1452, w: 800, h: 852 },
    ],
  }
];
