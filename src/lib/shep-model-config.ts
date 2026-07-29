/** Path to optional external GLB (drop a robot model here). */
export const SHEP_GLB_PATH = "/models/shep.glb";

/**
 * Set to `true` after adding `public/models/shep.glb`.
 * While false, procedural Shep is used with no network probe (avoids 404 noise).
 */
export const SHEP_USE_GLB = false;

/** Shared layout for chat card 3D scene — keeps procedural + GLB models balanced. */
export const SHEP_SCENE = {
  modelScale: 1.05,
  modelPosition: [0, 0.12, 0] as [number, number, number],
  camera: {
    position: [0, 0.55, 3.4] as [number, number, number],
    fov: 42,
  },
  float: {
    speed: 0.4,
    rotationIntensity: 0.002,
    floatIntensity: 0.012,
  },
  /** Y position for the soft ground shadow blob. */
  shadowY: -0.42,
  /** Y position for the ground platform. */
  groundY: -0.45,
  /** Target height when auto-fitting imported GLB meshes. */
  glbTargetHeight: 1.12,
  /** Staff accessory scale (unused for robot; kept for GLB path compat). */
  staffScale: 1.08,
  /** OrbitControls — drag to rotate, scroll to zoom. */
  orbit: {
    target: [0, 0.12, 0] as [number, number, number],
    minDistance: 2.4,
    maxDistance: 5.5,
    autoRotateSpeed: 0.28,
    minPolarAngle: Math.PI / 5,
    maxPolarAngle: Math.PI / 2.05,
  },
} as const;

export const SHEP_MODEL_SOURCES = [
  {
    name: "Cute Sheep (Sketchfab — legacy)",
    url: "https://sketchfab.com/3d-models/cute-sheep-2d7689003081441596ead936ffe49b15",
    note: "Legacy sheep GLB — procedural robot is the default now",
  },
] as const;
