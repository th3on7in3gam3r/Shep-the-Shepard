"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import type { VoiceTone } from "@/stores/settings-store";
import { USER_OPENAI_KEY_HEADER } from "@/lib/openai-user-key";

export type SpeakOptions = {
  onStart?: () => void;
  onEnd?: () => void;
};

function pickBrowserVoice(
  voices: SpeechSynthesisVoice[],
  tone: VoiceTone,
): SpeechSynthesisVoice | null {
  const english = voices.filter((v) => v.lang.startsWith("en"));
  const femaleHints = [
    "samantha",
    "karen",
    "moira",
    "fiona",
    "female",
    "zira",
    "aria",
    "victoria",
  ];
  const maleHints = ["daniel", "alex", "fred", "male", "david", "james", "guy"];

  const hints =
    tone === "warm-male"
      ? maleHints
      : tone === "warm-female"
        ? femaleHints
        : [...femaleHints, ...maleHints];

  for (const name of hints) {
    const match = english.find((v) => v.name.toLowerCase().includes(name));
    if (match) return match;
  }
  return english.find((v) => !v.name.toLowerCase().includes("compact")) ?? english[0] ?? null;
}

function cleanSpeechText(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\bBaa{1,8}[!….]?\s*/gi, "")
    .replace(/🐑|💚|🙏|📖|🌿/gu, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const emptySubscribe = () => () => {};

export function useShepSpeech() {
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);
  const voiceEngine = useSettingsStore((s) => s.voiceEngine);
  const openAiVoice = useSettingsStore((s) => s.openAiVoice);
  const voiceRate = useSettingsStore((s) => s.voiceRate);
  const voicePitch = useSettingsStore((s) => s.voicePitch);
  const voiceTone = useSettingsStore((s) => s.voiceTone);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSupported = useSyncExternalStore(
    emptySubscribe,
    () => typeof window !== "undefined",
    () => false,
  );
  const browserVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const speakOptionsRef = useRef<SpeakOptions>({});

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      browserVoiceRef.current = pickBrowserVoice(
        window.speechSynthesis.getVoices(),
        voiceTone,
      );
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [voiceTone]);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    revokeObjectUrl();
    setIsSpeaking(false);
  }, [revokeObjectUrl]);

  const speakWithBrowser = useCallback(
    (cleaned: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;
      if (browserVoiceRef.current) utterance.voice = browserVoiceRef.current;

      utterance.onstart = () => {
        setIsSpeaking(true);
        speakOptionsRef.current.onStart?.();
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        speakOptionsRef.current.onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        speakOptionsRef.current.onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [voiceRate, voicePitch],
  );

  const speakWithOpenAi = useCallback(
    async (cleaned: string) => {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: (() => {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          const userKey = useSettingsStore.getState().userOpenAiApiKey.trim();
          if (userKey) headers[USER_OPENAI_KEY_HEADER] = userKey;
          return headers;
        })(),
        body: JSON.stringify({
          text: cleaned,
          voice: openAiVoice,
          speed: Math.min(1.1, Math.max(0.8, voiceRate)),
        }),
      });

      if (!response.ok) {
        throw new Error("OpenAI TTS failed");
      }

      const blob = await response.blob();
      revokeObjectUrl();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = url;
      audio.onplay = () => {
        setIsSpeaking(true);
        speakOptionsRef.current.onStart?.();
      };
      audio.onended = () => {
        setIsSpeaking(false);
        revokeObjectUrl();
        speakOptionsRef.current.onEnd?.();
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        revokeObjectUrl();
        speakOptionsRef.current.onEnd?.();
      };

      await audio.play();
    },
    [openAiVoice, voiceRate, revokeObjectUrl],
  );

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!voiceEnabled || !text.trim()) return;

      stopSpeaking();
      speakOptionsRef.current = options ?? {};
      const cleaned = cleanSpeechText(text);
      if (!cleaned) {
        options?.onEnd?.();
        return;
      }

      if (voiceEngine === "openai") {
        void speakWithOpenAi(cleaned).catch(() => speakWithBrowser(cleaned));
        return;
      }

      speakWithBrowser(cleaned);
    },
    [voiceEnabled, voiceEngine, stopSpeaking, speakWithOpenAi, speakWithBrowser],
  );

  return { isSpeaking, isSupported, speak, stopSpeaking };
}

/** @deprecated */
export const useLennySpeech = useShepSpeech;
