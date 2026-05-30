export type WebGLCapability = "pending" | "supported" | "unsupported";

let cachedSupported: boolean | null = null;

/** Cached, one-time WebGL probe — never call getContext on every render. */
export function isWebGLAvailable(): boolean {
  if (cachedSupported !== null) return cachedSupported;
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext("experimental-webgl");

    cachedSupported = !!gl;

    if (gl && "getExtension" in gl) {
      (gl as WebGLRenderingContext)
        .getExtension("WEBGL_lose_context")
        ?.loseContext();
    }
  } catch {
    cachedSupported = false;
  }

  return cachedSupported;
}

export function getWebGLCapability(): WebGLCapability {
  if (typeof window === "undefined") return "pending";
  return isWebGLAvailable() ? "supported" : "unsupported";
}
