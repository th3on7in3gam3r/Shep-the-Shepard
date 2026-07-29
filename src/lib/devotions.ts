import { DAILY_VERSES } from "./daily-verses";
import { getSeasonalDevotion } from "./seasonal-content";
import { getDevotionPrompts } from "./devotion-prompts";

export type Devotion = {
  title: string;
  verse: { reference: string; text: string };
  reflection: string;
  prayer: string;
  theme: string;
  shepQuestion: string;
  reflectionPrompts: string[];
};

const THEMES = [
  "Peace",
  "Trust",
  "Gratitude",
  "Courage",
  "Love",
  "Hope",
  "Rest",
  "Wisdom",
] as const;

export type DevotionTheme = (typeof THEMES)[number];

/** Map untrusted input to a known catalog theme (allowlist only). */
export function resolveDevotionTheme(value: unknown): DevotionTheme {
  if (typeof value !== "string") {
    return THEMES[0];
  }
  const match = THEMES.find((t) => t.toLowerCase() === value.toLowerCase());
  return match ?? THEMES[0];
}

function resolveDate(input: unknown): Date {
  if (!(input instanceof Date) || Number.isNaN(input.getTime())) {
    return new Date();
  }
  return input;
}

function dayOfYear(date: Date): number {
  const year = date.getFullYear();
  const start = Date.UTC(year, 0, 0);
  const utc = Date.UTC(year, date.getMonth(), date.getDate());
  return Math.floor((utc - start) / 86_400_000);
}

const REFLECTIONS: Record<string, string[]> = {
  Peace: [
    "In a noisy world, God's peace is not the absence of trouble but His presence in the midst of it. Jesus invites the weary to come and rest in Him.",
    "When storms rise around you, remember that Christ is the Prince of Peace. His calm can anchor your soul even when circumstances shake.",
  ],
  Trust: [
    "Trust is choosing to lean on God when you cannot see the whole path. He has never failed those who wait on Him.",
    "Like a lamb following the shepherd, we are called to trust the Good Shepherd who knows every valley and hill ahead.",
  ],
  Gratitude: [
    "Gratitude turns our eyes from what we lack to the Giver of every good gift. Today, name one blessing and thank God for it.",
    "A thankful heart is fertile soil for joy. Even in difficulty, we can thank God for His faithfulness that never runs dry.",
  ],
  Courage: [
    "Courage is not the absence of fear but faith that moves forward anyway — because God goes with you.",
    "The same God who parted seas and raised the dead lives in you through Christ. Take one brave step today.",
  ],
  Love: [
    "God's love is not earned; it is given. Receive it fully today, then let it overflow to someone who needs kindness.",
    "Love is the mark of Christ's followers. Ask the Spirit to show you one practical way to love today.",
  ],
  Hope: [
    "Christian hope is anchored in a risen Savior. What feels final to us is never final to God.",
    "Hope whispers that morning is coming. Hold onto God's promises when the night feels long.",
  ],
  Rest: [
    "Sabbath rest is a gift — permission to stop striving and remember that God sustains what we cannot.",
    "Come away for a moment. Breathe. You are beloved, not merely productive.",
  ],
  Wisdom: [
    "Wisdom begins with reverence for God. Before big decisions, pause and ask: what honors Him?",
    "James promises that God gives wisdom generously to those who ask. Bring your questions to Him in prayer today.",
  ],
};

const PRAYERS: Record<string, string> = {
  Peace:
    "Prince of Peace, quiet my anxious heart. Help me rest in Your presence today. Amen.",
  Trust:
    "Faithful Father, I choose to trust You with what I cannot control. Lead me step by step. Amen.",
  Gratitude:
    "Thank You, Lord, for Your goodness. Open my eyes to blessings I overlook. Amen.",
  Courage:
    "Lord, strengthen me with Your Spirit. Help me act in faith, not fear. Amen.",
  Love:
    "God of love, fill me with Your love and show me someone to bless today. Amen.",
  Hope:
    "Living Hope, lift my eyes to You. Remind me that You hold my future. Amen.",
  Rest:
    "Gentle Shepherd, let me rest in You. Restore my soul according to Your promise. Amen.",
  Wisdom:
    "Lord of wisdom, guide my thoughts and decisions. Give me discernment that honors You. Amen.",
};

export const DEVOTION_THEMES: readonly DevotionTheme[] = THEMES;

export function getDevotionByTheme(theme: unknown): Devotion {
  const normalized = resolveDevotionTheme(theme);
  const reflections = REFLECTIONS[normalized];
  const verse =
    DAILY_VERSES[Math.floor(Math.random() * DAILY_VERSES.length)];
  const reflection =
    reflections[Math.floor(Math.random() * reflections.length)];

  return {
    title: `Devotion: ${normalized}`,
    theme: normalized,
    verse,
    reflection,
    prayer: PRAYERS[normalized],
    ...getDevotionPrompts(normalized),
  };
}

export function getRandomDevotion(): Devotion {
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  return getDevotionByTheme(theme);
}

export function getDailyDevotion(date?: Date): Devotion {
  const resolved = resolveDate(date ?? new Date());
  const seasonal = getSeasonalDevotion(resolved);
  const dayIndex = dayOfYear(resolved) % 365;

  const theme = THEMES[dayIndex % THEMES.length];
  const verse = DAILY_VERSES[dayIndex % DAILY_VERSES.length];

  if (seasonal) {
    return {
      ...seasonal,
      verse,
    };
  }

  const reflections = REFLECTIONS[theme];
  const reflection = reflections[dayIndex % reflections.length];
  const prompts = getDevotionPrompts(theme);

  return {
    title: `Daily Devotion: ${theme}`,
    theme,
    verse,
    reflection,
    prayer: PRAYERS[theme],
    ...prompts,
  };
}
