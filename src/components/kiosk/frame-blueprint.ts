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
 * Optimized JNL Studio Blueprints
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Footer area starts at ~9.2% (approx Y=2180)
 * Gaps between slots reduced to minimum (8-10 units) for maximum photo area.
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE (3 SHOTS) - Optimized for 2x6 Strips
  {
    id: "p50-layout-a",
    label: "STACKED",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 690 },
      { x: 40, y: 740, w: 1520, h: 690 },
      { x: 40, y: 1440, w: 1520, h: 690 },
    ],
  },
  {
    id: "p50-layout-b",
    label: "TOP-HEAVY",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 1520, h: 1060 },
      { x: 40, y: 1110, w: 755, h: 1020 },
      { x: 805, y: 1110, w: 755, h: 1020 },
    ],
  },
  {
    id: "p50-layout-c",
    label: "BALANCED",
    package: 50,
    slots: [
      { x: 40, y: 40, w: 755, h: 1060 },
      { x: 805, y: 40, w: 755, h: 1060 },
      { x: 40, y: 1110, w: 1520, h: 1020 },
    ],
  },

  // ₱100 PACKAGE (6 SHOTS) - Optimized for 4x6 Photo
  {
    id: "p100-layout-1",
    label: "CLASSIC GRID",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 755, h: 690 }, { x: 805, y: 40, w: 755, h: 690 },
      { x: 40, y: 740, w: 755, h: 690 }, { x: 805, y: 740, w: 755, h: 690 },
      { x: 40, y: 1440, w: 755, h: 690 }, { x: 805, y: 1440, w: 755, h: 690 },
    ],
  },
  {
    id: "p100-layout-2",
    label: "MODERN THREE",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 500, h: 1050 }, { x: 550, y: 40, w: 500, h: 1050 }, { x: 1060, y: 40, w: 500, h: 1050 },
      { x: 40, y: 1100, w: 500, h: 1050 }, { x: 550, y: 1100, w: 500, h: 1050 }, { x: 1060, y: 1100, w: 500, h: 1050 },
    ],
  },
  {
    id: "p100-layout-3",
    label: "MOSAIC",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 1000, h: 1050 },
      { x: 1050, y: 40, w: 510, h: 520 },
      { x: 1050, y: 570, w: 510, h: 520 },
      { x: 40, y: 1100, w: 500, h: 1050 },
      { x: 550, y: 1100, w: 500, h: 1050 },
      { x: 1060, y: 1100, w: 500, h: 1050 },
    ],
  },
  {
    id: "p100-layout-4",
    label: "PORTRAIT GRID",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 755, h: 1060 }, { x: 805, y: 40, w: 755, h: 1060 },
      { x: 40, y: 1110, w: 375, h: 1020 }, { x: 425, y: 1110, w: 375, h: 1020 },
      { x: 805, y: 1110, w: 375, h: 1020 }, { x: 1190, y: 1110, w: 375, h: 1020 },
    ],
  },
  {
    id: "p100-layout-5",
    label: "PIN-UP",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 460, h: 460 }, { x: 570, y: 40, w: 460, h: 460 }, { x: 1100, y: 40, w: 460, h: 460 },
      { x: 40, y: 540, w: 1520, h: 1040 },
      { x: 40, y: 1620, w: 755, h: 520 }, { x: 805, y: 1620, w: 755, h: 520 },
    ],
  },
  {
    id: "p100-layout-6",
    label: "NINE-UP",
    package: 100,
    slots: [
      { x: 40, y: 40, w: 500, h: 690 }, { x: 550, y: 40, w: 500, h: 690 }, { x: 1060, y: 40, w: 500, h: 690 },
      { x: 40, y: 740, w: 500, h: 690 }, { x: 550, y: 740, w: 500, h: 690 }, { x: 1060, y: 740, w: 500, h: 690 },
      // Note: Extra slots are ignored if the package is 6 shots, but kept for design flexibility
    ],
  }
];
