"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, PenLine } from "lucide-react";
import { useState } from "react";
import { ShepAvatar } from "@/components/shep-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildDevotionChatContext } from "@/lib/chat-context";
import type { Devotion } from "@/lib/devotions";
import { cn } from "@/lib/utils";
import { useChatContextStore } from "@/stores/chat-context-store";
import { useJournalStore } from "@/stores/journal-store";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { useActivityStore } from "@/stores/activity-store";

type DevotionReflectProps = {
  devotion: Devotion;
};

export function DevotionReflect({ devotion }: DevotionReflectProps) {
  const router = useRouter();
  const setPending = useChatContextStore((s) => s.setPending);
  const addEntry = useJournalStore((s) => s.addEntry);
  const logActivity = useActivityStore((s) => s.logActivity);
  const completeTask = useDailyQuestStore((s) => s.completeTask);
  const [journalLine, setJournalLine] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [savedLabel, setSavedLabel] = useState<string | null>(null);

  const talkWithShep = () => {
    const draft = [journalLine.trim(), personalNote.trim()].filter(Boolean).join("\n\n");
    setPending(
      buildDevotionChatContext({
        theme: devotion.theme,
        title: devotion.title,
        verse: devotion.verse,
        shepQuestion: devotion.shepQuestion,
        userAnswer: draft || undefined,
      }),
    );
    router.push("/chat");
  };

  const saveJournal = () => {
    const answer = journalLine.trim();
    if (!answer) return;
    const note = personalNote.trim();
    const content = note
      ? `${answer}\n\n— Personal note: ${note}`
      : answer;
    addEntry({
      content,
      reference: devotion.verse.reference,
    });
    logActivity({
      type: "journal",
      title: "Devotion reflection",
      subtitle: devotion.theme,
    });
    completeTask("reflect");
    setSavedLabel(`Saved · ${devotion.verse.reference}`);
    setJournalLine("");
    setPersonalNote("");
  };

  return (
    <Card className="border-shepherd-sage/30 bg-gradient-to-br from-shepherd-meadow/25 via-shepherd-cream/40 to-shepherd-sky/15 shadow-sm dark:from-shepherd-sage/15 dark:via-card dark:to-card">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShepAvatar size="md" mood="happy" className="shrink-0 ring-2 ring-shepherd-sage/25" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-shepherd-sage">
              Shep asks
            </p>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground">
              {devotion.shepQuestion}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            A gentle prompt to get started
          </p>
          <div className="flex flex-wrap gap-2">
            {devotion.reflectionPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setJournalLine(prompt);
                  setSavedLabel(null);
                }}
                className={cn(
                  "rounded-full border border-shepherd-sage/25 bg-background/80 px-3 py-1.5 text-left text-xs font-medium transition-colors",
                  "hover:border-shepherd-sage/45 hover:bg-shepherd-meadow/30",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shepherd-sage",
                )}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="devotion-answer"
            className="text-xs font-medium text-muted-foreground"
          >
            Your answer to Shep
          </label>
          <Textarea
            id="devotion-answer"
            value={journalLine}
            onChange={(e) => {
              setJournalLine(e.target.value);
              setSavedLabel(null);
            }}
            placeholder="Share what’s stirring in your heart…"
            rows={4}
            className="min-h-[5.5rem] text-sm leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="devotion-note"
            className="text-xs font-medium text-muted-foreground"
          >
            Short personal note <span className="font-normal">(optional)</span>
          </label>
          <Input
            id="devotion-note"
            value={personalNote}
            onChange={(e) => {
              setPersonalNote(e.target.value);
              setSavedLabel(null);
            }}
            placeholder="Anything else you want to remember…"
            className="text-sm"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="h-10 flex-1 bg-shepherd-sage hover:bg-shepherd-sage/90"
            onClick={saveJournal}
            disabled={!journalLine.trim()}
          >
            <PenLine className="size-4" />
            Save to journal
          </Button>
          <Button
            variant="outline"
            className="h-10 flex-1 border-shepherd-sage/35 bg-background/70"
            onClick={talkWithShep}
          >
            <MessageCircle className="size-4" />
            Reflect with Shep
          </Button>
        </div>

        {savedLabel && (
          <div className="flex flex-wrap items-center gap-2 text-xs" role="status">
            <p className="font-medium text-shepherd-sage">{savedLabel}</p>
            <Link
              href="/journal"
              className="font-medium text-shepherd-sage underline-offset-2 hover:underline"
            >
              Open journal
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
