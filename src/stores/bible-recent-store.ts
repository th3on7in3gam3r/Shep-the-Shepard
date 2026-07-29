"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RecentPassage = {
  reference: string;
  translationId?: string;
  translationName?: string;
  readAt: string;
};

const MAX_RECENT = 8;

type BibleRecentState = {
  recent: RecentPassage[];
  addRecent: (entry: Omit<RecentPassage, "readAt">) => void;
};

export const useBibleRecentStore = create<BibleRecentState>()(
  persist(
    (set, get) => ({
      recent: [],
      addRecent: (entry) => {
        const reference = entry.reference.trim();
        if (!reference) return;
        const next: RecentPassage = {
          reference,
          translationId: entry.translationId,
          translationName: entry.translationName,
          readAt: new Date().toISOString(),
        };
        const filtered = get().recent.filter(
          (r) => r.reference.toLowerCase() !== reference.toLowerCase(),
        );
        set({ recent: [next, ...filtered].slice(0, MAX_RECENT) });
      },
    }),
    { name: "shepherd-bible-recent" },
  ),
);
