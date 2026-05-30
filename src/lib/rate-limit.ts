type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitResult =
  | { success: true; remaining: number; resetAt: number }
  | {
      success: false;
      remaining: 0;
      resetAt: number;
      retryAfterSec: number;
    };

const store = new Map<string, RateLimitEntry>();

/** In-memory sliding window — sufficient for early deploy; swap for Upstash/KV at scale. */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: max - 1, resetAt };
  }

  if (entry.count >= max) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: max - entry.count,
    resetAt: entry.resetAt,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function parseChatRateLimitConfig() {
  const max = Number(process.env.CHAT_RATE_LIMIT_MAX ?? "30");
  const windowSec = Number(process.env.CHAT_RATE_LIMIT_WINDOW_SEC ?? "60");
  return {
    max: Number.isFinite(max) && max > 0 ? max : 30,
    windowMs:
      Number.isFinite(windowSec) && windowSec > 0 ? windowSec * 1000 : 60_000,
  };
}
