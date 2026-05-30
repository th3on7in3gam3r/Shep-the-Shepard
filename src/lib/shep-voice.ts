/** Hero Shep artwork — chat meadow centerpiece. */
export const SHEP_HERO_IMAGE = "/shep/shep-hero.png";

/** OpenAI TTS voices — natural speech (requires OPENAI_API_KEY). */
export const SHEP_OPENAI_VOICES = {
  nova: {
    id: "nova",
    label: "Nova — warm & friendly (recommended)",
    description: "Best default for Shep. Natural, gentle, conversational.",
  },
  shimmer: {
    id: "shimmer",
    label: "Shimmer — soft & calm",
    description: "Quieter, soothing tone for prayer and comfort.",
  },
  fable: {
    id: "fable",
    label: "Fable — storytelling",
    description: "Expressive when reading Scripture aloud.",
  },
  sage: {
    id: "sage",
    label: "Sage — steady & wise",
    description: "Calm, unhurried pastoral tone.",
  },
  echo: {
    id: "echo",
    label: "Echo — warm male",
    description: "Friendly male voice if you prefer Shep as a shepherd brother.",
  },
  onyx: {
    id: "onyx",
    label: "Onyx — deep male",
    description: "Richer, deeper male voice.",
  },
} as const;

export type ShepOpenAiVoice = keyof typeof SHEP_OPENAI_VOICES;

export const DEFAULT_SHEP_OPENAI_VOICE: ShepOpenAiVoice = "nova";
