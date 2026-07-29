import { dayOfYear } from "@/lib/date-utils";
import { getSeasonalQuestTheme } from "@/lib/seasonal-content";

export type QuestTaskId = "verse" | "word" | "connect" | "reflect";

export type QuestTask = {
  id: QuestTaskId;
  label: string;
  description: string;
  href: string;
};

export const DAILY_QUEST_TASKS: readonly QuestTask[] = [
  {
    id: "verse",
    label: "Read today's verse",
    description: "Pause with the Verse of the Day",
    href: "/",
  },
  {
    id: "word",
    label: "Spend time in the Word",
    description: "Read the Bible or a devotion",
    href: "/devotions",
  },
  {
    id: "connect",
    label: "Connect with Shep",
    description: "Share what's on your heart in chat",
    href: "/chat",
  },
  {
    id: "reflect",
    label: "Reflect & journal",
    description: "Answer Shep's question or write a journal line",
    href: "/devotions",
  },
] as const;

export type DailyQuestTheme = {
  title: string;
  prompt: string;
};

const QUEST_THEMES: readonly DailyQuestTheme[] = [
  {
    title: "Morning Mercies",
    prompt: "Begin today grateful for God's fresh mercies.",
  },
  {
    title: "Steadfast Heart",
    prompt: "Take one small step to stay rooted in Scripture.",
  },
  {
    title: "Quiet Strength",
    prompt: "Let God's Word steady you before the day unfolds.",
  },
  {
    title: "Shepherd's Path",
    prompt: "Walk closely with Jesus — Shep is cheering you on.",
  },
  {
    title: "Living Hope",
    prompt: "Hold onto a promise from God today.",
  },
  {
    title: "Faithful Steps",
    prompt: "Consistency in small things builds a beautiful habit.",
  },
  {
    title: "Sabbath Rest",
    prompt: "Make space to breathe, pray, and listen.",
  },
];

export function getDailyQuestTheme(date = new Date()): DailyQuestTheme {
  const seasonal = getSeasonalQuestTheme(date);
  if (seasonal) {
    return { title: seasonal.title, prompt: seasonal.prompt };
  }
  return QUEST_THEMES[dayOfYear(date) % QUEST_THEMES.length];
}

export function getQuestProgress(completed: Partial<Record<QuestTaskId, boolean>>) {
  const done = DAILY_QUEST_TASKS.filter((task) => completed[task.id]).length;
  return { done, total: DAILY_QUEST_TASKS.length };
}

export function isQuestComplete(completed: Partial<Record<QuestTaskId, boolean>>) {
  return DAILY_QUEST_TASKS.every((task) => completed[task.id]);
}
