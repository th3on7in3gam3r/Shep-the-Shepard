"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type JourneyState = {
  dismissedIds: string[];
  dismissMemory: (id: string) => void;
};

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set) => ({
      dismissedIds: [],
      dismissMemory: (id) =>
        set((state) => ({
          dismissedIds: state.dismissedIds.includes(id)
            ? state.dismissedIds
            : [...state.dismissedIds, id],
        })),
    }),
    { name: "shepherd-journey" },
  ),
);
