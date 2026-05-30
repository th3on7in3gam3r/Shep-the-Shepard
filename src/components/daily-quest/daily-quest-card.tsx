"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, Circle, Flame, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShepAvatar } from "@/components/shep-avatar";
import { cn } from "@/lib/utils";
import {
  DAILY_QUEST_TASKS,
  getDailyQuestTheme,
  getQuestProgress,
} from "@/lib/daily-quests";
import { getSeasonInfo } from "@/lib/church-calendar";
import { getSeasonalShepLine } from "@/lib/seasonal-content";
import { useDailyQuestStore } from "@/stores/daily-quest-store";
import { useStreakStore } from "@/stores/streak-store";

type DailyQuestCardProps = {
  className?: string;
  compact?: boolean;
};

export function DailyQuestCard({ className, compact = false }: DailyQuestCardProps) {
  const completedTasks = useDailyQuestStore((s) => s.completedTasks);
  const questCompletedAt = useDailyQuestStore((s) => s.questCompletedAt);
  const currentStreak = useStreakStore((s) => s.currentStreak);

  const theme = getDailyQuestTheme();
  const season = getSeasonInfo();
  const seasonalCompleteLine = getSeasonalShepLine("quest-complete");
  const { done, total } = getQuestProgress(completedTasks);
  const complete = !!questCompletedAt;
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-shepherd-meadow/35 via-shepherd-cream/50 to-shepherd-sky/20 dark:from-shepherd-sage/15 dark:via-card dark:to-card",
        className,
      )}
    >
      <CardHeader className={cn(compact && "pt-4")}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-4 text-shepherd-sage" />
            Daily Quest
          </CardTitle>
          <Badge
            variant="outline"
            className="gap-1 border-shepherd-sage/30 bg-background/60 text-[10px] font-medium"
          >
            <Flame className="size-3 text-orange-500" />
            {currentStreak} day{currentStreak === 1 ? "" : "s"}
          </Badge>
        </div>
        <p className="text-xs font-medium text-shepherd-sage">{theme.title}</p>
        {season && (
          <Badge
            variant="secondary"
            className="w-fit gap-1 text-[10px] font-medium"
          >
            {season.emoji} {season.label} · Day {season.dayInSeason}
          </Badge>
        )}
        {!compact && (
          <p className="text-xs text-muted-foreground">{theme.prompt}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {complete ? "Quest complete!" : `${done} of ${total} tasks`}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/80">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                complete
                  ? "bg-shepherd-sage"
                  : "bg-gradient-to-r from-shepherd-sage to-shepherd-sky",
              )}
              style={{ width: `${complete ? 100 : progressPct}%` }}
            />
          </div>
        </div>

        <ul className="space-y-1.5">
          {DAILY_QUEST_TASKS.map((task) => {
            const doneTask = !!completedTasks[task.id];
            const Icon = doneTask ? CheckCircle2 : Circle;

            return (
              <li key={task.id}>
                <Link
                  href={doneTask ? "#" : task.href}
                  onClick={(e) => doneTask && e.preventDefault()}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 transition-colors",
                    doneTask
                      ? "border-shepherd-sage/20 bg-shepherd-sage/10"
                      : "border-shepherd-sage/10 hover:border-shepherd-sage/25 hover:bg-shepherd-meadow/25 active:bg-shepherd-meadow/35",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      doneTask ? "text-shepherd-sage" : "text-muted-foreground/50",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium leading-tight",
                        doneTask && "text-muted-foreground line-through",
                      )}
                    >
                      {task.label}
                    </p>
                    {!compact && !doneTask && (
                      <p className="text-[11px] text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                  </div>
                  {!doneTask && (
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {complete && (
          <div className="flex items-center gap-3 rounded-xl bg-shepherd-sage/15 px-3 py-2.5">
            <ShepAvatar size="sm" mood="happy" />
            <p className="text-xs leading-relaxed text-foreground/90">
              {seasonalCompleteLine ?? (
                <>
                  Baa! You finished today&apos;s quest
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
