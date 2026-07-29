/** Server-only OpenAI settings (read from env). */
export function getOpenAiApiKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || undefined;
}

export function isOpenAiConfigured(): boolean {
  return Boolean(getOpenAiApiKey());
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
