"use client";

import Link from "next/link";
import { ChevronRight, Flame, Heart, MessageCircle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useStreakStore } from "@/stores/streak-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useChatStore } from "@/stores/chat-store";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { todayKey } from "@/lib/date-utils";

export function FaithStatsStrip() {
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const longestStreak = useStreakStore((s) => s.longestStreak);
  const favorites = useFavoritesStore((s) => s.favorites);
  const messages = useChatStore((s) => s.messages);
  const questComplete = useDailyQuestStore(
    (s) => s.dateKey === todayKey() && !!s.questCompletedAt,
  );
  const chatCount = messages.filter((m) => m.role === "user").length;

  const showStreakPrompt = currentStreak === 0 && !questComplete;

  if (showStreakPrompt) {
    return (
      <Link href="/profile" className="block">
        <Card className="border-dashed border-shepherd-sage/35 bg-shepherd-meadow/15 transition-colors hover:bg-shepherd-meadow/25 dark:bg-card">
          <CardContent className="flex items-center gap-3 py-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-shepherd-sage/15">
              <Sparkles className="size-5 text-shepherd-sage" />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-medium">Start your faith streak</p>
              <p className="text-xs text-muted-foreground">
                Complete today&apos;s Daily Quest — all three tasks — to begin day 1.
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  const stats = [
    { label: "Day streak", value: currentStreak, icon: Flame },
    { label: "Best streak", value: longestStreak, icon: Flame },
    { label: "Saved verses", value: favorites.length, icon: Heart },
    { label: "Chats", value: chatCount, icon: MessageCircle },
  ];

  return (
    <Link href="/profile" className="block">
      <Card className="bg-shepherd-cream/30 transition-colors hover:bg-shepherd-meadow/25 dark:bg-card">
        <CardContent className="grid grid-cols-4 gap-2 py-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto mb-0.5 size-3.5 text-shepherd-sage" />
              <p className="text-base font-semibold tabular-nums">{value}</p>
              <p className="text-[9px] leading-tight text-muted-foreground">{label}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </Link>
  );
}
