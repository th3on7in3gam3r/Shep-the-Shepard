"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Flame,
  MessageCircle,
  PenLine,
  Sparkles,
  Sun,
} from "lucide-react";
import { track } from "@/lib/analytics";
import { todayKey } from "@/lib/date-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ShepAvatar } from "@/components/shep-avatar";
import { cn } from "@/lib/utils";
import {
  DAILY_QUEST_TASKS,
  getDailyQuestTheme,
  getQuestProgress,
  type QuestTask,
} from "@/lib/daily-quests";
import { getSeasonInfo } from "@/lib/church-calendar";
import { getSeasonalShepLine } from "@/lib/seasonal-content";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { useStreakStore } from "@/stores/streak-store";

type DailyQuestCardProps = {
  className?: string;
  compact?: boolean;
  /** Show primary Continue / open quest CTA (profile hub). */
  showContinueCta?: boolean;
  /** Soft streak line under the ring (replaces standalone streak banner). */
  streakMessage?: string;
};

const TASK_ICONS = {
  "book-open": BookOpen,
  sun: Sun,
  "message-circle": MessageCircle,
  "pen-line": PenLine,
} as const;

function QuestProgressRing({
  done,
  total,
  complete,
  glow,
}: {
  done: number;
  total: number;
  complete: boolean;
  glow: boolean;
}) {
  const size = 88;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? done / total : 0;
  const offset = circumference * (1 - pct);

  return (
    <div
      className={cn(
        "relative flex size-[5.5rem] shrink-0 items-center justify-center",
        glow && "motion-safe:animate-quest-ring-glow",
      )}
      role="img"
      aria-label={`${done} of ${total} quest tasks complete`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-shepherd-meadow/70 dark:text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] duration-700 ease-out",
            complete ? "text-shepherd-amber" : "text-shepherd-sage",
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-heading text-lg font-semibold tabular-nums leading-none text-foreground">
          {done}/{total}
        </span>
        <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
          {complete ? "Done" : "tasks"}
        </span>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  done,
  compact,
}: {
  task: QuestTask;
  done: boolean;
  compact: boolean;
}) {
  const Icon = TASK_ICONS[task.icon];

  return (
    <Link
      href={done ? "#" : task.href}
      onClick={(e) => done && e.preventDefault()}
      aria-label={done ? `${task.label} — complete` : task.label}
      className={cn(
        "flex flex-col gap-1.5 rounded-2xl border px-3 py-2.5 transition-all",
        compact ? "min-h-[3.75rem]" : "min-h-[4.5rem]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shepherd-sage focus-visible:ring-offset-2",
        done
          ? "border-shepherd-sage/25 bg-shepherd-sage/10"
          : "border-shepherd-sage/15 bg-background/70 hover:border-shepherd-sage/35 hover:bg-shepherd-meadow/30 active:scale-[0.98]",
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-xl",
            done ? "bg-shepherd-sage/20 text-shepherd-sage" : "bg-shepherd-meadow/50 text-shepherd-sage",
          )}
        >
          {done ? <Check className="size-4" strokeWidth={2.5} /> : <Icon className="size-4" />}
        </span>
        {!done && (
          <span className="mt-1 size-2 rounded-full bg-shepherd-amber/80" aria-hidden />
        )}
      </div>
      <p
        className={cn(
          "text-xs font-semibold leading-snug",
          done && "text-muted-foreground line-through decoration-shepherd-sage/40",
        )}
      >
        {task.label}
      </p>
      {!compact && !done && (
        <p className="text-[10px] leading-snug text-muted-foreground">{task.description}</p>
      )}
    </Link>
  );
}

