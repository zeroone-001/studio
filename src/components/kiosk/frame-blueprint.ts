
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
};

export const BLUEPRINTS: FrameBlueprint[] = [
  // 50 PHP PACKAGE (3 SHOTS)
  {
    id: "p50-l1",
    label: "LAYOUT A",
    package: 50,
    slots: [
      { x: 200, y: 180, w: 1200, h: 500 },
      { x: 200, y: 770, w: 1200, h: 500 },
      { x: 200, y: 1360, w: 1200, h: 500 },
    ],
    quotePosition: { x: 180, y: 1980, w: 1240, h: 220 }
  },
  {
    id: "p50-l2",
    label: "LAYOUT B",
    package: 50,
    slots: [
      { x: 140, y: 180, w: 1000, h: 450 },
      { x: 460, y: 760, w: 1000, h: 450 },
      { x: 140, y: 1340, w: 1000, h: 450 },
    ],
    quotePosition: { x: 180, y: 1940, w: 1240, h: 260 }
  },
  {
    id: "p50-l3",
    label: "LAYOUT C",
    package: 50,
    slots: [
      { x: 120, y: 220, w: 900, h: 480 },
      { x: 120, y: 820, w: 900, h: 480 },
      { x: 120, y: 1420, w: 900, h: 480 },
    ],
    quotePosition: { x: 1080, y: 220, w: 300, h: 1680 }
  },
  {
    id: "p50-l4",
    label: "LAYOUT D",
    package: 50,
    slots: [
      { x: 120, y: 220, w: 620, h: 620 },
      { x: 860, y: 220, w: 620, h: 620 },
      { x: 250, y: 980, w: 1100, h: 620 },
    ],
    quotePosition: { x: 180, y: 1820, w: 1240, h: 200 }
  },
  {
    id: "p50-l5",
    label: "LAYOUT E",
    package: 50,
    slots: [
      { x: 400, y: 180, w: 800, h: 500 },
      { x: 120, y: 850, w: 620, h: 500 },
      { x: 860, y: 850, w: 620, h: 500 },
    ],
    quotePosition: { x: 180, y: 1700, w: 1240, h: 200 }
  },

  // 100 PHP PACKAGE (6 SHOTS)
  {
    id: "p100-l1",
    label: "LAYOUT A",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({ x: 220, y: 180 + i * 300, w: 1160, h: 240 })),
    quotePosition: { x: 180, y: 2100, w: 1240, h: 150 }
  },
  {
    id: "p100-l2",
    label: "LAYOUT B",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 120 : 810,
      y: 220 + Math.floor(i / 2) * 500,
      w: 620,
      h: 360
    })),
    quotePosition: { x: 180, y: 1900, w: 1240, h: 200 }
  },
  {
    id: "p100-l3",
    label: "LAYOUT C",
    package: 100,
    slots: [
      { x: 180, y: 180, w: 1240, h: 500 },
      ...Array.from({ length: 5 }).map((_, i) => ({
        x: 120 + (i % 3) * 460,
        y: 800 + Math.floor(i / 3) * 400,
        w: 420,
        h: 300
      }))
    ]
  },
  {
    id: "p100-l4",
    label: "LAYOUT D",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({ x: 260, y: 180 + i * 265, w: 1080, h: 210 }))
  },
  {
    id: "p100-l5",
    label: "LAYOUT E",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 150 + (i % 2) * 450,
      y: 180 + Math.floor(i / 2) * 500,
      w: 400,
      h: 420
    }))
  },
  {
    id: "p100-l6",
    label: "LAYOUT F",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 120 : 880,
      y: 180 + i * 250,
      w: 600,
      h: 300
    }))
  },
  {
    id: "p100-l7",
    label: "LAYOUT G",
    package: 100,
    slots: [
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 120, y: 180 + i * 550, w: 700, h: 500 })),
      ...Array.from({ length: 3 }).map((_, i) => ({ x: 880, y: 180 + i * 550, w: 600, h: 300 }))
    ]
  },
  {
    id: "p100-l8",
    label: "LAYOUT H",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: i % 2 === 0 ? 300 : 500,
      y: 180 + i * 320,
      w: 800,
      h: 280
    }))
  },
  {
    id: "p100-l9",
    label: "LAYOUT I",
    package: 100,
    slots: [
      ...Array.from({ length: 5 }).map((_, i) => ({ x: 180, y: 180 + i * 280, w: 600, h: 240 })),
      { x: 180, y: 1600, w: 1240, h: 420 }
    ]
  },
  {
    id: "p100-l10",
    label: "LAYOUT J",
    package: 100,
    slots: Array.from({ length: 6 }).map((_, i) => ({
      x: 120 + (i % 2) * 680,
      y: 180 + Math.floor(i / 2) * 400,
      w: 650,
      h: 350
    })),
    quotePosition: { x: 180, y: 1800, w: 1240, h: 400 }
  }
];
