
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
 * Footer begins at Y=2220 (exactly 7.5% height for quote space)
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - RECALIBRATED TO PREVENT CROPPED FACES
  {
    id: "p50-balanced-trio",
    label: "BALANCED TRIO",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1200 }, // Slot 1: Taller (1.33 aspect) to prevent face crop
      { x: 0, y: 1200, w: 800, h: 1020 },
      { x: 800, y: 1200, w: 800, h: 1020 },
    ],
  },
  {
    id: "p50-body-hero",
    label: "BODY HERO",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1067, h: 2220 }, // Hero Body Slot (Portrait aspect)
      { x: 1067, y: 0, w: 533, h: 1110 },
      { x: 1067, y: 1110, w: 533, h: 1110 },
    ],
  },
  {
    id: "p50-portrait-stack",
    label: "PORTRAIT STACK",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 740 },
      { x: 0, y: 740, w: 1600, h: 740 },
      { x: 0, y: 1480, w: 1600, h: 740 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - RESTORED 6-FRAME LAYOUTS
  {
    id: "p100-vertical-six",
    label: "PORTRAIT SIX",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 533, h: 1110 }, { x: 533, y: 0, w: 534, h: 1110 }, { x: 1067, y: 0, w: 533, h: 1110 },
      { x: 0, y: 1110, w: 533, h: 1110 }, { x: 533, y: 1110, w: 534, h: 1110 }, { x: 1067, y: 1110, w: 533, h: 1110 },
    ],
  },
  {
    id: "p100-mosaic-hero",
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
      { x: 0, y: 0, w: 800, h: 740 }, { x: 800, y: 370, w: 800, h: 740 },
      { x: 0, y: 740, w: 800, h: 740 }, { x: 800, y: 1110, w: 800, h: 740 },
      { x: 0, y: 1480, w: 800, h: 740 }, { x: 800, y: 1850, w: 800, h: 370 },
    ],
  }
];
