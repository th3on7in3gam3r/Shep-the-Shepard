"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CommunityPost = {
  id: string;
  reference: string;
  text: string;
  authorName: string;
  createdAt: string;
};

type CommunityState = {
  posts: CommunityPost[];
  addPost: (post: Omit<CommunityPost, "id" | "createdAt" | "authorName">) => void;
  removePost: (id: string) => void;
};

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      posts: [],
      addPost: (post) => {
        let authorName = "A friend";
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("shepherd-profile");
            const parsed = raw ? JSON.parse(raw) : null;
            authorName = parsed?.state?.name?.trim() || "A friend";
          } catch {
            /* ignore */
          }
        }
        set((state) => ({
          posts: [
            {
              ...post,
              id: crypto.randomUUID(),
              authorName,
              createdAt: new Date().toISOString(),
            },
            ...state.posts,
          ].slice(0, 50),
        }));
      },
      removePost: (id) =>
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
        })),
    }),
    { name: "shepherd-community" },
  ),
);
