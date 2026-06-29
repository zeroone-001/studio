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
  {
    id: "p50-strip-classic",
    label: "CLASSIC STACK",
    package: 50,
    slots: [
      { x: 30, y: 30, w: 1540, h: 710 },
      { x: 30, y: 760, w: 1540, h: 710 },
      { x: 30, y: 1490, w: 1540, h: 700 },
    ],
  },
  {
    id: "p50-strip-hero",
    label: "HERO FOCUS",
    package: 50,
    slots: [
      { x: 30, y: 30, w: 1540, h: 1050 },
      { x: 30, y: 1100, w: 1540, h: 540 },
      { x: 30, y: 1660, w: 1540, h: 530 },
    ],
  },
  {
    id: "p50-strip-dynamic",
    label: "DYNAMIC BASE",
    package: 50,
    slots: [
      { x: 30, y: 30, w: 1540, h: 540 },
      { x: 30, y: 590, w: 1540, h: 540 },
      { x: 30, y: 1150, w: 1540, h: 1040 },
    ],
  },

  // ₱100 PACKAGE: 4x6 PORTRAIT (6 SHOTS)
  {
    id: "p100-grid-standard",
    label: "STANDARD GRID",
    package: 100,
    slots: [
      { x: 30, y: 30, w: 755, h: 710 }, { x: 815, y: 30, w: 755, h: 710 },
      { x: 30, y: 760, w: 755, h: 710 }, { x: 815, y: 760, w: 755, h: 710 },
      { x: 30, y: 1490, w: 755, h: 700 }, { x: 815, y: 1490, w: 755, h: 700 },
    ],
  },
  {
    id: "p100-mosaic-hero",
    label: "MOSAIC HERO",
    package: 100,
    slots: [
      { x: 30, y: 30, w: 1040, h: 1450 },
      { x: 1100, y: 30, w: 470, h: 715 },
      { x: 1100, y: 775, w: 470, h: 705 },
      { x: 30, y: 1510, w: 490, h: 680 },
      { x: 550, y: 1510, w: 500, h: 680 },
      { x: 1080, y: 1510, w: 490, h: 680 },
    ],
  },
  {
    id: "p100-vertical-triplets",
    label: "VERTICAL TRIPLETS",
    package: 100,
    slots: [
      { x: 30, y: 30, w: 500, h: 1070 }, { x: 550, y: 30, w: 500, h: 1070 }, { x: 1070, y: 30, w: 500, h: 1070 },
      { x: 30, y: 1120, w: 500, h: 1070 }, { x: 550, y: 1120, w: 500, h: 1070 }, { x: 1070, y: 1120, w: 500, h: 1070 },
    ],
  },
  {
    id: "p100-panorama-mix",
    label: "PANORAMA MIX",
    package: 100,
    slots: [
      { x: 30, y: 30, w: 1540, h: 1070 },
      { x: 30, y: 1120, w: 755, h: 520 }, { x: 815, y: 1120, w: 755, h: 520 },
      { x: 30, y: 1670, w: 500, h: 520 }, { x: 550, y: 1670, w: 500, h: 520 }, { x: 1070, y: 1670, w: 500, h: 520 },
    ],
  },
  {
    id: "p100-staggered-focus",
    label: "STAGGERED FOCUS",
    package: 100,
    slots: [
      { x: 30, y: 30, w: 755, h: 520 }, { x: 815, y: 30, w: 755, h: 520 },
      { x: 30, y: 580, w: 1540, h: 1070 },
      { x: 30, y: 1680, w: 500, h: 510 }, { x: 550, y: 1680, w: 500, h: 510 }, { x: 1070, y: 1680, w: 500, h: 510 },
    ],
  },
  {
    id: "p100-modern-asymmetry",
    label: "MODERN ASYMMETRY",
    package: 100,
    slots: [
      { x: 30, y: 30, w: 500, h: 710 }, { x: 550, y: 30, w: 1020, h: 710 },
      { x: 30, y: 770, w: 1020, h: 710 }, { x: 1070, y: 770, w: 500, h: 710 },
      { x: 30, y: 1510, w: 755, h: 680 }, { x: 815, y: 1510, w: 755, h: 680 },
    ],
  }
];
