"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FavoriteVerse = {
  id: string;
  reference: string;
  text: string;
  translation?: string;
  tag?: string;
  savedAt: string;
};

type FavoritesState = {
  favorites: FavoriteVerse[];
  addFavorite: (verse: Omit<FavoriteVerse, "id" | "savedAt">) => void;
  removeFavorite: (id: string) => void;
  updateFavoriteTag: (id: string, tag: string) => void;
  isFavorite: (reference: string) => boolean;
  getTags: () => string[];
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (verse) => {
        const exists = get().favorites.some(
          (f) => f.reference.toLowerCase() === verse.reference.toLowerCase(),
        );
        if (exists) return;
        set((state) => ({
          favorites: [
            {
              ...verse,
              id: crypto.randomUUID(),
              savedAt: new Date().toISOString(),
            },
            ...state.favorites,
          ],
        }));
      },
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),
      updateFavoriteTag: (id, tag) =>
        set((state) => ({
          favorites: state.favorites.map((f) =>
            f.id === id ? { ...f, tag: tag.trim() || undefined } : f,
          ),
        })),
      isFavorite: (reference) =>
        get().favorites.some(
          (f) => f.reference.toLowerCase() === reference.toLowerCase(),
        ),
      getTags: () => {
        const tags = new Set<string>();
        for (const f of get().favorites) {
          if (f.tag) tags.add(f.tag);
        }
        return [...tags].sort();
      },
    }),
    { name: "shepherd-favorites" },
  ),
);
