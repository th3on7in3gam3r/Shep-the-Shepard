/** Shared visual identity for 2D SVG Shep and 3D procedural Shep. */
export const SHEP_DESIGN = {
  wool: "#f7f3ec",
  woolMid: "#efe9e0",
  woolShadow: "#e5ddd2",
  face: "#d4c4a8",
  faceLight: "#ede8df",
  sage: "#7d9b76",
  sageDark: "#3d4f3a",
  outline: "#5c7356",
  outlineSoft: "#8a9f84",
  nose: "#c9a882",
  mouth: "#8a7358",
  mouthInner: "#5a4035",
  tongue: "#d4847a",
  innerEar: "#e8c4c0",
  blush: "#e8b8b0",
  eye: "#2a3328",
  eyeHighlight: "#faf8f5",
  staffWood: "#9a7420",
  staffGold: "#c49a2a",
  staffStroke: "#8b6914",
  /** Sage collar band — matches 3D torus collar opacity feel in SVG */
  collar: "#7d9b76",
  collarOpacity: 0.88,
} as const;

export type ShepDesign = typeof SHEP_DESIGN;
