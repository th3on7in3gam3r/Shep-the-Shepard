"use client";

import Link from "next/link";
import {
  BookMarked,
  BookOpen,
  ChevronRight,
  Flame,
  Heart,
  MessageCircle,
  ScrollText,
  Settings,
  Sun,
  Timer,
} from "lucide-react";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { StatCard } from "@/components/dashboard/stat-card";
import { ShepAvatar } from "@/components/shep-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommunityFeed } from "@/components/community/community-feed";
import { DailyQuestCard } from "@/components/daily-quest/daily-quest-card";
import {
  countActivityThisWeek,
  formatRelativeTime,
  formatStudyTime,
  getActivityHref,
  getStreakMessage,
  isWithinPastWeek,
} from "@/lib/dashboard-utils";
import { SHEP_NAME } from "@/lib/constants";
import { useProfileStore } from "@/stores/profile-store";
import { useStreakStore } from "@/stores/streak-store";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { todayKey } from "@/lib/date-utils";
import { useSettingsStore } from "@/stores/settings-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useChatStore } from "@/stores/chat-store";
import { useActivityStore } from "@/stores/activity-store";
import { useJournalStore } from "@/stores/journal-store";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/bible", label: "Bible", icon: BookOpen },
  { href: "/devotions", label: "Devotions", icon: Sun },
  { href: "/journal", label: "Journal", icon: ScrollText },
  { href: "/saved", label: "Saved", icon: Heart },
] as const;

export function DashboardView() {
  const name = useProfileStore((s) => s.name);
  const bio = useProfileStore((s) => s.bio);
  const photoUrl = useProfileStore((s) => s.photoUrl);
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const longestStreak = useStreakStore((s) => s.longestStreak);
  const questComplete = useDailyQuestStore(
    (s) => s.dateKey === todayKey() && !!s.questCompletedAt,
  );
  const studyMinutesTotal = useSettingsStore((s) => s.studyMinutesTotal);
  const favorites = useFavoritesStore((s) => s.favorites);
  const messages = useChatStore((s) => s.messages);
  const activity = useActivityStore((s) => s.items);
  const journalEntries = useJournalStore((s) => s.entries);

  const chatCount = messages.filter((m) => m.role === "user").length;
  const journalCount = journalEntries.length;
  const hasName = Boolean(name.trim());
  const displayName = name.trim();

  const chatsThisWeek = countActivityThisWeek(activity, "chat");
  const versesThisWeek =
    countActivityThisWeek(activity, "verse_saved") ||
    favorites.filter((f) => isWithinPastWeek(f.savedAt)).length;
  const journalThisWeek = journalEntries.filter((e) =>
    isWithinPastWeek(e.createdAt),
  ).length;

  const streakMessage = getStreakMessage(currentStreak, questComplete);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <ProfileAvatar name={name} photoUrl={photoUrl} size="lg" />
            <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-shepherd-cream p-0.5 ring-2 ring-background dark:bg-card">
              <ShepAvatar size="sm" mood="happy" className="size-8 p-0.5" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-shepherd-sage">
              Your walk with {SHEP_NAME}
            </p>
            <h2 className="font-heading text-xl font-semibold leading-tight">
              {hasName ? displayName : "Welcome"}
            </h2>
            {bio ? (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {bio}
              </p>
            ) : !hasName ? (
              <p className="mt-0.5 text-sm text-muted-foreground">
                <Link
                  href="/settings"
                  className="text-shepherd-sage underline-offset-2 hover:underline"
                >
                  Add your name in Settings
                </Link>{" "}
                to personalize this space.
              </p>
            ) : null}
            <Link
              href="/#daily-quest"
              className="mt-2 inline-flex items-center gap-0.5 text-xs font-medium text-shepherd-sage underline-offset-2 hover:underline"
            >
              Back to today&apos;s quest
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
        <Link href="/settings">
          <Button variant="ghost" size="icon-sm" aria-label="Settings">
            <Settings className="size-5 text-muted-foreground" />
          </Button>
        </Link>
      </div>

      <DailyQuestCard
        compact
        showContinueCta
        streakMessage={streakMessage}
      />

      <div>
        <h3 className="mb-2 text-sm font-semibold">Quick access</h3>
        <div className="grid grid-cols-5 gap-2">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border border-shepherd-sage/15 bg-shepherd-cream/30 px-1.5 py-3 text-center transition-colors",
                "hover:border-shepherd-sage/30 hover:bg-shepherd-meadow/35 dark:bg-card",
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-shepherd-meadow/50 text-shepherd-sage dark:bg-shepherd-sage/15">
                <Icon className="size-4" />
              </span>
              <span className="text-[10px] font-medium leading-tight text-foreground">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-semibold">Streaks</h3>
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Day streak"
              value={currentStreak}
              icon={Flame}
              hint={
                currentStreak === 0
                  ? "Your first day is waiting"
                  : undefined
              }
            />
            <StatCard
              label="Best streak"
              value={longestStreak}
              icon={Flame}
              hint={
                longestStreak === 0
                  ? "A quiet milestone ahead"
                  : undefined
              }
            />
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Engagement</h3>
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Verses saved"
              value={favorites.length}
              icon={Heart}
              hint={
                versesThisWeek > 0
                  ? `${versesThisWeek} this week`
                  : favorites.length === 0
                    ? "Save a verse that speaks to you"
                    : undefined
              }
            />
            <StatCard
              label="Chats with Shep"
              value={chatCount}
              icon={MessageCircle}
              hint={
                chatsThisWeek > 0
                  ? `${chatsThisWeek} this week`
                  : chatCount === 0
                    ? "Shep is ready when you are"
                    : undefined
              }
            />
            <StatCard
              label="Prayer journal"
              value={journalCount}
              icon={BookMarked}
              hint={
                journalThisWeek > 0
                  ? `${journalThisWeek} this week`
                  : journalCount === 0
                    ? "A line of prayer goes far"
                    : undefined
              }
            />
            <StatCard
              label="Study & prayer time"
              value={formatStudyTime(studyMinutesTotal)}
              icon={Timer}
              hint={
                studyMinutesTotal === 0
                  ? "Time grows with each visit"
                  : undefined
              }
            />
          </div>
        </div>
      </div>

      <Card className="border-shepherd-sage/15 bg-shepherd-cream/20 shadow-none dark:bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-3">
          {activity.length === 0 ? (
            <div className="space-y-3 px-4 pb-1">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your walk with {SHEP_NAME} will show up here — chats, devotions,
                and moments in the Word.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/chat"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-shepherd-sage hover:bg-shepherd-sage/90",
                  )}
                >
                  Start a conversation with {SHEP_NAME}
                </Link>
                <Link
                  href="/devotions"
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  Open today&apos;s devotion
                </Link>
              </div>
            </div>
          ) : (
            <ScrollArea className="max-h-56">
              <ul className="space-y-0.5 px-2">
                {activity.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={getActivityHref(item.type)}
                      className="flex items-start justify-between gap-2 rounded-lg px-2 py-2.5 transition-colors hover:bg-shepherd-meadow/30"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        {item.subtitle && (
                          <p className="truncate text-xs text-muted-foreground">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                        <ChevronRight className="size-3.5 text-muted-foreground" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <CommunityFeed demoted />
    </div>
  );
}
