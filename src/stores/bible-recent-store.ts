"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_START_HERE_OFFSETS,
  nextStartHereOffsets,
  type StartHereOffsets,
} from "@/lib/bible-start-prompts";

export type RecentPassage = {
  reference: string;
  translationId?: string;
  translationName?: string;
  readAt: string;
};

const MAX_RECENT = 8;

type BibleRecentState = {
  recent: RecentPassage[];
  startHereOffsets: StartHereOffsets;
  /** Last reference skipped when rotating Start here after a journal save. */
  startHereAvoidReference: string | null;
  addRecent: (entry: Omit<RecentPassage, "readAt">) => void;
  advanceStartHere: (avoidReference?: string) => void;
};

export const useBibleRecentStore = create<BibleRecentState>()(
  persist(
    (set, get) => ({
      recent: [],
      startHereOffsets: { ...DEFAULT_START_HERE_OFFSETS },
      startHereAvoidReference: null,
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
      advanceStartHere: (avoidReference) => {
        set({
          startHereOffsets: nextStartHereOffsets(get().startHereOffsets),
          startHereAvoidReference: avoidReference?.trim() || null,
        });
      },
    }),
    { name: "shepherd-bible-recent" },
  ),
);
