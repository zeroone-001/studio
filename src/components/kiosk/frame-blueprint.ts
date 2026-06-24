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
      { x: 0, y: 0, w: 1600, h: 730 },
      { x: 0, y: 740, w: 1600, h: 730 },
      { x: 0, y: 1480, w: 1600, h: 740 },
    ],
  },
  {
    id: "p50-l2",
    label: "TOP-HEAVY",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1100 },
      { x: 0, y: 1110, w: 795, h: 1110 },
      { x: 805, y: 1110, w: 795, h: 1110 },
    ],
  },
  {
    id: "p50-l3",
    label: "BALANCED",
    package: 50,
    slots: [
      { x: 0, y: 0, w: 795, h: 1100 },
      { x: 805, y: 0, w: 795, h: 1100 },
      { x: 0, y: 1110, w: 1600, h: 1110 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS)
  {
    id: "p100-l1",
    label: "CLASSIC 2X3",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 795, h: 730 }, { x: 805, y: 0, w: 795, h: 730 },
      { x: 0, y: 740, w: 795, h: 730 }, { x: 805, y: 740, w: 795, h: 730 },
      { x: 0, y: 1480, w: 795, h: 740 }, { x: 805, y: 1480, w: 795, h: 740 },
    ],
  },
  {
    id: "p100-l2",
    label: "WIDE 3X2",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 525, h: 1100 }, { x: 535, y: 0, w: 530, h: 1100 }, { x: 1075, y: 0, w: 525, h: 1100 },
      { x: 0, y: 1110, w: 525, h: 1110 }, { x: 535, y: 1110, w: 530, h: 1110 }, { x: 1075, y: 1110, w: 525, h: 1110 },
    ],
  },
  {
    id: "p100-l3",
    label: "MOSAIC",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1060, h: 1100 },
      { x: 1070, y: 0, w: 530, h: 545 },
      { x: 1070, y: 555, w: 530, h: 545 },
      { x: 0, y: 1110, w: 525, h: 1110 },
      { x: 535, y: 1110, w: 530, h: 1110 },
      { x: 1075, y: 1110, w: 525, h: 1110 },
    ],
  },
  {
    id: "p100-l4",
    label: "MODERN GRID",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 795, h: 1100 }, { x: 805, y: 0, w: 795, h: 1100 },
      { x: 0, y: 1110, w: 392, h: 1110 }, { x: 402, y: 1110, w: 393, h: 1110 },
      { x: 805, y: 1110, w: 392, h: 1110 }, { x: 1207, y: 1110, w: 393, h: 1110 },
    ],
  },
  {
    id: "p100-l5",
    label: "GALLERY",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1600, h: 1100 },
      { x: 0, y: 1110, w: 312, h: 1110 },
      { x: 322, y: 1110, w: 312, h: 1110 },
      { x: 644, y: 1110, w: 312, h: 1110 },
      { x: 966, y: 1110, w: 312, h: 1110 },
      { x: 1288, y: 1110, w: 312, h: 1110 },
    ],
  },
  {
    id: "p100-l6",
    label: "CINEMATIC",
    package: 100,
    slots: [
      { x: 0, y: 0, w: 1600, h: 430 },
      { x: 0, y: 440, w: 795, h: 880 }, { x: 805, y: 440, w: 795, h: 880 },
      { x: 0, y: 1330, w: 525, h: 890 }, { x: 535, y: 1330, w: 530, h: 890 }, { x: 1075, y: 1330, w: 525, h: 890 },
    ],
  }
];