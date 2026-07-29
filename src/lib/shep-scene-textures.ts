import * as THREE from "three";

const SKY_TOP = "#e8e8e8";
const SKY_MID = "#d4d4d4";
const SKY_HORIZON = "#cecbcb";
const SKY_GROUND = "#b8b8b8";
const GROUND_FAR = "#9a9a9a";

let skyTexture: THREE.CanvasTexture | null = null;
let meadowTexture: THREE.CanvasTexture | null = null;
const radialTextureCache = new Map<string, THREE.CanvasTexture>();

function createSkyTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, SKY_TOP);
  gradient.addColorStop(0.35, SKY_MID);
  gradient.addColorStop(0.55, SKY_HORIZON);
  gradient.addColorStop(0.75, SKY_GROUND);
  gradient.addColorStop(1, GROUND_FAR);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 4, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createMeadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const half = 128;
  const gradient = ctx.createRadialGradient(half, half, 20, half, half, half);
  gradient.addColorStop(0, "rgba(200,200,200,0.9)");
  gradient.addColorStop(0.45, "rgba(170,170,170,0.45)");
  gradient.addColorStop(0.78, "rgba(150,150,150,0.15)");
  gradient.addColorStop(1, "rgba(150,150,150,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  return new THREE.CanvasTexture(canvas);
}

function createRadialTexture(inner: string, mid: string, outer: string, size = 128) {
  const key = `${inner}|${mid}|${outer}|${size}`;
  const cached = radialTextureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(0.5, mid);
  gradient.addColorStop(1, outer);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  radialTextureCache.set(key, texture);
  return texture;
}

/** Module-level texture cache — survives HMR remounts without glTexStorage conflicts. */
export function getSkyTexture() {
  if (typeof document === "undefined") return null;
  if (!skyTexture) skyTexture = createSkyTexture();
  return skyTexture;
}

export function getMeadowTexture() {
  if (typeof document === "undefined") return null;
  if (!meadowTexture) meadowTexture = createMeadowTexture();
  return meadowTexture;
}

export function getRadialTexture(
  inner: string,
  mid: string,
  outer: string,
  size = 128,
) {
  if (typeof document === "undefined") return null;
  return createRadialTexture(inner, mid, outer, size);
}

export { SKY_HORIZON };
