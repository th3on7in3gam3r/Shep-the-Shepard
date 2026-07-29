"use client";

import Link from "next/link";
import { MessageCircle, BookOpen, Sun, ChevronRight, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { DailyQuestCard } from "@/components/daily-quest/daily-quest-card";
import { DailyVerseCard } from "@/components/daily-verse-card";
import { ShepAvatar } from "@/components/shep-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { APP_TAGLINE, SHEP_FULL_NAME, SHEP_NAME } from "@/lib/constants";
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
    icon: UserRound,
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
      ? `Welcome to Shepherd`
      : questComplete && currentStreak > 0
        ? `Good day, ${displayName}`
        : `Welcome, ${displayName}`;

  const homeLine = `${SHEP_FULL_NAME} is here to encourage you in God's Word.`;

  return (
    <>
      <PageHeader title={greeting} subtitle={APP_TAGLINE} showShep />

      <div className="mt-4 space-y-4">
        <DailyQuestCard />

        <Link href="/chat" className="block">
          <Card className="overflow-hidden border-shepherd-sage/35 bg-gradient-to-r from-shepherd-sage to-shepherd-sky shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]">
            <CardContent className="flex items-center gap-4 py-4">
              <ShepAvatar size="lg" animated entrance />
              <div className="flex-1 text-primary-foreground">
                <p className="text-sm opacity-90">Quick start</p>
                <p className="text-lg font-semibold">Talk to {SHEP_NAME}</p>
                <p className="text-sm opacity-80">{homeLine}</p>
              </div>
              <ChevronRight className="size-6 shrink-0 text-primary-foreground/80" />
            </CardContent>
          </Card>
        </Link>

        <HeartCheckIn />

        <DailyVerseCard />

        <FaithStatsStrip />

        <ShepRemembersCard />

        <GuidedFlowsCard />

        <OfflineDailyPackCard />
      </div>

      <div className="mt-6 grid gap-3">
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

        <Link href="/chat">
          <Card className="border-shepherd-sage/20 bg-shepherd-meadow/15">
            <CardContent className="flex items-center gap-3 py-3">
              <MessageCircle className="size-5 text-shepherd-sage" />
              <span className="text-sm font-medium">Open voice chat with Shep</span>
              <ChevronRight className="ml-auto size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="mt-6 bg-shepherd-cream/30 dark:bg-card">
        <CardContent>
          <p className="text-xs font-medium uppercase tracking-wide text-shepherd-sky dark:text-shepherd-meadow">
            Today&apos;s theme · {devotion.theme}
          </p>
          <p className="mt-1 line-clamp-2 font-serif text-sm text-foreground/80">
            {devotion.reflection}
          </p>
          <Link
            href="/devotions"
            className="mt-1 inline-block text-sm font-medium text-shepherd-sage hover:underline"
          >
            Read full devotion →
          </Link>
        </CardContent>
      </Card>
    </>
  );
}
