"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-shepherd-meadow/35 bg-shepherd-cream/25 shadow-none dark:bg-card",
        className,
      )}
    >
      <CardContent className="flex flex-col gap-1 p-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-shepherd-meadow/45 text-shepherd-sage dark:bg-shepherd-sage/15">
          <Icon className="size-3.5" />
        </span>
        <p className="font-heading text-lg font-semibold tabular-nums leading-none text-foreground">
          {value}
        </p>
        <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>
        {hint && (
          <p className="text-[10px] leading-snug text-shepherd-sage/90">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
