/** Shared visual identity for 2D SVG Shep and 3D procedural Shep (robot). */
export const SHEP_DESIGN = {
  /** Chassis / body metal */
  wool: "#c4c4c4",
  woolMid: "#d8d8d8",
  woolShadow: "#a8a8a8",
  /** Dark dome / face plate */
  face: "#111111",
  faceLight: "#2a2a2a",
  /** Cyan LED / visor accent (replaces former sage brand accent) */
  sage: "#00ffc6",
  sageDark: "#00c9a0",
  outline: "#6a6a6a",
  outlineSoft: "#8a8a8a",
  /** Antenna base / metal fittings */
  nose: "#999999",
  mouth: "#00e5b2",
  mouthInner: "#0a0a0a",
  tongue: "#00ffc6",
  /** Ear ring / panel inset */
  innerEar: "#e8e8e8",
  /** Soft LED cheek glow */
  blush: "#ff6b8a",
  eye: "#f5f5f5",
  eyeHighlight: "#ffffff",
  /** Antenna stick / tip accents (repurposed staff tokens) */
  staffWood: "#d0d0d0",
  staffGold: "#ff3366",
  staffStroke: "#999999",
  /** Neck collar ring */
  collar: "#00ffc6",
  collarOpacity: 0.55,
  /** Explicit robot aliases */
  chassis: "#c4c4c4",
  visor: "#00ffc6",
  antennaTip: "#ff3366",
  headDome: "#111111",
} as const;

export type ShepDesign = typeof SHEP_DESIGN;
