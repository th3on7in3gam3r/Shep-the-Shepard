import type { UIMessage } from "ai";

export function getMessageText(message: {
  parts: Array<{ type: string; text?: string }>;
}): string {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

export function getLastAssistantText(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      const text = getMessageText(messages[i]);
      if (text.trim()) return text;
    }
  }
  return null;
}

/** Drop duplicate ids (keeps last occurrence) — OpenAI rejects duplicate message ids. */
export function dedupeChatMessages(messages: UIMessage[]): UIMessage[] {
  const seen = new Set<string>();
  const result: UIMessage[] = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (!message?.id || !message.role || !Array.isArray(message.parts)) continue;
    if (seen.has(message.id)) continue;
    seen.add(message.id);
    result.unshift(message);
  }

  return result;
}
