"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VersePrayer = {
  id: string;
  reference: string;
  favoriteId?: string;
  audioDataUrl: string;
  mimeType: string;
  durationMs: number;
  recordedAt: string;
};

type VersePrayerState = {
  prayers: VersePrayer[];
  addPrayer: (prayer: Omit<VersePrayer, "id" | "recordedAt">) => void;
  removePrayer: (id: string) => void;
  getPrayersForReference: (reference: string) => VersePrayer[];
};

export const useVersePrayerStore = create<VersePrayerState>()(
  persist(
    (set, get) => ({
      prayers: [],
      addPrayer: (prayer) =>
        set((state) => ({
          prayers: [
            {
              ...prayer,
              id: crypto.randomUUID(),
              recordedAt: new Date().toISOString(),
            },
            ...state.prayers,
          ].slice(0, 50),
        })),
      removePrayer: (id) =>
        set((state) => ({
          prayers: state.prayers.filter((p) => p.id !== id),
        })),
      getPrayersForReference: (reference) =>
        get()
          .prayers.filter(
            (p) => p.reference.toLowerCase() === reference.toLowerCase(),
          )
          .sort(
            (a, b) =>
              new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
          ),
    }),
    { name: "shepherd-verse-prayers" },
  ),
);
