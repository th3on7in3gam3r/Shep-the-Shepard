export const VERSE_TAGS = [
  "Comfort",
  "Strength",
  "Wisdom",
  "Hope",
  "Peace",
  "Love",
  "Faith",
  "Gratitude",
] as const;

export type VerseTag = (typeof VERSE_TAGS)[number];

export const DAILY_PROMPTS = [
  "What verse gave you peace today?",
  "Share a moment God felt close.",
  "Which promise are you holding onto?",
  "Who can you encourage with Scripture today?",
  "What are you grateful for this morning?",
] as const;

export function getDailyPrompt(): string {
  const day = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86_400_000,
  );
  return DAILY_PROMPTS[day % DAILY_PROMPTS.length];
}
