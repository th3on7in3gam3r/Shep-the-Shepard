import { SHEP_SYSTEM_PROMPT } from "@/lib/shep-system";

export type ShepTimeOfDay = "morning" | "afternoon" | "evening" | "night";

export type BuildShepSystemPromptOptions = {
  userName?: string;
  timeOfDay?: ShepTimeOfDay | string;
};

/** Local clock → coarse time-of-day for companion phrasing. */
export function getLocalTimeOfDay(date = new Date()): ShepTimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function buildShepSystemPrompt(
  options?: BuildShepSystemPromptOptions | string,
): string {
  // Backward compatible: buildShepSystemPrompt(userName)
  const opts: BuildShepSystemPromptOptions =
    typeof options === "string" ? { userName: options } : (options ?? {});

  const parts = [SHEP_SYSTEM_PROMPT];
  const name = opts.userName?.trim();
  const timeOfDay = opts.timeOfDay?.trim();

  const conversationNotes: string[] = [];
  if (name) {
    conversationNotes.push(
      `The user's name is ${name}. Address them warmly by name when it feels natural — not in every sentence.`,
    );
  }
  if (timeOfDay) {
    conversationNotes.push(
      `It is currently ${timeOfDay} for the user. Prefer matching day/evening/night phrasing when you ask how their day or night is going.`,
    );
  }

  if (conversationNotes.length > 0) {
    parts.push(`## This conversation\n${conversationNotes.join("\n")}`);
  }

  return parts.join("\n\n");
}
