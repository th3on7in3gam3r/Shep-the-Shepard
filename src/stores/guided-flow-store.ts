"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GuidedFlowId } from "@/lib/guided-flows";

export type FlowVerseContext = {
  reference: string;
  text: string;
  translation: string;
};

type GuidedFlowState = {
  activeFlowId: GuidedFlowId | null;
  stepIndex: number;
  verseContext: FlowVerseContext | null;
  startFlow: (id: GuidedFlowId, verseContext?: FlowVerseContext) => void;
  nextStep: () => void;
  endFlow: () => void;
};

export const useGuidedFlowStore = create<GuidedFlowState>()(
  persist(
    (set, get) => ({
      activeFlowId: null,
      stepIndex: 0,
      verseContext: null,
      startFlow: (id, verseContext) =>
        set({
          activeFlowId: id,
          stepIndex: 0,
          verseContext: verseContext ?? null,
        }),
      nextStep: () => {
        const { stepIndex } = get();
        set({ stepIndex: stepIndex + 1 });
      },
      endFlow: () =>
        set({
          activeFlowId: null,
          stepIndex: 0,
          verseContext: null,
        }),
    }),
    {
      name: "shepherd-guided-flow",
      partialize: (s) => ({
        activeFlowId: s.activeFlowId,
        stepIndex: s.stepIndex,
        verseContext: s.verseContext,
      }),
    },
  ),
);
