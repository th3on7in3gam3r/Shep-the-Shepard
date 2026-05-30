import type { DevotionTheme } from "@/lib/devotions";

const THEME_PROMPTS: Record<
  DevotionTheme,
  { shepQuestion: string; reflectionPrompts: string[] }
> = {
  Peace: {
    shepQuestion: "Where did you sense God's peace today?",
    reflectionPrompts: [
      "What stirred anxiety — and where did peace break through?",
      "Where do you need peace tomorrow?",
    ],
  },
  Trust: {
    shepQuestion: "What is God asking you to trust Him with?",
    reflectionPrompts: [
      "Where did you lean on God instead of control?",
      "What fear could you surrender in prayer?",
    ],
  },
  Gratitude: {
    shepQuestion: "Where did you notice God's goodness today?",
    reflectionPrompts: [
      "Name three gifts — small or large.",
      "Who could you thank or encourage?",
    ],
  },
  Courage: {
    shepQuestion: "Where did you need courage today?",
    reflectionPrompts: [
      "What brave step did you take — or avoid?",
      "Where is God calling you forward?",
    ],
  },
  Love: {
    shepQuestion: "How did love show up in your day?",
    reflectionPrompts: [
      "Who did you love well?",
      "Where could you love more like Christ?",
    ],
  },
  Hope: {
    shepQuestion: "Where did hope feel distant — or near?",
    reflectionPrompts: [
      "What promise are you holding onto?",
      "Where did you sense God today?",
    ],
  },
  Rest: {
    shepQuestion: "Did you make space to rest in God today?",
    reflectionPrompts: [
      "What would it look like to stop striving for a moment?",
      "Where did you sense God's nearness in stillness?",
    ],
  },
  Wisdom: {
    shepQuestion: "What decision needs God's wisdom?",
    reflectionPrompts: [
      "Where did Scripture guide your thinking?",
      "What would honoring God look like tomorrow?",
    ],
  },
};

export function getDevotionPrompts(theme: unknown) {
  const key =
    typeof theme === "string" &&
    theme in THEME_PROMPTS
      ? (theme as DevotionTheme)
      : "Peace";
  return THEME_PROMPTS[key];
}
