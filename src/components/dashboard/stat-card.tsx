"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
};

export function StatCard({ label, value, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("border-shepherd-meadow/40 bg-shepherd-cream/20 dark:bg-card", className)}>
      <CardContent className="flex flex-col gap-1 p-3">
        <Icon className="size-4 text-shepherd-sage" />
        <p className="text-lg font-semibold tabular-nums">{value}</p>
        <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
