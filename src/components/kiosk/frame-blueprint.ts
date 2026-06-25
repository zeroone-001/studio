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
 * Footer begins at Y=2208 (exactly 8% height for quote space)
 * 
 * Optimized for 3:4 Portrait Camera (Aspect Ratio 0.75):
 * Every slot is designed with a width-to-height ratio that preserves the face and body.
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - REDESIGNED FOR BODY & FACE SAFETY
  {
    id: "p50-balanced-trio",
    label: "BALANCED TRIO",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1000 },
      { x: 0, y: 1000, w: 800, h: 1208 },
      { x: 800, y: 1000, w: 800, h: 1208 },
    ],
  },
  {
    id: "p50-body-hero",
    label: "BODY HERO",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1000, h: 2208 },
      { x: 1000, y: 0, w: 600, h: 1104 },
      { x: 1000, y: 1104, w: 600, h: 1104 },
    ],
  },
  {
    id: "p50-portrait-stack",
    label: "PORTRAIT STACK",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 800, h: 1104 },
      { x: 800, y: 0, w: 800, h: 1104 },
      { x: 0, y: 1104, w: 1600, h: 1104 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS)
  {
    id: "p100-vertical-six",
    label: "PORTRAIT SIX",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 1104 }, { x: 533, y: 0, w: 534, h: 1104 }, { x: 1067, y: 0, w: 533, h: 1104 },
      { x: 0, y: 1104, w: 533, h: 1104 }, { x: 533, y: 1104, w: 534, h: 1104 }, { x: 1067, y: 1104, w: 533, h: 1104 },
    ],
  },
  {
    id: "p100-classic-grid",
    label: "CLASSIC 2X3",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 800, h: 736 }, { x: 800, y: 0, w: 800, h: 736 },
      { x: 0, y: 736, w: 800, h: 736 }, { x: 800, y: 736, w: 800, h: 736 },
      { x: 0, y: 1472, w: 800, h: 736 }, { x: 800, y: 1472, w: 800, h: 736 },
    ],
  },
  {
    id: "p100-mosaic-hero",
    label: "MOSAIC HERO",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1067, h: 1472 },
      { x: 1067, y: 0, w: 533, h: 736 },
      { x: 1067, y: 736, w: 533, h: 736 },
      { x: 0, y: 1472, w: 533, h: 736 },
      { x: 533, y: 1472, w: 534, h: 736 },
      { x: 1067, y: 1472, w: 533, h: 736 },
    ],
  }
];
