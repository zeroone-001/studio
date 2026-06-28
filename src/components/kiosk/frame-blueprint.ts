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
 * JNL STUDIO PHOTOBOOTH BLUEPRINTS
 * Optimized for Honor Pad X10 Landscape Mode
 * Internal Coordinate System: 1600 (W) x 2400 (H)
 * Branding zone: Footer starts at Y=2200
 */
export const BLUEPRINTS: FrameBlueprint[] = [
  // ₱50 PACKAGE: 2x6 STRIP (3 SHOTS)
  // These layouts are mirrored for dual-strip 4x6 printing (800px width per strip)
  {
    id: "p50-strip-classic",
    label: "CLASSIC STRIP",
    package: 50,
    slots: [
      { x: 0, y: 50, w: 1600, h: 680 },
      { x: 0, y: 760, w: 1600, h: 680 },
      { x: 0, y: 1470, w: 1600, h: 680 },
    ],
  },
  {
    id: "p50-strip-hero",
    label: "HERO STRIP",
    package: 50,
    slots: [
      { x: 0, y: 50, w: 1600, h: 1000 },
      { x: 0, y: 1080, w: 1600, h: 500 },
      { x: 0, y: 1610, w: 1600, h: 500 },
    ],
  },
  {
    id: "p50-strip-modern",
    label: "MODERN STRIP",
    package: 50,
    slots: [
      { x: 0, y: 50, w: 1600, h: 500 },
      { x: 0, y: 580, w: 1600, h: 1000 },
      { x: 0, y: 1610, w: 1600, h: 500 },
    ],
  },

  // ₱100 PACKAGE: 4x6 PORTRAIT (6 SHOTS)
  {
    id: "p100-grid-standard",
    label: "GRID STANDARD",
    package: 100,
    slots: [
      { x: 30, y: 30, w: 755, h: 680 }, { x: 815, y: 30, w: 755, h: 680 },
      { x: 30, y: 740, w: 755, h: 680 }, { x: 815, y: 740, w: 755, h: 680 },
      { x: 30, y: 1450, w: 755, h: 680 }, { x: 815, y: 1450, w: 755, h: 680 },
    ],
  },
  {
    id: "p100-mosaic-hero",
    label: "MOSAIC HERO",
    package: 100,
    slots: [
      { x: 30, y: 30, w: 1040, h: 1420 },
      { x: 1100, y: 30, w: 470, h: 695 },
      { x: 1100, y: 755, w: 470, h: 695 },
      { x: 30, y: 1480, w: 490, h: 650 },
      { x: 550, y: 1480, w: 500, h: 650 },
      { x: 1080, y: 1480, w: 490, h: 650 },
    ],
  },
  {
    id: "p100-classic-six",
    label: "CLASSIC SIX",
    package: 100,
    slots: [
      { x: 30, y: 30, w: 500, h: 1040 }, { x: 550, y: 30, w: 500, h: 1040 }, { x: 1070, y: 30, w: 500, h: 1040 },
      { x: 30, y: 1100, w: 500, h: 1040 }, { x: 550, y: 1100, w: 500, h: 1040 }, { x: 1070, y: 1100, w: 500, h: 1040 },
    ],
  },
  {
    id: "p100-vertical-split",
    label: "VERTICAL SPLIT",
    package: 100,
    slots: [
      { x: 30, y: 30, w: 755, h: 1040 }, { x: 815, y: 30, w: 755, h: 1040 },
      { x: 30, y: 1100, w: 480, h: 500 }, { x: 550, y: 1100, w: 500, h: 500 }, { x: 1090, y: 1100, w: 480, h: 500 },
      { x: 30, y: 1640, w: 1540, h: 500 },
    ],
  },
  {
    id: "p100-asym-trio",
    label: "ASYM TRIO",
    package: 100,
    slots: [
      { x: 30, y: 30, w: 1540, h: 1040 },
      { x: 30, y: 1100, w: 755, h: 500 }, { x: 815, y: 1100, w: 755, h: 500 },
      { x: 30, y: 1640, w: 500, h: 500 }, { x: 550, y: 1640, w: 500, h: 500 }, { x: 1070, y: 1640, w: 500, h: 500 },
    ],
  },
  {
    id: "p100-modern-grid",
    label: "MODERN GRID",
    package: 100,
    slots: [
      { x: 30, y: 30, w: 1540, h: 680 },
      { x: 30, y: 740, w: 500, h: 680 }, { x: 550, y: 740, w: 500, h: 680 }, { x: 1070, y: 740, w: 500, h: 680 },
      { x: 30, y: 1450, w: 755, h: 680 }, { x: 815, y: 1450, w: 755, h: 680 },
    ],
  }
];