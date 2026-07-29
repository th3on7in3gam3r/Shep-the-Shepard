"use client";

import Link from "next/link";
import { MessageCircle, BookOpen, Sun, ChevronRight, NotebookPen, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DailyQuestCard } from "@/components/daily-quest/daily-quest-card";
import { DailyVerseCard } from "@/components/daily-verse-card";
import { ShepAvatar } from "@/components/shep-avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME, SHEP_FULL_NAME, SHEP_NAME } from "@/lib/constants";
import { getDailyDevotion } from "@/lib/devotions";
import { getSeasonalGreeting } from "@/lib/church-calendar";
import { getDisplayName, useProfileStore } from "@/stores/profile-store";
import { FaithStatsStrip } from "@/components/home/faith-stats-strip";
import { ShepRemembersCard } from "@/components/home/shep-remembers-card";
import { HeartCheckIn } from "@/components/home/heart-check-in";
import { GuidedFlowsCard } from "@/components/home/guided-flows-card";
import { OfflineDailyPackCard } from "@/components/daily-pack/offline-daily-pack-card";
import { useStreakStore } from "@/stores/streak-store";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { useDailyPackStore } from "@/stores/daily-pack-store";
import { todayKey } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const quickLinks = [
  {
    href: "/bible",
    label: "Bible Reader",
    description: "Search & save verses",
    icon: BookOpen,
  },
  {
    href: "/devotions",
    label: "Daily Devotion",
    description: "Reflection & prayer",
    icon: Sun,
  },
  {
    href: "/journal",
    label: "Journal",
    description: "Prayers & reflections",
    icon: NotebookPen,
  },
] as const;

export default function HomePage() {
  const pack = useDailyPackStore((s) =>
    s.pack?.dateKey === todayKey() ? s.pack : null,
  );
  const devotion = pack?.devotion ?? getDailyDevotion();
  const name = useProfileStore((s) => s.name);
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const questComplete = useDailyQuestStore(
    (s) => s.dateKey === todayKey() && !!s.questCompletedAt,
  );
  const displayName = getDisplayName(name);
  const seasonalGreeting = getSeasonalGreeting(displayName);
  const isNewUser = !name.trim() && currentStreak === 0 && !questComplete;
  const greeting = seasonalGreeting
    ? seasonalGreeting
    : isNewUser
      ? `Welcome to ${APP_NAME}`
      : questComplete && currentStreak > 0
        ? `Good day, ${displayName}`
        : `Welcome, ${displayName}`;

  const supportLine =
    currentStreak > 0
      ? `Your streak is at ${currentStreak} day${currentStreak === 1 ? "" : "s"} — ${SHEP_FULL_NAME} is ready when you are.`
      : `${SHEP_FULL_NAME} is here for a quiet word, a quest, or simply to listen.`;

  return (
    <>
      <PageHeader />

      <section
        aria-label="Welcome"
        className="relative mt-1 overflow-hidden rounded-3xl border border-shepherd-sage/20 bg-gradient-to-br from-shepherd-cream via-shepherd-meadow/40 to-shepherd-sky/25 px-5 pb-6 pt-7 shadow-[0_8px_32px_-12px_rgba(60,90,80,0.18)] dark:from-shepherd-sage/20 dark:via-card dark:to-shepherd-sky/10"
      >
        <div
          className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-shepherd-amber/20 blur-2xl dark:bg-shepherd-amber/10"
          aria-hidden
        />
        <div className="relative flex flex-col items-center text-center">
          <ShepAvatar size="xl" mood="happy" animated entrance className="ring-2 ring-shepherd-cream/80 shadow-md" />
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-shepherd-sage">
            {APP_NAME}
          </p>
          <h1 className="mt-1.5 max-w-[18rem] font-heading text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-[1.65rem]">
            {greeting}
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {supportLine}
          </p>
          <div className="mt-5 flex w-full max-w-sm flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              href="/chat"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 flex-1 bg-shepherd-sage text-primary-foreground shadow-md hover:bg-shepherd-sage/90",
              )}
            >
              <MessageCircle className="size-4" />
              Talk to {SHEP_NAME}
            </Link>
            <a
              href="#daily-quest"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 flex-1 border-shepherd-sage/35 bg-background/60 hover:bg-shepherd-meadow/40",
              )}
            >
              <Sparkles className="size-4 text-shepherd-amber" />
              Today&apos;s quest
            </a>
          </div>
        </div>
      </section>

      <div className="mt-5 space-y-4">
        <DailyQuestCard />

        <HeartCheckIn />

        <DailyVerseCard />

        <FaithStatsStrip />

        <ShepRemembersCard />

        <GuidedFlowsCard />

        <OfflineDailyPackCard />
      </div>

      <div className="mt-6 grid gap-3">
        <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Explore
        </p>
        {quickLinks.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="transition-colors hover:bg-shepherd-meadow/20">
              <CardContent className="flex items-center gap-3 py-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-shepherd-meadow/40">
                  <Icon className="size-5 text-shepherd-sage" />
                </span>
                <div className="flex-1">
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-6 bg-shepherd-cream/40 dark:bg-card">
        <CardContent>
          <p className="text-xs font-medium uppercase tracking-wide text-shepherd-sky dark:text-shepherd-meadow">
            Today&apos;s theme · {devotion.theme}
          </p>
          <p className="mt-1.5 line-clamp-2 font-serif text-sm leading-relaxed tracking-wide text-foreground/80">
            {devotion.reflection}
          </p>
          <Link
            href="/devotions"
            className="mt-2 inline-block text-sm font-medium text-shepherd-sage hover:underline"
          >
            Read full devotion →
          </Link>
        </CardContent>
      </Card>
    </>
  );
}
