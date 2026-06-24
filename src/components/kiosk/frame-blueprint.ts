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
 * Simplified JNL Studio Blueprints
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer area starts at ~9.2% (approx Y=2180)
 * All slots recalibrated to END at Y=2180 to eliminate free space.
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - Simplified Portrait-Safe Designs
  {
    id: "p50-l1",
    label: "STACKED",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 700 },
      { x: 40, y: 750, w: 1520, h: 700 },
      { x: 40, y: 1460, w: 1520, h: 720 },
    ],
  },
  {
    id: "p50-l2",
    label: "TOP-HEAVY",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1060 },
      { x: 40, y: 1110, w: 755, h: 1070 },
      { x: 805, y: 1110, w: 755, h: 1070 },
    ],
  },
  {
    id: "p50-l3",
    label: "BALANCED",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 755, h: 1060 },
      { x: 805, y: 40, w: 755, h: 1060 },
      { x: 40, y: 1110, w: 1520, h: 1070 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - Simplified Portrait-Safe Designs
  {
    id: "p100-l1",
    label: "CLASSIC 2X3",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 755, h: 700 }, { x: 805, y: 40, w: 755, h: 700 },
      { x: 40, y: 750, w: 755, h: 700 }, { x: 805, y: 750, w: 755, h: 700 },
      { x: 40, y: 1460, w: 755, h: 720 }, { x: 805, y: 1460, w: 755, h: 720 },
    ],
  },
  {
    id: "p100-l2",
    label: "WIDE 3X2",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 500, h: 1060 }, { x: 550, y: 40, w: 500, h: 1060 }, { x: 1060, y: 40, w: 500, h: 1060 },
      { x: 40, y: 1110, w: 500, h: 1070 }, { x: 550, y: 1110, w: 500, h: 1070 }, { x: 1060, y: 1110, w: 500, h: 1070 },
    ],
  },
  {
    id: "p100-l3",
    label: "MOSAIC 6",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1010, h: 1060 },
      { x: 1060, y: 40, w: 500, h: 525 },
      { x: 1060, y: 575, w: 500, h: 525 },
      { x: 40, y: 1110, w: 500, h: 1070 },
      { x: 550, y: 1110, w: 500, h: 1070 },
      { x: 1060, y: 1110, w: 500, h: 1070 },
    ],
  },
  {
    id: "p100-l4",
    label: "MODERN GRID",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 755, h: 1060 }, { x: 805, y: 40, w: 755, h: 1060 },
      { x: 40, y: 1110, w: 370, h: 1070 }, { x: 420, y: 1110, w: 370, h: 1070 },
      { x: 810, y: 1110, w: 370, h: 1070 }, { x: 1190, y: 1110, w: 370, h: 1070 },
    ],
  },
  {
    id: "p100-l5",
    label: "GALLERY",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1060 },
      { x: 40, y: 1110, w: 300, h: 1070 },
      { x: 350, y: 1110, w: 300, h: 1070 },
      { x: 660, y: 1110, w: 300, h: 1070 },
      { x: 970, y: 1110, w: 300, h: 1070 },
      { x: 1280, y: 1110, w: 280, h: 1070 },
    ],
  },
  {
    id: "p100-l6",
    label: "CINEMATIC 6",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1520, h: 350 },
      { x: 40, y: 400, w: 755, h: 670 }, { x: 805, y: 400, w: 755, h: 670 },
      { x: 40, y: 1080, w: 755, h: 670 }, { x: 805, y: 1080, w: 755, h: 670 },
      { x: 40, y: 1760, w: 1520, h: 420 },
    ],
  }
];
