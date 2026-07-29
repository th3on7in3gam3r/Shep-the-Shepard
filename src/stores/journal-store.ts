"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type JournalEntry = {
  id: string;
  content: string;
  reference?: string;
  chatSnippet?: string;
  createdAt: string;
  updatedAt: string;
};

type JournalState = {
  entries: JournalEntry[];
  addEntry: (entry: {
    content: string;
    reference?: string;
    chatSnippet?: string;
  }) => void;
  updateEntry: (id: string, content: string) => void;
  removeEntry: (id: string) => void;
};

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: ({ content, reference, chatSnippet }) => {
        const now = new Date().toISOString();
        set((state) => ({
          entries: [
            {
              id: crypto.randomUUID(),
              content: content.trim(),
              reference: reference?.trim() || undefined,
              chatSnippet: chatSnippet?.trim() || undefined,
              createdAt: now,
              updatedAt: now,
            },
            ...state.entries,
          ],
        }));
      },
      updateEntry: (id, content) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id
              ? { ...e, content: content.trim(), updatedAt: new Date().toISOString() }
              : e,
          ),
        })),
      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),
    }),
    { name: "shepherd-journal" },
  ),
);
