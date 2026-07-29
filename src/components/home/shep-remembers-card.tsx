"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { ShepAvatar } from "@/components/shep-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMemoryChatContext } from "@/lib/chat-context";
import {
  buildJourneyMemories,
  pickPrimaryMemory,
} from "@/lib/journey-memory";
import { useChatContextStore } from "@/stores/chat-context-store";
import { useChatStore } from "@/stores/chat-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useJournalStore } from "@/stores/journal-store";
import { useJourneyStore } from "@/stores/journey-store";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/hooks/use-is-client";

export function ShepRemembersCard() {
  const router = useRouter();
  const isClient = useIsClient();
  const favorites = useFavoritesStore((s) => s.favorites);
  const journalEntries = useJournalStore((s) => s.entries);
  const chatMessages = useChatStore((s) => s.messages);
  const dismissedIds = useJourneyStore((s) => s.dismissedIds);
  const dismissMemory = useJourneyStore((s) => s.dismissMemory);
  const setPending = useChatContextStore((s) => s.setPending);

  const memory = useMemo(() => {
    if (!isClient) return null;
    const memories = buildJourneyMemories({
      favorites,
      journalEntries,
      chatMessages,
      dismissedIds,
    });
    return pickPrimaryMemory(memories);
  }, [isClient, favorites, journalEntries, chatMessages, dismissedIds]);

  if (!memory) return null;

  const handleTalk = () => {
    setPending(
      buildMemoryChatContext({
        message: memory.chatPrompt,
        reference: memory.reference,
        verseText: memory.verseText,
      }),
    );
    router.push("/chat");
  };

  return (
    <Card className="border-shepherd-sage/25 bg-shepherd-cream/40 dark:bg-card">
      <CardContent className="flex gap-3">
        <ShepAvatar size="md" className="shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-shepherd-sage">
              Shep remembers
            </p>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-6 shrink-0"
              aria-label="Dismiss"
              onClick={() => dismissMemory(memory.id)}
            >
              <X className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
          <p className="text-sm leading-relaxed">{memory.shepMessage}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="h-8 bg-shepherd-sage hover:bg-shepherd-sage/90"
              onClick={handleTalk}
            >
              <Sparkles className="size-3.5" />
              Talk with Shep
            </Button>
            {memory.reference && (
              <Link
                href={`/bible?passage=${encodeURIComponent(memory.reference)}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8")}
              >
                Open in Bible
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
