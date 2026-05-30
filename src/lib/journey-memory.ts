import { getMessageText } from "@/lib/chat-utils";
import type { UIMessage } from "ai";

export type JourneyMemory = {
  id: string;
  shepMessage: string;
  chatPrompt: string;
  reference?: string;
  verseText?: string;
  kind: "favorite" | "journal" | "chat" | "tag";
};

const TOPIC_KEYWORDS: Record<string, string[]> = {
  peace: ["peace", "anxious", "anxiety", "worry", "calm"],
  trust: ["trust", "faith", "doubt", "fear"],
  grief: ["grief", "grieve", "loss", "died", "death", "miss"],
  gratitude: ["grateful", "thankful", "thanks", "blessing"],
};

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function detectTopic(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [topic, words] of Object.entries(TOPIC_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) return topic;
  }
  return null;
}

export function buildJourneyMemories(input: {
  favorites: Array<{ reference: string; text: string; tag?: string; savedAt: string }>;
  journalEntries: Array<{ content: string; reference?: string; createdAt: string }>;
  chatMessages: UIMessage[];
  dismissedIds: string[];
}): JourneyMemory[] {
  const memories: JourneyMemory[] = [];
  const dismissed = new Set(input.dismissedIds);

  for (const fav of input.favorites.slice(0, 8)) {
    const days = daysSince(fav.savedAt);
    if (days < 2) continue;

    const topic = fav.tag?.toLowerCase() ?? detectTopic(fav.text);
    const topicPhrase = topic ? ` about ${topic}` : "";

    memories.push({
      id: `fav-${fav.reference}`,
      kind: fav.tag ? "tag" : "favorite",
      reference: fav.reference,
      verseText: fav.text,
      shepMessage:
        days >= 7
          ? `You saved ${fav.reference} last week${topicPhrase} — want to revisit it with me?`
          : `You saved ${fav.reference} a few days ago${topicPhrase}. Still on your heart?`,
      chatPrompt: `I've been thinking about ${fav.reference} again: "${fav.text.slice(0, 180)}". Walk with me through it.`,
    });
  }

  for (const entry of input.journalEntries.slice(0, 5)) {
    const days = daysSince(entry.createdAt);
    if (days > 21) continue;

    memories.push({
      id: `journal-${entry.createdAt}`,
      kind: "journal",
      reference: entry.reference,
      shepMessage:
        entry.reference
          ? `You journaled about ${entry.reference} — want to keep praying through it?`
          : "You wrote in your journal recently — want to talk through it with me?",
      chatPrompt: entry.reference
        ? `I journaled about ${entry.reference}. Here's what's still on my heart: ${entry.content.slice(0, 200)}`
        : `I want to continue reflecting on something I journaled: ${entry.content.slice(0, 200)}`,
    });
  }

  const userTexts = input.chatMessages
    .filter((m) => m.role === "user")
    .slice(-6)
    .map((m) => getMessageText(m))
    .join(" ");

  const chatTopic = detectTopic(userTexts);
  if (chatTopic && userTexts.length > 20) {
    memories.push({
      id: `chat-topic-${chatTopic}`,
      kind: "chat",
      shepMessage: `We talked about ${chatTopic} before — is that still weighing on you?`,
      chatPrompt: `I want to continue our conversation about ${chatTopic}. Help me process where I am today.`,
    });
  }

  return memories.filter((m) => !dismissed.has(m.id)).slice(0, 3);
}

export function pickPrimaryMemory(memories: JourneyMemory[]): JourneyMemory | null {
  return memories[0] ?? null;
}
