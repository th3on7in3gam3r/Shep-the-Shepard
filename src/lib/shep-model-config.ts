/** Path to optional external GLB (drop a cute sheep model here). */
export const SHEP_GLB_PATH = "/models/shep.glb";

/**
 * Set to `true` after adding `public/models/shep.glb`.
 * While false, procedural Shep is used with no network probe (avoids 404 noise).
 */
export const SHEP_USE_GLB = false;

/** Shared layout for chat card 3D scene — keeps procedural + GLB models balanced. */
export const SHEP_SCENE = {
  modelScale: 0.98,
  modelPosition: [0, 0.08, 0] as [number, number, number],
  camera: {
    position: [0, 0.82, 3.15] as [number, number, number],
    fov: 46,
  },
  float: {
    speed: 0.48,
    rotationIntensity: 0.002,
    floatIntensity: 0.014,
  },
  /** Y position for the soft ground shadow blob. */
  shadowY: -0.328,
  /** Y position for the sanctuary ground platform. */
  groundY: -0.36,
  /** Target height when auto-fitting imported GLB meshes. */
  glbTargetHeight: 1.12,
  /** Staff accessory scale relative to the model (keeps crook visible, not oversized). */
  staffScale: 1.08,
  /** OrbitControls — drag to rotate, scroll to zoom. */
  orbit: {
    target: [0, 0.08, 0] as [number, number, number],
    minDistance: 2.2,
    maxDistance: 5.5,
    autoRotateSpeed: 0.32,
    minPolarAngle: Math.PI / 5,
    maxPolarAngle: Math.PI / 2.05,
  },
} as const;

export const SHEP_MODEL_SOURCES = [
  {
    name: "Cute Sheep (Sketchfab — top pick)",
    url: "https://sketchfab.com/3d-models/cute-sheep-2d7689003081441596ead936ffe49b15",
    note: "Download GLB → save as public/models/shep.glb (CC Attribution)",
  },
  {
    name: "Cute Sheep alt (Sketchfab)",
    url: "https://sketchfab.com/3d-models/cute-sheep-5f9a8a5c253b4c4eb4fd8c6c11ff419a",
    note: "Fluffy meadow sheep — export GLB with textures",
  },
  {
    name: "Quaternius Sheep (CC0)",
    url: "https://poly.pizza/m/rgJXF570ZK",
    note: "Animated low-poly — download GLB → shep.glb",
  },
] as const;
