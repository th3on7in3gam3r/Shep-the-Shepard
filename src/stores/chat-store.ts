"use client";

import type { UIMessage } from "ai";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dedupeChatMessages } from "@/lib/chat-utils";

type ChatState = {
  messages: UIMessage[];
  autoSpeak: boolean;
  continuousListen: boolean;
  showTextInput: boolean;
  setMessages: (messages: UIMessage[]) => void;
  clearMessages: () => void;
  setAutoSpeak: (value: boolean) => void;
  setContinuousListen: (value: boolean) => void;
  setShowTextInput: (value: boolean) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      autoSpeak: true,
      continuousListen: false,
      showTextInput: false,
      setMessages: (messages) => set({ messages: dedupeChatMessages(messages) }),
      clearMessages: () => set({ messages: [] }),
      setAutoSpeak: (autoSpeak) => set({ autoSpeak }),
      setContinuousListen: (continuousListen) => set({ continuousListen }),
      setShowTextInput: (showTextInput) => set({ showTextInput }),
    }),
    { name: "shepherd-chat", merge: (persisted, current) => {
      const saved = persisted as Partial<ChatState> | undefined;
      return {
        ...current,
        ...saved,
        messages: dedupeChatMessages(saved?.messages ?? []),
      };
    } },
  ),
);
