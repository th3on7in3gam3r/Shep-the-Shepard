"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Flame, Shuffle, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DevotionReflect } from "@/components/devotions/devotion-reflect";
import {
  DEVOTION_THEMES,
  getDailyDevotion,
  getDevotionByTheme,
  getRandomDevotion,
  resolveDevotionTheme,
  type Devotion,
  type DevotionTheme,
} from "@/lib/devotions";
import { getDevotionThemeChipClasses } from "@/lib/devotion-theme-chips";
import { getSeasonInfo } from "@/lib/church-calendar";
import { todayKey } from "@/lib/date-utils";
import { useStudySession } from "@/hooks/use-study-session";
import { useActivityStore } from "@/stores/activity-store";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { useDailyPackStore } from "@/stores/daily-pack-store";
import { useIsClient } from "@/hooks/use-is-client";
import { cn } from "@/lib/utils";

function countDevotionsThisWeek(timestamps: string[]): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let count = 0;
  for (const ts of timestamps) {
    const t = Date.parse(ts);
    if (Number.isFinite(t) && t >= weekAgo) count += 1;
  }
  return count;
}

export function DevotionView() {
  useStudySession();
  const isClient = useIsClient();
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");
  const urlTheme = themeParam ? resolveDevotionTheme(themeParam) : null;
  const logActivity = useActivityStore((s) => s.logActivity);
  const activityItems = useActivityStore((s) => s.items);
  const completeTask = useDailyQuestStore((s) => s.completeTask);
  const reflectDone = useDailyQuestStore((s) => {
    s.resetIfNewDay();
    return !!s.completedTasks.reflect;
  });
  const packDevotion = useDailyPackStore((s) =>
    s.pack?.dateKey === todayKey() ? s.pack.devotion : null,
  );
  const [pickedDevotion, setPickedDevotion] = useState<Devotion | null>(null);

  const devotion =
    urlTheme != null
      ? getDevotionByTheme(urlTheme)
      : pickedDevotion ?? packDevotion ?? getDailyDevotion();
  const selectedTheme = resolveDevotionTheme(devotion.theme);
  const season = getSeasonInfo();

  const weeklyDays = useMemo(() => {
    if (!isClient) return 0;
    return countDevotionsThisWeek(
      activityItems.filter((i) => i.type === "devotion").map((i) => i.timestamp),
    );
  }, [activityItems, isClient]);

  useEffect(() => {
    completeTask("word");
  }, [completeTask]);

  const applyTheme = (theme: DevotionTheme) => {
    const next = getDevotionByTheme(theme);
    setPickedDevotion(next);
    logActivity({
      type: "devotion",
      title: next.title,
      subtitle: theme,
    });
  };

  const shuffle = () => {
    const next = getRandomDevotion();
    setPickedDevotion(next);
    logActivity({
      type: "devotion",
      title: "Random devotion",
      subtitle: next.theme,
    });
  };

  return (
    <div className="space-y-4">
      {isClient && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-shepherd-amber/25 bg-shepherd-amber/10 px-3.5 py-3">
          <Flame className="mt-0.5 size-4 shrink-0 text-shepherd-amber" />
          <div className="min-w-0 text-xs leading-relaxed">
            <p className="font-medium text-foreground">
              {weeklyDays === 0
                ? "Begin your week in the Word"
                : `You’ve spent time in ${weeklyDays} devotion${weeklyDays === 1 ? "" : "s"} this week`}
            </p>
            <p className="mt-0.5 text-muted-foreground">
              {reflectDone
                ? "Today’s quest reflect step is complete — beautifully done."
                : "Answer Shep below to finish today’s Reflect quest step."}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2.5 px-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Choose a theme
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Devotion themes">
          {DEVOTION_THEMES.map((theme) => {
            const selected = selectedTheme === theme;
            return (
              <button
                key={theme}
                type="button"
                aria-pressed={selected}
                onClick={() => applyTheme(theme)}
                className={cn(
                  "min-h-9 rounded-full border-2 px-3.5 py-1.5 text-xs font-semibold transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shepherd-sage focus-visible:ring-offset-2",
                  "active:scale-[0.97]",
                  getDevotionThemeChipClasses(theme, selected),
                )}
              >
                {theme}
              </button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-full rounded-xl border-shepherd-sage/25"
          onClick={shuffle}
        >
          <Shuffle className="size-3.5" />
          Surprise me with a verse
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="bg-shepherd-sage/15 text-shepherd-sage hover:bg-shepherd-sage/15">
          <Sparkles className="mr-1 size-3" />
          {devotion.theme}
        </Badge>
        {season && (
          <Badge variant="outline" className="gap-1 text-[10px]">
            {season.emoji} {season.label}
          </Badge>
        )}
      </div>

      <Card className="overflow-hidden border-shepherd-sage/20 bg-gradient-to-br from-shepherd-cream/90 via-shepherd-cream/50 to-shepherd-meadow/25 shadow-[0_8px_28px_-14px_rgba(60,90,80,0.18)] dark:from-shepherd-sage/10 dark:via-card dark:to-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg leading-snug">{devotion.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-5">
          <blockquote className="rounded-2xl border border-shepherd-sage/15 bg-background/50 px-4 py-4 sm:px-5">
            <p className="font-serif text-lg leading-[1.8] tracking-wide text-foreground/95">
              &ldquo;{devotion.verse.text}&rdquo;
            </p>
            <p className="mt-3 text-sm font-medium text-shepherd-sage">
              — {devotion.verse.reference}
            </p>
          </blockquote>
        </CardContent>
      </Card>

      <Card className="border-shepherd-sage/15 bg-card/80">
        <CardContent className="space-y-5 p-4 sm:p-5">
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Reflection
            </h2>
            <p className="text-[0.95rem] leading-relaxed text-foreground/90">
              {devotion.reflection}
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Prayer
            </h2>
            <p className="font-serif text-[0.95rem] italic leading-relaxed tracking-wide text-foreground/90">
              {devotion.prayer}
            </p>
          </section>
        </CardContent>
      </Card>

      <DevotionReflect devotion={devotion} />

      <Link
        href={`/bible?passage=${encodeURIComponent(devotion.verse.reference)}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-shepherd-meadow/20"
      >
        <BookOpen className="size-4" />
        Explore this verse in the Bible
      </Link>
    </div>
  );
}
