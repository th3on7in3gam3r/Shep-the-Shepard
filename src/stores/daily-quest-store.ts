"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayKey } from "@/lib/date-utils";
import {
  type QuestTaskId,
  getQuestProgress,
  isQuestComplete,
} from "@/lib/daily-quests";
import { useStreakStore } from "@/stores/streak-store";

type CompletedTasks = Partial<Record<QuestTaskId, boolean>>;

type DailyQuestState = {
  dateKey: string;
  completedTasks: CompletedTasks;
  questCompletedAt: string | null;
  resetIfNewDay: () => void;
  completeTask: (taskId: QuestTaskId) => void;
  isTaskComplete: (taskId: QuestTaskId) => boolean;
  isQuestCompleteToday: () => boolean;
  getProgress: () => { done: number; total: number };
};

export const useDailyQuestStore = create<DailyQuestState>()(
  persist(
    (set, get) => ({
      dateKey: todayKey(),
      completedTasks: {},
      questCompletedAt: null,

      resetIfNewDay: () => {
        const today = todayKey();
        if (get().dateKey === today) return;
        set({
          dateKey: today,
          completedTasks: {},
          questCompletedAt: null,
        });
      },

      completeTask: (taskId) => {
        get().resetIfNewDay();
        const { completedTasks, questCompletedAt } = get();
        if (completedTasks[taskId]) return;

        const nextTasks = { ...completedTasks, [taskId]: true };
        const allDone = isQuestComplete(nextTasks);

        if (allDone && !questCompletedAt) {
          useStreakStore.getState().recordQuestComplete();
          set({
            completedTasks: nextTasks,
            questCompletedAt: new Date().toISOString(),
          });
          return;
        }

        set({ completedTasks: nextTasks });
      },

      isTaskComplete: (taskId) => {
        get().resetIfNewDay();
        return !!get().completedTasks[taskId];
      },

      isQuestCompleteToday: () => {
        get().resetIfNewDay();
        return !!get().questCompletedAt;
      },

      getProgress: () => {
        get().resetIfNewDay();
        return getQuestProgress(get().completedTasks);
      },
    }),
    { name: "shepherd-daily-quest" },
  ),
);
