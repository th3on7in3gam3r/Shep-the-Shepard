"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HeartMood } from "@/lib/mood-scripture";
import { todayKey } from "@/lib/date-utils";

type MoodState = {
  dateKey: string;
  mood: HeartMood | null;
  setMood: (mood: HeartMood) => void;
  getTodayMood: () => HeartMood | null;
};

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      dateKey: "",
      mood: null,
      setMood: (mood) =>
        set({
          mood,
          dateKey: todayKey(),
        }),
      getTodayMood: () => {
        const { dateKey, mood } = get();
        return dateKey === todayKey() ? mood : null;
      },
    }),
    { name: "shepherd-mood" },
  ),
);
