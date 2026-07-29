/** Client-safe OpenAI user-key helpers (no server SDK imports). */

export const USER_OPENAI_KEY_HEADER = "x-user-openai-key";

/** Light format check for user-supplied keys (never log the value). */
export function isPlausibleOpenAiApiKey(key: string): boolean {
  const trimmed = key.trim();
  if (trimmed.length < 20 || trimmed.length > 256) return false;
  return /^sk-[A-Za-z0-9_-]+$/.test(trimmed);
}
