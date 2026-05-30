"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, PenLine } from "lucide-react";
import { ShepAvatar } from "@/components/shep-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { buildMoodChatContext } from "@/lib/chat-context";
import type { Devotion } from "@/lib/devotions";
import { cn } from "@/lib/utils";
import { useChatContextStore } from "@/stores/chat-context-store";
import { useJournalStore } from "@/stores/journal-store";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { useActivityStore } from "@/stores/activity-store";
import { useState } from "react";

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
  const [saved, setSaved] = useState(false);

  const talkWithShep = () => {
    setPending(
      buildMoodChatContext(`After devotion · ${devotion.theme}`, devotion.shepQuestion),
    );
    router.push("/chat");
  };

  const saveJournal = () => {
    const text = journalLine.trim();
    if (!text) return;
    addEntry({
      content: text,
      reference: devotion.verse.reference,
    });
    logActivity({
      type: "journal",
      title: "Devotion reflection",
      subtitle: devotion.theme,
    });
    completeTask("reflect");
    setJournalLine("");
    setSaved(true);
  };

  return (
    <Card className="border-shepherd-sage/25 bg-shepherd-meadow/10">
      <CardContent className="space-y-3 pt-5">
        <div className="flex items-start gap-3">
          <ShepAvatar size="sm" className="shrink-0" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-shepherd-sage">
              Shep asks
            </p>
            <p className="mt-1 text-sm leading-relaxed">{devotion.shepQuestion}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {devotion.reflectionPrompts.map((prompt) => (
            <Link
              key={prompt}
              href={`/journal?reference=${encodeURIComponent(devotion.verse.reference)}&prompt=${encodeURIComponent(prompt)}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-auto whitespace-normal py-1.5 text-left text-xs",
              )}
            >
              {prompt}
            </Link>
          ))}
        </div>

        <Textarea
          value={journalLine}
          onChange={(e) => {
            setJournalLine(e.target.value);
            setSaved(false);
          }}
          placeholder="Where did you sense God today? (optional journal line)"
          rows={3}
          className="text-sm"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="h-8 bg-shepherd-sage hover:bg-shepherd-sage/90"
            onClick={saveJournal}
            disabled={!journalLine.trim()}
          >
            <PenLine className="size-3.5" />
            Save to journal
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={talkWithShep}>
            <MessageCircle className="size-3.5" />
            Reflect with Shep
          </Button>
        </div>

        {saved && (
          <p className="text-xs text-shepherd-sage">Saved to your prayer journal.</p>
        )}
      </CardContent>
    </Card>
  );
}
