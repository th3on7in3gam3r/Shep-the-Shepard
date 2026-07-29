"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TRANSLATION } from "@/lib/bible-helloao";
import { DEFAULT_SHEP_OPENAI_VOICE } from "@/lib/shep-voice";

export type ThemePreference = "light" | "dark" | "system";
export type VoiceTone = "warm-female" | "warm-male" | "system";
export type VoiceEngine = "openai" | "browser";

type SettingsState = {
  defaultTranslation: string;
  themePreference: ThemePreference;
  voiceEnabled: boolean;
  voiceEngine: VoiceEngine;
  openAiVoice: string;
  voiceRate: number;
  voicePitch: number;
  voiceTone: VoiceTone;
  /** Optional personal OpenAI key (browser-only). Empty = use server key. */
  userOpenAiApiKey: string;
  notifyDailyVerse: boolean;
  notifyDevotion: boolean;
  highContrast: boolean;
  studyMinutesTotal: number;
  ambientSoundEnabled: boolean;
  setAmbientSoundEnabled: (enabled: boolean) => void;
  setDefaultTranslation: (id: string) => void;
  setThemePreference: (mode: ThemePreference) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceEngine: (engine: VoiceEngine) => void;
  setOpenAiVoice: (voice: string) => void;
  setVoiceRate: (rate: number) => void;
  setVoicePitch: (pitch: number) => void;
  setVoiceTone: (tone: VoiceTone) => void;
  setUserOpenAiApiKey: (key: string) => void;
  setNotifyDailyVerse: (enabled: boolean) => void;
  setNotifyDevotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  addStudyMinutes: (minutes: number) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultTranslation: DEFAULT_TRANSLATION,
      themePreference: "system",
      voiceEnabled: true,
      voiceEngine: "openai",
      openAiVoice: DEFAULT_SHEP_OPENAI_VOICE,
      voiceRate: 0.92,
      voicePitch: 1.05,
      voiceTone: "warm-female",
      userOpenAiApiKey: "",
      notifyDailyVerse: true,
      notifyDevotion: true,
      highContrast: false,
      ambientSoundEnabled: false,
      studyMinutesTotal: 0,
      setDefaultTranslation: (defaultTranslation) => set({ defaultTranslation }),
      setThemePreference: (themePreference) => set({ themePreference }),
      setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
      setVoiceEngine: (voiceEngine) => set({ voiceEngine }),
      setOpenAiVoice: (openAiVoice) => set({ openAiVoice }),
      setVoiceRate: (voiceRate) => set({ voiceRate }),
      setVoicePitch: (voicePitch) => set({ voicePitch }),
      setVoiceTone: (voiceTone) => set({ voiceTone }),
      setUserOpenAiApiKey: (userOpenAiApiKey) =>
        set({ userOpenAiApiKey: userOpenAiApiKey.trim() }),
      setNotifyDailyVerse: (notifyDailyVerse) => set({ notifyDailyVerse }),
      setNotifyDevotion: (notifyDevotion) => set({ notifyDevotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setAmbientSoundEnabled: (ambientSoundEnabled) => set({ ambientSoundEnabled }),
      addStudyMinutes: (minutes) =>
        set((state) => ({
          studyMinutesTotal: state.studyMinutesTotal + Math.max(0, minutes),
        })),
    }),
    { name: "shepherd-settings" },
  ),
);
