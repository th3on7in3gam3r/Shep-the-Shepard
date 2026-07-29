import { SHEP_SYSTEM_PROMPT } from "@/lib/shep-system";

export function buildShepSystemPrompt(userName?: string): string {
  const name = userName?.trim();
  if (!name) return SHEP_SYSTEM_PROMPT;

  return `${SHEP_SYSTEM_PROMPT}

## This conversation
The user's name is ${name}. Address them warmly by name when it feels natural — not in every sentence.`;
}
