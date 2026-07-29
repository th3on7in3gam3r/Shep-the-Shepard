/** Curated Bible Start here prompts — rotated after journaling a passage. */

export type StartHerePrompt = {
  id: "comfort" | "psalm" | "classic";
  label: string;
  reference: string;
  hint: string;
};

export type StartHereOffsets = {
  comfort: number;
  psalm: number;
  classic: number;
};

type PromptSeed = { reference: string; hint: string };

const COMFORT_POOL: readonly PromptSeed[] = [
  {
    reference: "Matthew 11:28",
    hint: "Come to me, all who labor and are heavy laden…",
  },
  {
    reference: "Isaiah 41:10",
    hint: "Fear not, for I am with you…",
  },
  {
    reference: "Philippians 4:6-7",
    hint: "Do not be anxious about anything…",
  },
  {
    reference: "Joshua 1:9",
    hint: "Be strong and courageous…",
  },
  {
    reference: "Lamentations 3:22-23",
    hint: "His mercies are new every morning…",
  },
  {
    reference: "2 Timothy 1:7",
    hint: "God gave us a spirit not of fear…",
  },
  {
    reference: "John 16:33",
    hint: "Take heart; I have overcome the world.",
  },
  {
    reference: "Isaiah 40:31",
    hint: "Those who wait for the Lord shall renew their strength…",
  },
] as const;

const PSALM_POOL: readonly PromptSeed[] = [
  {
    reference: "Psalm 23",
    hint: "The Lord is my shepherd…",
  },
  {
    reference: "Psalm 46:10",
    hint: "Be still, and know that I am God.",
  },
  {
    reference: "Psalm 121:1-2",
    hint: "I lift up my eyes to the hills…",
  },
  {
    reference: "Psalm 27:1",
    hint: "The Lord is my light and my salvation…",
  },
  {
    reference: "Psalm 91:1-2",
    hint: "He who dwells in the shelter of the Most High…",
  },
  {
    reference: "Psalm 100:1-2",
    hint: "Make a joyful noise to the Lord…",
  },
  {
    reference: "Psalm 34:8",
    hint: "Oh, taste and see that the Lord is good…",
  },
  {
    reference: "Psalm 139:13-14",
    hint: "I praise you, for I am fearfully and wonderfully made…",
  },
] as const;

const CLASSIC_POOL: readonly PromptSeed[] = [
  {
    reference: "John 3:16",
    hint: "For God so loved the world…",
  },
  {
    reference: "Romans 8:28",
    hint: "All things work together for good…",
  },
  {
    reference: "Genesis 1:1",
    hint: "In the beginning, God created the heavens and the earth.",
  },
  {
    reference: "John 1:1",
    hint: "In the beginning was the Word…",
  },
  {
    reference: "Proverbs 3:5-6",
    hint: "Trust in the Lord with all your heart…",
  },
  {
    reference: "Jeremiah 29:11",
    hint: "For I know the plans I have for you…",
  },
  {
    reference: "Ephesians 2:8-9",
    hint: "By grace you have been saved through faith…",
  },
  {
    reference: "Hebrews 11:1",
    hint: "Faith is the assurance of things hoped for…",
  },
] as const;

const POOLS = {
  comfort: COMFORT_POOL,
  psalm: PSALM_POOL,
  classic: CLASSIC_POOL,
} as const;

const LABELS = {
  comfort: "Today's verse",
  psalm: "A short Psalm",
  classic: "Classic start",
} as const;

function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function pickSeed(
  pool: readonly PromptSeed[],
  index: number,
  avoidReference?: string,
): PromptSeed {
  const start = wrapIndex(index, pool.length);
  const avoid = avoidReference?.trim().toLowerCase();
  if (!avoid) return pool[start];
  for (let step = 0; step < pool.length; step++) {
    const candidate = pool[wrapIndex(start + step, pool.length)];
    if (candidate.reference.toLowerCase() !== avoid) return candidate;
  }
  return pool[start];
}

export function getStartHerePrompts(
  offsets: StartHereOffsets,
  options?: {
    /** Prefer this for the comfort slot when offset is still 0. */
    todayVerse?: { reference: string; text: string };
    avoidReference?: string;
  },
): StartHerePrompt[] {
  const comfortSeed =
    offsets.comfort === 0 && options?.todayVerse
      ? {
          reference: options.todayVerse.reference,
          hint:
            options.todayVerse.text.slice(0, 72) +
            (options.todayVerse.text.length > 72 ? "…" : ""),
        }
      : pickSeed(POOLS.comfort, offsets.comfort, options?.avoidReference);

  return [
    {
      id: "comfort",
      label: LABELS.comfort,
      ...comfortSeed,
    },
    {
      id: "psalm",
      label: LABELS.psalm,
      ...pickSeed(POOLS.psalm, offsets.psalm, options?.avoidReference),
    },
    {
      id: "classic",
      label: LABELS.classic,
      ...pickSeed(POOLS.classic, offsets.classic, options?.avoidReference),
    },
  ];
}

export function nextStartHereOffsets(
  current: StartHereOffsets,
): StartHereOffsets {
  return {
    comfort: wrapIndex(current.comfort + 1, POOLS.comfort.length),
    psalm: wrapIndex(current.psalm + 1, POOLS.psalm.length),
    classic: wrapIndex(current.classic + 1, POOLS.classic.length),
  };
}

export const DEFAULT_START_HERE_OFFSETS: StartHereOffsets = {
  comfort: 0,
  psalm: 0,
  classic: 0,
};
