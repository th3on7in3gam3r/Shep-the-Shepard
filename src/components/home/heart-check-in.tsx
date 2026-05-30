"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Sun } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMoodChatContext } from "@/lib/chat-context";
import { getMoodOptions, getMoodSuggestion, type HeartMood } from "@/lib/mood-scripture";
import { cn } from "@/lib/utils";
import { useClientValue } from "@/hooks/use-is-client";
import { todayKey } from "@/lib/date-utils";
import { useChatContextStore } from "@/stores/chat-context-store";
import { useMoodStore } from "@/stores/mood-store";

export function HeartCheckIn() {
  const router = useRouter();
  const dateKey = useMoodStore((s) => s.dateKey);
  const mood = useMoodStore((s) => s.mood);
  const todayMood = useClientValue(
    () => (dateKey === todayKey() ? mood : null),
    null,
  );
  const setMood = useMoodStore((s) => s.setMood);
  const setPending = useChatContextStore((s) => s.setPending);
  const options = getMoodOptions();

  const handleSelect = (mood: HeartMood) => {
    setMood(mood);
  };

  const suggestion = todayMood ? getMoodSuggestion(todayMood) : null;

  const openChat = () => {
    if (!suggestion) return;
    setPending(
      buildMoodChatContext(suggestion.label, suggestion.chatPrompt),
    );
    router.push("/chat");
  };

  return (
    <Card className="border-shepherd-sky/25">
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="size-4 text-shepherd-sky" />
          <p className="text-sm font-medium">How&apos;s your heart today?</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {options.map(({ mood, label, emoji }) => (
            <Button
              key={mood}
              variant={todayMood === mood ? "default" : "outline"}
              size="sm"
              className={
                todayMood === mood
                  ? "h-8 bg-shepherd-sage hover:bg-shepherd-sage/90"
                  : "h-8"
              }
              onClick={() => handleSelect(mood)}
            >
              <span>{emoji}</span>
              {label}
            </Button>
          ))}
        </div>

        {suggestion && (
          <div className="rounded-xl bg-shepherd-meadow/20 px-3 py-3 space-y-2">
            <p className="font-serif text-sm leading-relaxed">
              &ldquo;{suggestion.verse.text}&rdquo;
            </p>
            <p className="text-xs font-medium text-shepherd-sage">
              {suggestion.verse.reference}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" className="h-8" onClick={openChat}>
                <MessageCircle className="size-3.5" />
                Talk with Shep
              </Button>
              <Link
                href={`/devotions?theme=${encodeURIComponent(suggestion.devotionTheme)}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8")}
              >
                <Sun className="size-3.5" />
                {suggestion.devotionTheme} devotion
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
