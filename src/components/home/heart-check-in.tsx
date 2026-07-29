"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Sun } from "lucide-react";
import { ShepAvatar } from "@/components/shep-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMoodChatContext } from "@/lib/chat-context";
import { track } from "@/lib/analytics";
import { heartMoodToShepMood } from "@/lib/mood-shep";
import {
  getMoodChipClasses,
  getMoodOptions,
  getMoodSuggestion,
  type HeartMood,
} from "@/lib/mood-scripture";
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

  const handleSelect = (selected: HeartMood) => {
    setMood(selected);
    track("mood_select", { mood: selected });
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const suggestion = todayMood ? getMoodSuggestion(todayMood) : null;
  const shepMood = todayMood ? heartMoodToShepMood(todayMood) : "idle";

  const openChat = () => {
    if (!suggestion) return;
    setPending(
      buildMoodChatContext(suggestion.label, suggestion.chatPrompt),
    );
    router.push("/chat");
  };

  return (
    <Card className="overflow-hidden border-shepherd-sky/25">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <ShepAvatar
            size="md"
            mood={shepMood}
            className={cn(
              "transition-shadow duration-300",
              todayMood && "ring-2 ring-shepherd-sage/40 shadow-[0_0_0_4px_rgba(0,0,0,0.02)]",
            )}
          />
          <div>
            <div className="flex items-center gap-2">
              <Heart className="size-4 text-shepherd-sky" aria-hidden />
              <p className="text-sm font-medium">How&apos;s your heart today?</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Tap a mood — Shep will meet you there.
            </p>
          </div>
        </div>

        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          role="group"
          aria-label="Mood check-in"
        >
          {options.map(({ mood: optionMood, label, emoji }) => {
            const selected = todayMood === optionMood;
            return (
              <button
                key={optionMood}
                type="button"
                aria-pressed={selected}
                aria-label={`${label}${selected ? ", selected" : ""}`}
                onClick={() => handleSelect(optionMood)}
                className={cn(
                  "flex min-h-[3.5rem] flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2 py-2.5 text-center transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shepherd-sage focus-visible:ring-offset-2",
                  "active:scale-[0.97] motion-safe:hover:scale-[1.02]",
                  getMoodChipClasses(optionMood, selected),
                )}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {emoji}
                </span>
                <span className="text-[11px] font-medium leading-tight">{label}</span>
              </button>
            );
          })}
        </div>

        {suggestion && (
          <div
            key={suggestion.mood}
            className="space-y-3 rounded-2xl border border-shepherd-sage/15 bg-shepherd-meadow/30 px-3.5 py-3.5 motion-safe:animate-mood-reveal dark:bg-shepherd-sage/15"
          >
            <p className="text-xs font-medium text-shepherd-sage">
              {suggestion.emoji} {suggestion.label} — here&apos;s a word for you
            </p>
            <p className="font-serif text-[0.95rem] leading-[1.65] tracking-wide text-foreground/90">
              &ldquo;{suggestion.verse.text}&rdquo;
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              {suggestion.verse.reference}
            </p>
            <div className="flex flex-wrap gap-2 pt-0.5">
              <Button size="sm" className="h-9 min-w-[8rem] bg-shepherd-sage hover:bg-shepherd-sage/90" onClick={openChat}>
                <MessageCircle className="size-3.5" />
                Talk with Shep
              </Button>
              <Link
                href={`/devotions?theme=${encodeURIComponent(suggestion.devotionTheme)}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9")}
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
