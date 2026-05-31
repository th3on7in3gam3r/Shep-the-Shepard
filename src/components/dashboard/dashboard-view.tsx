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
  Timer,
} from "lucide-react";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { StatCard } from "@/components/dashboard/stat-card";
import { ShepAvatar } from "@/components/shep-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommunityFeed } from "@/components/community/community-feed";
import { DailyQuestCard } from "@/components/daily-quest/daily-quest-card";
import {
  formatRelativeTime,
  formatStudyTime,
  getStreakMessage,
} from "@/lib/dashboard-utils";
import { SHEP_NAME } from "@/lib/constants";
import { getDisplayName, useProfileStore } from "@/stores/profile-store";
import { useStreakStore } from "@/stores/streak-store";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { todayKey } from "@/lib/date-utils";
import { useSettingsStore } from "@/stores/settings-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useChatStore } from "@/stores/chat-store";
import { useActivityStore } from "@/stores/activity-store";
import { useJournalStore } from "@/stores/journal-store";

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
  const journalCount = useJournalStore((s) => s.entries.length);

  const chatCount = messages.filter((m) => m.role === "user").length;
  const displayName = getDisplayName(name);
  const recentFavorites = favorites.slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ProfileAvatar name={name} photoUrl={photoUrl} size="lg" />
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h2 className="font-heading text-xl font-semibold">{displayName}</h2>
            {bio && (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{bio}</p>
            )}
          </div>
        </div>
        <Link href="/settings">
          <Button variant="ghost" size="icon-sm" aria-label="Settings">
            <Settings className="size-5 text-muted-foreground" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/journal">
          <Card className="h-full transition-colors hover:bg-shepherd-meadow/20">
            <CardContent className="flex items-center gap-2 p-3">
              <ScrollText className="size-4 text-shepherd-sage" />
              <span className="text-sm font-medium">Journal</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/saved">
          <Card className="h-full transition-colors hover:bg-shepherd-meadow/20">
            <CardContent className="flex items-center gap-2 p-3">
              <BookOpen className="size-4 text-shepherd-sage" />
              <span className="text-sm font-medium">Saved verses</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="border-shepherd-sage/25 bg-gradient-to-br from-shepherd-meadow/30 to-shepherd-cream/40 dark:from-shepherd-sage/10 dark:to-card">
        <CardContent className="flex items-center gap-3 p-4">
          <ShepAvatar size="sm" animated mood="happy" />
          <p className="text-sm leading-relaxed text-foreground/90">
            {getStreakMessage(currentStreak, questComplete)}
          </p>
        </CardContent>
      </Card>

      <DailyQuestCard compact />

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Day streak" value={currentStreak} icon={Flame} />
        <StatCard label="Best streak" value={longestStreak} icon={Flame} />
        <StatCard label="Verses saved" value={favorites.length} icon={Heart} />
        <StatCard label="Chats with Shep" value={chatCount} icon={MessageCircle} />
        <StatCard
          label="Prayer journal"
          value={journalCount}
          icon={BookMarked}
        />
        <StatCard
          label="Study & prayer time"
          value={formatStudyTime(studyMinutesTotal)}
          icon={Timer}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Quick access</h3>
        </div>
        <div className="grid gap-2">
          <Link href="/saved">
            <Card className="transition-colors hover:bg-shepherd-meadow/20">
              <CardContent className="flex items-center gap-3 p-3">
                <Heart className="size-5 text-shepherd-sage" />
                <span className="flex-1 text-sm font-medium">Saved Verses</span>
                <Badge variant="secondary">{favorites.length}</Badge>
                <ChevronRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/journal">
            <Card className="transition-colors hover:bg-shepherd-meadow/20">
              <CardContent className="flex items-center gap-3 p-3">
                <BookMarked className="size-5 text-shepherd-sage" />
                <span className="flex-1 text-sm font-medium">Prayer Journal</span>
                <Badge variant="secondary">{journalCount}</Badge>
                <ChevronRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/chat">
            <Card className="transition-colors hover:bg-shepherd-meadow/20">
              <CardContent className="flex items-center gap-3 p-3">
                <MessageCircle className="size-5 text-shepherd-sage" />
                <span className="flex-1 text-sm font-medium">Talk to {SHEP_NAME}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {recentFavorites.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Recent saves</h3>
          <div className="space-y-2">
            {recentFavorites.map((fav) => (
              <Card key={fav.id} className="py-2">
                <CardContent className="px-4 py-0">
                  <p className="text-xs font-medium text-shepherd-sage">{fav.reference}</p>
                  <p className="line-clamp-2 font-serif text-sm text-muted-foreground">
                    {fav.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {activity.length === 0 ? (
            <p className="px-4 pb-2 text-sm text-muted-foreground">
              Your chats, devotions, and Bible reading will appear here.
            </p>
          ) : (
            <ScrollArea className="max-h-56">
              <ul className="space-y-1 px-2">
                {activity.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-2 rounded-lg px-2 py-2 hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      {item.subtitle && (
                        <p className="truncate text-xs text-muted-foreground">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <CommunityFeed />
    </div>
  );
}
