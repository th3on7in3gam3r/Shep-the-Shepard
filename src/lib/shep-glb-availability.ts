import { SHEP_GLB_PATH, SHEP_USE_GLB } from "@/lib/shep-model-config";

let cachedAvailable: boolean | null = SHEP_USE_GLB ? null : false;
let checkPromise: Promise<boolean> | null = null;

/** Single shared HEAD check — only when SHEP_USE_GLB is enabled. */
export function isShepGlbAvailable(): Promise<boolean> {
  if (!SHEP_USE_GLB) return Promise.resolve(false);
  if (cachedAvailable !== null) return Promise.resolve(cachedAvailable);
  if (checkPromise) return checkPromise;

  checkPromise = fetch(SHEP_GLB_PATH, { method: "HEAD" })
    .then((res) => {
      const type = res.headers.get("content-type") ?? "";
      cachedAvailable =
        res.ok &&
        (type.includes("model") ||
          type.includes("octet-stream") ||
          type.includes("gltf"));
      return cachedAvailable;
    })
    .catch(() => {
      cachedAvailable = false;
      return false;
    });

  return checkPromise;
}

export function getShepGlbAvailableSync(): boolean | null {
  if (!SHEP_USE_GLB) return false;
  return cachedAvailable;
}
