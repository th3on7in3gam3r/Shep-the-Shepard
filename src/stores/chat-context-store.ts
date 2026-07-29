"use client";

import { create } from "zustand";
import type { ShepChatContext } from "@/lib/chat-context";

type ChatContextState = {
  pending: ShepChatContext | null;
  activeLabel: string | null;
  setPending: (ctx: ShepChatContext | null) => void;
  consumePending: () => ShepChatContext | null;
  clearActiveLabel: () => void;
};

export const useChatContextStore = create<ChatContextState>((set, get) => ({
  pending: null,
  activeLabel: null,
  setPending: (pending) => set({ pending, activeLabel: pending?.label ?? null }),
  consumePending: () => {
    const { pending } = get();
    set({ pending: null, activeLabel: pending?.label ?? null });
    return pending;
  },
  clearActiveLabel: () => set({ activeLabel: null }),
}));
