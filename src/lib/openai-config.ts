import { createOpenAI } from "@ai-sdk/openai";
import {
  isPlausibleOpenAiApiKey,
  USER_OPENAI_KEY_HEADER,
} from "@/lib/openai-user-key";

export {
  isPlausibleOpenAiApiKey,
  USER_OPENAI_KEY_HEADER,
} from "@/lib/openai-user-key";

/** Server OpenAI settings — env key plus optional per-request user key. */

export type ResolvedOpenAiKey = {
  apiKey?: string;
  source: "user" | "server" | "none";
  error?: string;
};

export function getOpenAiApiKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || undefined;
}

export function isOpenAiConfigured(): boolean {
  return Boolean(getOpenAiApiKey());
}

export function getUserOpenAiApiKeyFromRequest(req: Request): string | undefined {
  const header = req.headers.get(USER_OPENAI_KEY_HEADER)?.trim();
  return header || undefined;
}

/**
 * Prefer a valid user key from the request header; otherwise use the server env key.
 * Invalid user keys return an error instead of silently falling back (so misuse is obvious).
 */
export function resolveOpenAiApiKey(req?: Request): ResolvedOpenAiKey {
  const userKey = req ? getUserOpenAiApiKeyFromRequest(req) : undefined;
  if (userKey) {
    if (!isPlausibleOpenAiApiKey(userKey)) {
      return {
        source: "none",
        error:
          "Your OpenAI API key looks invalid. Use a key that starts with sk- from platform.openai.com, or clear it in Settings to use the app key.",
      };
    }
    return { apiKey: userKey.trim(), source: "user" };
  }
  const serverKey = getOpenAiApiKey();
  if (serverKey) return { apiKey: serverKey, source: "server" };
  return { source: "none" };
}

export function isOpenAiAvailable(req?: Request): boolean {
  return Boolean(resolveOpenAiApiKey(req).apiKey);
}

export function getOpenAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export function getOpenAiTemperature(): number {
  const raw = process.env.OPENAI_TEMPERATURE;
  if (raw == null || raw === "") return 0.75;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(2, Math.max(0, value)) : 0.75;
}

/** Create an OpenAI provider bound to the resolved key. */
export function createOpenAiProvider(apiKey: string) {
  return createOpenAI({ apiKey });
}
