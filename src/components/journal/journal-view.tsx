"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookMarked, MessageCircle, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useJournalStore } from "@/stores/journal-store";
import { useActivityStore } from "@/stores/activity-store";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { useChatStore } from "@/stores/chat-store";
import { getMessageText } from "@/lib/chat-utils";
import { formatRelativeTime } from "@/lib/dashboard-utils";

export function JournalView() {
  const searchParams = useSearchParams();
  const promptParam = searchParams.get("prompt");
  const referenceParam = searchParams.get("reference");

  const entries = useJournalStore((s) => s.entries);
  const addEntry = useJournalStore((s) => s.addEntry);
  const removeEntry = useJournalStore((s) => s.removeEntry);
  const logActivity = useActivityStore((s) => s.logActivity);
  const completeTask = useDailyQuestStore((s) => s.completeTask);
  const messages = useChatStore((s) => s.messages);

  const [content, setContent] = useState(() => promptParam ?? "");
  const [reference, setReference] = useState(() => referenceParam ?? "");
  const [chatSnippet, setChatSnippet] = useState("");

  const lastShepReply = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  const handleAdd = () => {
    if (!content.trim()) return;
    addEntry({
      content,
      reference: reference || undefined,
      chatSnippet: chatSnippet || undefined,
    });
    logActivity({
      type: "journal",
      title: promptParam ? "Devotion reflection" : "Prayer journal entry",
      subtitle: content.slice(0, 60) + (content.length > 60 ? "…" : ""),
    });
    completeTask("reflect");
    setContent("");
    setReference("");
    setChatSnippet("");
  };

  const linkLastChat = () => {
    if (!lastShepReply) return;
    const text = getMessageText(lastShepReply);
    setChatSnippet(text.slice(0, 300) + (text.length > 300 ? "…" : ""));
  };

  return (
    <div className="space-y-4">
      {promptParam && (
        <p className="rounded-lg bg-shepherd-meadow/25 px-3 py-2 text-xs text-muted-foreground">
          Reflecting on: {promptParam}
        </p>
      )}

      <Card className="border-shepherd-sage/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">New entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Linked verse (optional) e.g. Psalm 23:1"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          {lastShepReply && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={linkLastChat}
            >
              <MessageCircle className="size-4" />
              Link last Shep chat reply
            </Button>
          )}
          {chatSnippet && (
            <p className="rounded-lg bg-shepherd-meadow/25 p-2 text-xs italic text-muted-foreground">
              From Shep: {chatSnippet}
            </p>
          )}
          <Textarea
            placeholder="Write your prayer, reflection, or gratitude…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />
          <Button
            className="w-full bg-shepherd-sage hover:bg-shepherd-sage/90"
            onClick={handleAdd}
            disabled={!content.trim()}
          >
            <Plus className="size-4" />
            Save entry
          </Button>
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            <BookMarked className="mx-auto mb-2 size-8 opacity-40" />
            Your prayer journal is empty. Start with a thought, prayer, or a verse
            that spoke to you today.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {entry.reference && (
                      <Link
                        href={`/bible?passage=${encodeURIComponent(entry.reference)}`}
                        className="text-xs font-medium text-shepherd-sage hover:underline"
                      >
                        {entry.reference}
                      </Link>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(entry.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeEntry(entry.id)}
                    aria-label="Delete entry"
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>
                {entry.chatSnippet && (
                  <blockquote className="border-l-2 border-shepherd-sage/40 pl-2 text-xs italic text-muted-foreground">
                    Shep: {entry.chatSnippet}
                  </blockquote>
                )}
                <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                  {entry.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
