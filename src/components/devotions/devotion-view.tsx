"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Shuffle, Sparkles } from "lucide-react";
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
import { getSeasonInfo } from "@/lib/church-calendar";
import { todayKey } from "@/lib/date-utils";
import { useStudySession } from "@/hooks/use-study-session";
import { useActivityStore } from "@/stores/activity-store";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { useDailyPackStore } from "@/stores/daily-pack-store";

export function DevotionView() {
  useStudySession();
  const searchParams = useSearchParams();
  const themeParam = searchParams.get("theme");
  const urlTheme = themeParam ? resolveDevotionTheme(themeParam) : null;
  const logActivity = useActivityStore((s) => s.logActivity);
  const completeTask = useDailyQuestStore((s) => s.completeTask);
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
      <Card className="border-shepherd-wood/20 bg-shepherd-cream/20 dark:bg-card">
        <CardContent className="space-y-3 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Create a devotion
          </p>
          <div className="flex flex-wrap gap-2">
            {DEVOTION_THEMES.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => applyTheme(theme)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTheme === theme
                    ? "bg-shepherd-sage text-primary-foreground"
                    : "bg-shepherd-meadow/40 text-foreground hover:bg-shepherd-meadow/60"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={shuffle}
          >
            <Shuffle className="size-4" />
            Random verse & theme
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Badge className="bg-shepherd-sage/20 text-shepherd-sage hover:bg-shepherd-sage/20">
          <Sparkles className="mr-1 size-3" />
          {devotion.theme}
        </Badge>
        {season && (
          <Badge variant="outline" className="gap-1 text-[10px]">
            {season.emoji} {season.label}
          </Badge>
        )}
      </div>

      <Card className="border-shepherd-sage/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{devotion.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <blockquote className="rounded-xl border border-shepherd-meadow/40 bg-shepherd-meadow/25 p-4 dark:bg-shepherd-sage/10">
            <p className="font-serif text-lg leading-relaxed">
              &ldquo;{devotion.verse.text}&rdquo;
            </p>
            <p className="mt-2 text-sm font-medium text-shepherd-sage">
              — {devotion.verse.reference}
            </p>
          </blockquote>

          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Reflection
            </h2>
            <p className="leading-relaxed text-foreground/90">
              {devotion.reflection}
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Prayer
            </h2>
            <p className="font-serif italic leading-relaxed text-foreground/90">
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
