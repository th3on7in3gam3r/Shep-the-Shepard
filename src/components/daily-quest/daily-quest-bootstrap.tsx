"use client";

import { useEffect } from "react";
import { useDailyQuestStore } from "@/stores/daily-quest-store";

/** Resets quest progress at local midnight and keeps the store in sync. */
export function DailyQuestBootstrap() {
  const resetIfNewDay = useDailyQuestStore((s) => s.resetIfNewDay);

  useEffect(() => {
    resetIfNewDay();
  }, [resetIfNewDay]);

  return null;
}
