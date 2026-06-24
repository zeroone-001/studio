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
 * JNL Studio Blueprints - Zero Gap Optimization
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer starts at Y=2220 (approx 7.5% height)
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS)
  {
    id: "p50-l1",
    label: "STACKED",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 735 },
      { x: 0, y: 742, w: 1600, h: 735 },
      { x: 0, y: 1485, w: 1600, h: 735 },
    ],
  },
  {
    id: "p50-l2",
    label: "TOP-HEAVY",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1105 },
      { x: 0, y: 1115, w: 795, h: 1105 },
      { x: 805, y: 1115, w: 795, h: 1105 },
    ],
  },
  {
    id: "p50-l3",
    label: "BALANCED",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 795, h: 1105 },
      { x: 805, y: 0, w: 795, h: 1105 },
      { x: 0, y: 1115, w: 1600, h: 1105 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS)
  {
    id: "p100-l1",
    label: "CLASSIC 2X3",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 795, h: 735 }, { x: 805, y: 0, w: 795, h: 735 },
      { x: 0, y: 742, w: 795, h: 735 }, { x: 805, y: 742, w: 795, h: 735 },
      { x: 0, y: 1485, w: 795, h: 735 }, { x: 805, y: 1485, w: 795, h: 735 },
    ],
  },
  {
    id: "p100-l2",
    label: "WIDE 3X2",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 528, h: 1105 }, { x: 536, y: 0, w: 528, h: 1105 }, { x: 1072, y: 0, w: 528, h: 1105 },
      { x: 0, y: 1115, w: 528, h: 1105 }, { x: 536, y: 1115, w: 528, h: 1105 }, { x: 1072, y: 1115, w: 528, h: 1105 },
    ],
  },
  {
    id: "p100-l3",
    label: "MOSAIC",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1062, h: 1105 },
      { x: 1070, y: 0, w: 530, h: 550 },
      { x: 1070, y: 555, w: 530, h: 550 },
      { x: 0, y: 1115, w: 528, h: 1105 },
      { x: 536, y: 1115, w: 528, h: 1105 },
      { x: 1072, y: 1115, w: 528, h: 1105 },
    ],
  },
  {
    id: "p100-l4",
    label: "MODERN GRID",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 795, h: 1105 }, { x: 805, y: 0, w: 795, h: 1105 },
      { x: 0, y: 1115, w: 395, h: 1105 }, { x: 402, y: 1115, w: 395, h: 1105 },
      { x: 805, y: 1115, w: 395, h: 1105 }, { x: 1205, y: 1115, w: 395, h: 1105 },
    ],
  },
  {
    id: "p100-l5",
    label: "GALLERY",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1105 },
      { x: 0, y: 1115, w: 314, h: 1105 },
      { x: 322, y: 1115, w: 314, h: 1105 },
      { x: 644, y: 1115, w: 312, h: 1105 },
      { x: 966, y: 1115, w: 312, h: 1105 },
      { x: 1288, y: 1115, w: 312, h: 1105 },
    ],
  },
  {
    id: "p100-l6",
    label: "CINEMATIC",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1600, h: 435 },
      { x: 0, y: 445, w: 795, h: 885 }, { x: 805, y: 445, w: 795, h: 885 },
      { x: 0, y: 1335, w: 528, h: 885 }, { x: 536, y: 1335, w: 528, h: 885 }, { x: 1072, y: 1335, w: 528, h: 885 },
    ],
  }
];