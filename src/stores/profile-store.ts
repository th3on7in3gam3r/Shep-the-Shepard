"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProfileState = {
  name: string;
  bio: string;
  photoUrl: string | null;
  onboardingComplete: boolean;
  setName: (name: string) => void;
  setBio: (bio: string) => void;
  setPhotoUrl: (photoUrl: string | null) => void;
  completeOnboarding: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: "",
      bio: "",
      photoUrl: null,
      onboardingComplete: false,
      setName: (name) => set({ name: name.trim() }),
      setBio: (bio) => set({ bio: bio.trim() }),
      setPhotoUrl: (photoUrl) => set({ photoUrl }),
      completeOnboarding: () => set({ onboardingComplete: true }),
    }),
    { name: "shepherd-profile" },
  ),
);

export function getDisplayName(name: string): string {
  return name.trim() || "friend";
}
