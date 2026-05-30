"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DailyPack } from "@/lib/daily-pack";
import { todayKey } from "@/lib/date-utils";

type DailyPackState = {
  pack: DailyPack | null;
  isOfflineFallback: boolean;
  setPack: (pack: DailyPack) => void;
  setOfflineFallback: (value: boolean) => void;
  getTodayPack: () => DailyPack | null;
  clearIfStale: () => void;
};

export const useDailyPackStore = create<DailyPackState>()(
  persist(
    (set, get) => ({
      pack: null,
      isOfflineFallback: false,
      setPack: (pack) =>
        set({
          pack,
          isOfflineFallback: false,
        }),
      setOfflineFallback: (isOfflineFallback) => set({ isOfflineFallback }),
      getTodayPack: () => {
        const { pack } = get();
        if (!pack || pack.dateKey !== todayKey()) return null;
        return pack;
      },
      clearIfStale: () => {
        const { pack } = get();
        if (pack && pack.dateKey !== todayKey()) {
          set({ pack: null, isOfflineFallback: false });
        }
      },
    }),
    { name: "shepherd-daily-pack" },
  ),
);
