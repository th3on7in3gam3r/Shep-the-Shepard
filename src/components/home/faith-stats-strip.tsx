"use client";

import Link from "next/link";
import { Flame, Heart, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useStreakStore } from "@/stores/streak-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useChatStore } from "@/stores/chat-store";

export function FaithStatsStrip() {
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const favorites = useFavoritesStore((s) => s.favorites);
  const messages = useChatStore((s) => s.messages);
  const chatCount = messages.filter((m) => m.role === "user").length;

  const stats = [
    { label: "Day streak", value: currentStreak, icon: Flame },
    { label: "Saved verses", value: favorites.length, icon: Heart },
    { label: "Chats with Shep", value: chatCount, icon: MessageCircle },
  ];

  return (
    <Link href="/profile" className="block">
      <Card className="bg-shepherd-cream/30 transition-colors hover:bg-shepherd-meadow/25 dark:bg-card">
        <CardContent className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto mb-1 size-4 text-shepherd-sage" />
              <p className="text-lg font-semibold tabular-nums">{value}</p>
              <p className="text-[10px] leading-tight text-muted-foreground">{label}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </Link>
  );
}
