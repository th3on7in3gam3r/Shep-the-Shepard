"use client";

import { useCallback, useEffect, useState } from "react";
import { BookMarked, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DAILY_VERSES, getDailyVerse, type DailyVerse } from "@/lib/daily-verses";
import { todayKey } from "@/lib/date-utils";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { useDailyPackStore } from "@/stores/daily-pack-store";

export function DailyVerseCard() {
  const completeTask = useDailyQuestStore((s) => s.completeTask);
  const packVerse = useDailyPackStore((s) =>
    s.pack?.dateKey === todayKey() ? s.pack.verse : null,
  );
  const isOfflinePack = useDailyPackStore((s) => s.isOfflineFallback);
  const [override, setOverride] = useState<DailyVerse | null>(null);
  const verse = override ?? packVerse ?? getDailyVerse();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    completeTask("verse");
  }, [completeTask]);

  const refreshVerse = useCallback(() => {
    setIsRefreshing(true);
    const others = DAILY_VERSES.filter(
      (v) => v.reference !== verse.reference,
    );
    const next = others[Math.floor(Math.random() * others.length)] ?? getDailyVerse();
    setOverride(next);
    setTimeout(() => setIsRefreshing(false), 400);
  }, [verse.reference]);

  return (
    <Card className="bg-gradient-to-br from-shepherd-cream/90 via-shepherd-wood/10 to-shepherd-meadow/30 dark:from-shepherd-sage/10 dark:via-card dark:to-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base font-medium text-shepherd-sage">
          <BookMarked className="size-4" />
          Verse of the Day
          {isOfflinePack && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-normal text-muted-foreground">
              Offline
            </span>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={refreshVerse}
          aria-label="Another verse"
          className="text-shepherd-sage"
        >
          <RefreshCw
            className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <blockquote className="font-serif text-lg leading-relaxed text-foreground/90 transition-opacity duration-300">
          &ldquo;{verse.text}&rdquo;
        </blockquote>
        <p className="text-sm font-medium text-muted-foreground">
          — {verse.reference}
        </p>
      </CardContent>
    </Card>
  );
}
