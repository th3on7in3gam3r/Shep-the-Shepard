"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ActivityType =
  | "chat"
  | "devotion"
  | "bible"
  | "journal"
  | "verse_saved";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  subtitle?: string;
  timestamp: string;
};

const MAX_ACTIVITY = 20;

type ActivityState = {
  items: ActivityItem[];
  logActivity: (
    item: Omit<ActivityItem, "id" | "timestamp"> & { timestamp?: string },
  ) => void;
  clearActivity: () => void;
};

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      items: [],
      logActivity: (item) => {
        const entry: ActivityItem = {
          id: crypto.randomUUID(),
          timestamp: item.timestamp ?? new Date().toISOString(),
          type: item.type,
          title: item.title,
          subtitle: item.subtitle,
        };
        set((state) => ({
          items: [entry, ...state.items.filter((i) => i.title !== item.title)].slice(
            0,
            MAX_ACTIVITY,
          ),
        }));
      },
      clearActivity: () => set({ items: [] }),
    }),
    { name: "shepherd-activity" },
  ),
);