export function DailyQuestCard({
  className,
  compact = false,
  showContinueCta = false,
  streakMessage,
}: DailyQuestCardProps) {
  const completedTasks = useDailyQuestStore((s) => s.completedTasks);
  const questCompletedAt = useDailyQuestStore((s) => s.questCompletedAt);
  const currentStreak = useStreakStore((s) => s.currentStreak);

  const theme = getDailyQuestTheme();
  const season = getSeasonInfo();
  const seasonalCompleteLine = getSeasonalShepLine("quest-complete");
  const { done, total } = getQuestProgress(completedTasks);
  const complete = !!questCompletedAt;
  const inProgress = done > 0 && !complete;
  const nextTask = DAILY_QUEST_TASKS.find((task) => !completedTasks[task.id]);
  const continueHref = complete
    ? "/#daily-quest"
    : (nextTask?.href ?? "/#daily-quest");
  const continueLabel = complete
    ? "Back to Home"
    : inProgress
      ? "Continue"
      : "Open today’s quest";
  const notStarted = done === 0 && !complete;
  /** One Shep encouragement — only before any tasks are done. */
  const showShepStreakStrip = Boolean(streakMessage) && notStarted;
  const badgeLabel =
    currentStreak > 0
      ? `${currentStreak} day${currentStreak === 1 ? "" : "s"}`
      : inProgress
        ? "On your way"
        : "Start today";
  const ringHeadline = complete
    ? "Quest complete!"
    : inProgress
      ? "Continue where you left off"
      : "Four gentle steps today";
  const ringSupport = complete
    ? currentStreak > 0
      ? `Beautifully done — your ${currentStreak}-day streak continues.`
      : "Beautifully done. Come back tomorrow to begin a streak."
    : inProgress
      ? `${done} of ${total} finished — you’ve got this.`
      : "Tap a card to begin. Small faithfulness adds up.";
  const tightLayout = compact || showContinueCta;
  const [celebrate, setCelebrate] = useState(false);
  const [taskGlow, setTaskGlow] = useState(false);
  const celebratedRef = useRef<string | null>(null);
  const prevDoneRef = useRef(done);

  useEffect(() => {
    if (!complete) return;
    const key = todayKey();
    if (celebratedRef.current === key) return;
    celebratedRef.current = key;
    setCelebrate(true);
    track("quest_complete", { streak: currentStreak });
    const timer = setTimeout(() => setCelebrate(false), 2400);
    return () => clearTimeout(timer);
  }, [complete, currentStreak]);

  useEffect(() => {
    if (done > prevDoneRef.current && done > 0 && !complete) {
      setTaskGlow(true);
      const t = setTimeout(() => setTaskGlow(false), 1200);
      prevDoneRef.current = done;
      return () => clearTimeout(t);
    }
    prevDoneRef.current = done;
  }, [done, complete]);

  return (
    <Card
      id="daily-quest"
      className={cn(
        "scroll-mt-24 bg-gradient-to-br from-shepherd-meadow/35 via-shepherd-cream/55 to-shepherd-sky/20 dark:from-shepherd-sage/15 dark:via-card dark:to-card",
        celebrate && "animate-quest-complete-pop ring-2 ring-shepherd-amber/45",
        className,
      )}
    >
      <CardHeader className={cn(compact && "pt-4", tightLayout && "pb-3")}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-4 text-shepherd-amber" />
            Daily Quest
          </CardTitle>
          <Badge
            variant="outline"
            className="gap-1 border-shepherd-sage/30 bg-background/60 text-[10px] font-medium"
          >
            <Flame className="size-3 text-shepherd-amber" />
            {badgeLabel}
          </Badge>
        </div>
        <p className="text-xs font-medium text-shepherd-sage">{theme.title}</p>
        {season && (
          <Badge variant="secondary" className="w-fit gap-1 text-[10px] font-medium">
            {season.emoji} {season.label} · Day {season.dayInSeason}
          </Badge>
        )}
        {!compact && (
          <p className="text-xs leading-relaxed text-muted-foreground">{theme.prompt}</p>
        )}
      </CardHeader>

      <CardContent className={cn(tightLayout ? "space-y-3" : "space-y-4")}>
        <div className="flex items-center gap-4">
          <QuestProgressRing
            done={complete ? total : done}
            total={total}
            complete={complete}
            glow={celebrate || taskGlow}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{ringHeadline}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {ringSupport}
            </p>
          </div>
        </div>

        {showShepStreakStrip && (
          <div className="flex items-center gap-3 rounded-xl bg-shepherd-cream/60 px-3 py-2.5 ring-1 ring-shepherd-sage/15 dark:bg-shepherd-sage/10">
            <ShepAvatar size="sm" animated mood="happy" />
            <p className="text-xs leading-relaxed text-foreground/90">{streakMessage}</p>
          </div>
        )}

        {showContinueCta && (
          <Link
            href={continueHref}
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full bg-shepherd-sage hover:bg-shepherd-sage/90",
            )}
          >
            {continueLabel}
          </Link>
        )}

        <ul className={cn("grid grid-cols-2", tightLayout ? "gap-1.5" : "gap-2")}>
          {DAILY_QUEST_TASKS.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                done={!!completedTasks[task.id]}
                compact={compact}
              />
            </li>
          ))}
        </ul>

        {complete && (
          <div className="flex items-center gap-3 rounded-xl bg-shepherd-amber/15 px-3 py-2.5 ring-1 ring-shepherd-amber/25">
            <ShepAvatar size="sm" mood="happy" />
            <p className="text-xs leading-relaxed text-foreground/90">
              {seasonalCompleteLine ?? (
                <>
                  You finished today&apos;s quest
                  {currentStreak > 0 && (
                    <>
                      {" "}
                      — <span className="font-semibold">{currentStreak}-day streak</span>
                    </>
                  )}
                  . See you tomorrow!
                </>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
