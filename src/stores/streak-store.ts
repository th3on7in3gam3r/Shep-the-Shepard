"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayKey, yesterdayKey } from "@/lib/date-utils";

type StreakState = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  /** @deprecated Opening the app no longer extends streak — complete the Daily Quest. */
  recordVisit: () => void;
  recordQuestComplete: () => void;
};

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,

      recordVisit: () => {
        /* streak is earned by completing the Daily Quest */
      },

      recordQuestComplete: () => {
        const today = todayKey();
        const { lastActiveDate, currentStreak, longestStreak } = get();
        if (lastActiveDate === today) return;

        let nextStreak = 1;
        if (lastActiveDate === yesterdayKey()) {
          nextStreak = currentStreak + 1;
        }

        set({
          currentStreak: nextStreak,
          longestStreak: Math.max(longestStreak, nextStreak),
          lastActiveDate: today,
        });
      },
    }),
    { name: "shepherd-streak" },
  ),
);
