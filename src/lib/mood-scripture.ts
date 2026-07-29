import { DAILY_VERSE_CATALOG } from "@/lib/daily-verse-catalog";
import type { DevotionTheme } from "@/lib/devotions";

export type HeartMood =
  | "peaceful"
  | "anxious"
  | "grateful"
  | "grieving"
  | "weary"
  | "joyful";

export type MoodSuggestion = {
  mood: HeartMood;
  label: string;
  emoji: string;
  verse: { reference: string; text: string };
  devotionTheme: DevotionTheme;
  chatPrompt: string;
};

/** Soft chip surface / border colors per mood (Tailwind class pairs). */
const MOOD_CHIP_CLASSES: Record<
  HeartMood,
  { idle: string; selected: string }
> = {
  peaceful: {
    idle: "border-sky-200/80 bg-sky-50/90 text-sky-900 hover:border-sky-300 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-100",
    selected:
      "scale-[1.02] border-sky-500 bg-sky-500 text-white shadow-sm shadow-sky-500/25 dark:border-sky-400 dark:bg-sky-500",
  },
  anxious: {
    idle: "border-slate-200/90 bg-slate-50/90 text-slate-800 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100",
    selected:
      "scale-[1.02] border-slate-500 bg-slate-600 text-white shadow-sm dark:border-slate-400 dark:bg-slate-500",
  },
  grateful: {
    idle: "border-amber-200/80 bg-amber-50/90 text-amber-950 hover:border-amber-300 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-50",
    selected:
      "scale-[1.02] border-amber-500 bg-amber-500 text-white shadow-sm shadow-amber-500/25 dark:border-amber-400 dark:bg-amber-500",
  },
  grieving: {
    idle: "border-indigo-200/70 bg-indigo-50/80 text-indigo-950 hover:border-indigo-300 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-100",
    selected:
      "scale-[1.02] border-indigo-500 bg-indigo-500 text-white shadow-sm dark:border-indigo-400 dark:bg-indigo-500",
  },
  weary: {
    idle: "border-emerald-200/80 bg-emerald-50/90 text-emerald-950 hover:border-emerald-300 dark:border-emerald-800/50 dark:bg-emerald-950/35 dark:text-emerald-50",
    selected:
      "scale-[1.02] border-emerald-600 bg-emerald-600 text-white shadow-sm dark:border-emerald-400 dark:bg-emerald-600",
  },
  joyful: {
    idle: "border-yellow-200/80 bg-yellow-50/90 text-yellow-950 hover:border-yellow-300 dark:border-yellow-800/40 dark:bg-yellow-950/30 dark:text-yellow-50",
    selected:
      "scale-[1.02] border-yellow-500 bg-yellow-400 text-yellow-950 shadow-sm shadow-yellow-400/30 dark:border-yellow-400 dark:bg-yellow-500 dark:text-yellow-950",
  },
};

export function getMoodChipClasses(mood: HeartMood, selected: boolean): string {
  const pair = MOOD_CHIP_CLASSES[mood];
  return selected ? pair.selected : pair.idle;
}

const MOOD_CONFIG: Record<
  HeartMood,
  {
    label: string;
    emoji: string;
    verseIndex: number;
    devotionTheme: DevotionTheme;
    chatPrompt: string;
  }
> = {
  peaceful: {
    label: "Peaceful",
    emoji: "🕊️",
    verseIndex: 0,
    devotionTheme: "Peace",
    chatPrompt:
      "I'm feeling relatively peaceful today. Help me rest in God's presence and not rush past this moment.",
  },
  anxious: {
    label: "Anxious",
    emoji: "🌊",
    verseIndex: 3,
    devotionTheme: "Peace",
    chatPrompt:
      "My heart feels anxious today. Walk with me through Scripture and prayer — I need God's peace.",
  },
  grateful: {
    label: "Grateful",
    emoji: "🙏",
    verseIndex: 5,
    devotionTheme: "Gratitude",
    chatPrompt:
      "I'm feeling grateful today. Help me thank God and think about who I can encourage.",
  },
  grieving: {
    label: "Grieving",
    emoji: "💧",
    verseIndex: 2,
    devotionTheme: "Hope",
    chatPrompt:
      "I'm carrying grief today. Please be gentle — help me bring my sorrow to God without easy answers.",
  },
  weary: {
    label: "Weary",
    emoji: "🌿",
    verseIndex: 6,
    devotionTheme: "Rest",
    chatPrompt:
      "I'm weary and running on empty. Remind me of Jesus' invitation to rest and help me breathe.",
  },
  joyful: {
    label: "Joyful",
    emoji: "✨",
    verseIndex: 4,
    devotionTheme: "Hope",
    chatPrompt:
      "My heart is joyful today! Help me celebrate God's goodness and share it with someone.",
  },
};

export const HEART_MOODS = Object.keys(MOOD_CONFIG) as HeartMood[];

export function getMoodSuggestion(mood: HeartMood): MoodSuggestion {
  const config = MOOD_CONFIG[mood];
  const verse = DAILY_VERSE_CATALOG[config.verseIndex] ?? DAILY_VERSE_CATALOG[0];
  return {
    mood,
    label: config.label,
    emoji: config.emoji,
    verse,
    devotionTheme: config.devotionTheme,
    chatPrompt: config.chatPrompt,
  };
}

export function getMoodOptions(): Array<Pick<MoodSuggestion, "mood" | "label" | "emoji">> {
  return HEART_MOODS.map((mood) => ({
    mood,
    label: MOOD_CONFIG[mood].label,
    emoji: MOOD_CONFIG[mood].emoji,
  }));
}
