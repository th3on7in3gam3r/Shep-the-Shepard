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
